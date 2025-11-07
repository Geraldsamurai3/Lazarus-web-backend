import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    // Registrar helper personalizado para Handlebars
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Cargar templates
    this.loadTemplates();
  }

  /**
   * Cargar todos los templates .hbs al iniciar
   */
  private loadTemplates() {
    // Intentar desde dist/ primero (producción), luego desde src/ (desarrollo)
    const possiblePaths = [
      path.join(__dirname, 'templates'),           // dist/email/templates
      path.join(__dirname, '..', '..', 'src', 'email', 'templates'),  // src/email/templates desde dist
      path.join(process.cwd(), 'src', 'email', 'templates'),          // src/email/templates desde raíz
    ];

    let templatesDir = '';
    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        templatesDir = dir;
        this.logger.log(`Templates encontrados en: ${dir}`);
        break;
      }
    }

    if (!templatesDir) {
      this.logger.error('No se encontró el directorio de templates');
      return;
    }

    const templateFiles = [
      'welcome.hbs',
      'incident-status-change.hbs',
      'strike.hbs',
      'password-reset.hbs',
      'account-reactivated.hbs'
    ];

    templateFiles.forEach(file => {
      try {
        const filePath = path.join(templatesDir, file);
        const templateContent = fs.readFileSync(filePath, 'utf8');
        const templateName = file.replace('.hbs', '');
        this.templates.set(templateName, Handlebars.compile(templateContent));
        this.logger.log(`Template cargado: ${templateName}`);
      } catch (error) {
        this.logger.error(`Error cargando template ${file}:`, error.message);
      }
    });
  }

  /**
   * Email de bienvenida al registrarse
   */
  async sendWelcomeEmail(email: string, nombre: string, userType: string) {
    const subject = '🎉 Bienvenido a Lazarus - Sistema de Gestión de Emergencias';
    
    const template = this.templates.get('welcome');
    if (!template) {
      this.logger.error('Template "welcome" no encontrado');
      return false;
    }

    const html = template({
      nombre,
      email,
      userTypeLabel: this.getUserTypeLabel(userType),
      features: this.getWelcomeFeatures(userType),
    });

    return this.sendEmail(email, subject, html);
  }

  /**
   * Email de cambio de estado de incidente
   */
  async sendIncidentStatusChangeEmail(
    email: string,
    nombre: string,
    incidentId: number,
    oldStatus: string,
    newStatus: string,
    descripcion: string,
  ) {
    const subject = `🔔 Estado de tu incidente #${incidentId} actualizado`;
    
    const template = this.templates.get('incident-status-change');
    if (!template) {
      this.logger.error('Template "incident-status-change" no encontrado');
      return false;
    }

    const statusInfo = this.getStatusInfo(newStatus);
    
    const html = template({
      nombre,
      incidentId,
      descripcion,
      oldStatus,
      oldStatusLabel: this.translateStatus(oldStatus),
      newStatus,
      newStatusLabel: this.translateStatus(newStatus),
      statusMessage: statusInfo.message,
      statusClass: statusInfo.class,
    });

    return this.sendEmail(email, subject, html);
  }

  /**
   * Email de strike recibido
   */
  async sendStrikeEmail(
    email: string,
    nombre: string,
    currentStrikes: number,
    incidentId: number,
  ) {
    const isDisabled = currentStrikes >= 3;
    const subject = isDisabled
      ? '🚫 Tu cuenta ha sido deshabilitada - 3 Strikes' 
      : `⚠️ Has recibido un strike (${currentStrikes}/3)`;
    
    const template = this.templates.get('strike');
    if (!template) {
      this.logger.error('Template "strike" no encontrado');
      return false;
    }

    const html = template({
      nombre,
      currentStrikes,
      incidentId,
      isDisabled,
      headerIcon: isDisabled ? '🚫' : '⚠️',
      headerTitle: isDisabled ? 'Cuenta Deshabilitada' : 'Strike Recibido',
      headerColor: isDisabled ? '#F44336' : '#FF9800',
    });

    return this.sendEmail(email, subject, html);
  }

  /**
   * Email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string, nombre: string, resetToken: string) {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=${resetToken}`;
    const subject = '🔐 Recuperación de Contraseña - Lazarus';
    
    const template = this.templates.get('password-reset');
    if (!template) {
      this.logger.error('Template "password-reset" no encontrado');
      return false;
    }

    const html = template({
      nombre,
      resetUrl,
    });

    return this.sendEmail(email, subject, html);
  }

  /**
   * Email de cuenta reactivada (reducción de strikes de 3 a 2)
   */
  async sendAccountReactivatedEmail(
    email: string,
    nombre: string,
    currentStrikes: number,
  ) {
    const subject = '✅ Tu cuenta ha sido reactivada - Última oportunidad';
    
    let template = this.templates.get('account-reactivated');
    
    // Si no está cargado, intentar cargarlo dinámicamente
    if (!template) {
      this.logger.warn('Template "account-reactivated" no encontrado en caché, intentando cargar...');
      this.loadTemplates(); // Recargar todos los templates
      template = this.templates.get('account-reactivated');
      
      if (!template) {
        this.logger.error('Template "account-reactivated" no encontrado después de recargar');
        return false;
      }
    }

    const html = template({
      nombre,
      currentStrikes,
    });

    return this.sendEmail(email, subject, html);
  }

  /**
   * Método privado para enviar email
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Lazarus Sistema" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado exitosamente a ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error);
      return false;
    }
  }

  /**
   * Helpers para generar contenido dinámico
   */
  private getUserTypeLabel(userType: string): string {
    const labels: Record<string, string> = {
      CIUDADANO: 'Ciudadano',
      ENTIDAD: 'Entidad de Emergencia',
      ADMIN: 'Administrador',
    };
    return labels[userType] || userType;
  }

  private getWelcomeFeatures(userType: string): string {
    const features: Record<string, string> = {
      CIUDADANO: `
        <li>📍 Reportar incidentes de emergencia</li>
        <li>🗺️ Ver incidentes cercanos en tiempo real</li>
        <li>🔔 Recibir notificaciones de actualización</li>
        <li>📊 Consultar el historial de tus reportes</li>
      `,
      ENTIDAD: `
        <li>🚨 Ver todos los incidentes reportados</li>
        <li>✅ Cambiar estado de incidentes</li>
        <li>📍 Actualizar tu ubicación en tiempo real</li>
        <li>📊 Acceder a estadísticas del sistema</li>
      `,
      ADMIN: `
        <li>👥 Gestionar usuarios del sistema</li>
        <li>🚨 Supervisar todos los incidentes</li>
        <li>📊 Acceder a estadísticas completas</li>
        <li>🔧 Administrar el sistema completo</li>
      `,
    };
    return features[userType] || features['CIUDADANO'];
  }

  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_PROCESO: 'En Proceso',
      RESUELTO: 'Resuelto',
      CANCELADO: 'Cancelado',
    };
    return translations[status] || status;
  }

  private getStatusInfo(status: string): { message: string; class: string } {
    const statusMap: Record<string, { message: string; class: string }> = {
      EN_PROCESO: {
        message: '<p><strong>✅ Tu incidente está siendo atendido.</strong></p><p>Una entidad de emergencia está trabajando en resolver esta situación.</p>',
        class: '',
      },
      RESUELTO: {
        message: '<p><strong>🎉 Tu incidente ha sido resuelto exitosamente.</strong></p><p>Gracias por tu colaboración para mantener segura nuestra comunidad.</p>',
        class: '',
      },
      CANCELADO: {
        message: '<p><strong>⚠️ Tu incidente fue marcado como FALSO o SPAM.</strong></p><p>Has recibido un strike. Por favor, reporta solo emergencias reales y verificables.</p>',
        class: 'warning',
      },
    };
    return statusMap[status] || { message: '', class: '' };
  }
}
