import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Administrador } from '../users/entity/administrador.entity';

async function seedAdmin() {
  // Configuración de conexión a la base de datos (MariaDB compatible)
  const dataSource = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'lazarus',
    entities: [Administrador],
    synchronize: false,
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conectado correctamente\n');

    const adminRepository = dataSource.getRepository(Administrador);

    // Verificar si ya existe algún administrador
    const existingAdmins = await adminRepository.count();
    
    if (existingAdmins > 0) {
      console.log('⚠️  Ya existen administradores en el sistema');
      console.log(`   Total de admins: ${existingAdmins}`);
      console.log('\n❌ No se creará un nuevo admin para evitar duplicados');
      console.log('   Si necesitas crear más admins, usa el endpoint protegido\n');
      await dataSource.destroy();
      return;
    }

    console.log('📝 Creando administrador inicial...\n');

    // Datos del administrador inicial
    const adminData = {
      nombre: 'Super',
      apellidos: 'Admin',
      email: 'admin@lazarus.com',
      contraseña: 'Admin2025!',
      nivel_acceso: 'SUPER_ADMIN' as any,
      provincia: 'San José',
      canton: 'Central',
      distrito: 'Carmen',
      activo: true,
    };

    // Hashear la contraseña
    console.log('🔒 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(adminData.contraseña, 10);

    // Crear el administrador
    const admin = adminRepository.create({
      ...adminData,
      contraseña: hashedPassword,
    });

    await adminRepository.save(admin);

    console.log('✅ Administrador creado exitosamente!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 CREDENCIALES DEL SUPER ADMIN');
    console.log('═══════════════════════════════════════');
    console.log(`   Email:      ${adminData.email}`);
    console.log(`   Contraseña: ${adminData.contraseña}`);
    console.log(`   Nivel:      ${adminData.nivel_acceso}`);
    console.log('═══════════════════════════════════════\n');
    console.log('🔐 Guarda estas credenciales en un lugar seguro');
    console.log('🚀 Ahora puedes hacer login en /auth/login\n');

    await dataSource.destroy();
    console.log('✅ Proceso completado\n');

  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
    process.exit(1);
  }
}

// Ejecutar el seed
seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
