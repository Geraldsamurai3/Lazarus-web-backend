# 🚨 Sistema de Strikes Automático - Lazarus

## 📋 ¿Qué es un Strike?

Un **strike** es una penalización que recibe un ciudadano cuando reporta un incidente falso. El sistema de strikes protege contra el abuso del sistema de reportes.

---

## ⚙️ Funcionamiento Automático

### 1️⃣ Cuando se marca un incidente como CANCELADO

Cuando una **ENTIDAD** o **ADMIN** cambia el estado de un incidente a `CANCELADO` (incidente falso):

```typescript
PATCH /incidents/:id
{
  "estado": "CANCELADO"
}
```

El backend **automáticamente**:

1. ✅ Incrementa los strikes del ciudadano que reportó el incidente
2. ✅ Guarda el cambio en la base de datos
3. ✅ Emite evento WebSocket `incident:updated`
4. ✅ Registra log en consola para auditoría

**No se requiere llamar manualmente al endpoint de strikes.**

---

## 🔢 Conteo de Strikes

| Strikes | Estado de la Cuenta | Acciones Permitidas |
|---------|---------------------|---------------------|
| 0 | ✅ Activa | Puede reportar incidentes normalmente |
| 1 | ⚠️ Advertencia | Puede seguir reportando |
| 2 | ⚠️ Última advertencia | Puede seguir reportando |
| 3+ | 🚫 **Deshabilitada** | **NO puede hacer login** |

### Lógica de Deshabilitación

```typescript
// Cuando strikes >= 3
ciudadano.activo = false;  // ← Cuenta automáticamente deshabilitada
```

Una vez deshabilitada:
- ❌ No puede hacer login
- ❌ No puede reportar incidentes
- ❌ No puede ver el dashboard
- ✅ Solo un ADMIN puede reactivar la cuenta

---

## 🔄 Flujo Completo

### Escenario: Incidente Falso

```
1. Ciudadano reporta incidente falso
   POST /incidents
   → Estado: PENDIENTE
   → Ciudadano tiene 0 strikes

2. Entidad revisa el incidente
   → Ve que es falso/spam

3. Entidad marca como CANCELADO
   PATCH /incidents/:id { "estado": "CANCELADO" }
   
4. Backend automáticamente:
   ✅ Actualiza estado a CANCELADO
   ✅ Incrementa strikes del ciudadano (0 → 1)
   ✅ Emite WebSocket event
   ✅ Log: "⚠️ Strike incrementado - Ciudadano ID: 5, Strikes totales: 1"
   
5. Si el ciudadano ya tenía 2 strikes:
   ✅ Strikes: 2 → 3
   ✅ activo: true → false
   ✅ Log: "🚫 Cuenta deshabilitada - Ciudadano ID: 5 (3 strikes)"
   
6. Ciudadano intenta hacer login:
   ❌ Error 401: "Cuenta deshabilitada"
```

---

## 📊 Consultar Strikes de un Ciudadano

### Ver perfil de ciudadano (incluye strikes)

```http
GET /users/CIUDADANO/:id
Authorization: Bearer TOKEN_ADMIN_O_ENTIDAD
```

**Respuesta:**
```json
{
  "id_ciudadano": 5,
  "nombre": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "cedula": "123456789",
  "telefono": "88888888",
  "direccion": "San José",
  "strikes": 2,  // ← Strikes actuales
  "activo": true,
  "fecha_creacion": "2025-10-31T..."
}
```

---

## 🔓 Reactivar Cuenta (Solo ADMIN)

Si un ciudadano alcanzó 3 strikes y su cuenta fue deshabilitada, un **ADMIN** puede reactivarla:

### Opción 1: Habilitar cuenta sin resetear strikes

```http
PATCH /users/CIUDADANO/:id/toggle-status
Authorization: Bearer TOKEN_ADMIN
```

Esto cambia `activo: false → true`, pero los strikes siguen en 3.

### Opción 2: Resetear strikes manualmente (requiere endpoint adicional)

**📝 Nota:** Actualmente no existe endpoint para resetear strikes. Se puede agregar si es necesario:

```typescript
// users.controller.ts (PENDIENTE - NO IMPLEMENTADO)
@Patch('ciudadano/:id/reset-strikes')
@Roles(UserType.ADMIN)
async resetStrikes(@Param('id', ParseIntPipe) id: number) {
  // Implementar en UnifiedAuthService
  return this.usersService.resetStrikes(id);
}
```

---

## 🛡️ Protecciones del Sistema

### 1. Login bloqueado para usuarios deshabilitados

```typescript
// jwt.strategy.ts
if (!user.activo) {
  throw new UnauthorizedException('Cuenta deshabilitada');
}
```

### 2. Solo ENTIDAD y ADMIN pueden marcar como CANCELADO

Los ciudadanos no pueden cambiar el estado de sus propios incidentes.

### 3. Log de auditoría

Cada vez que se incrementa un strike, el sistema registra:

```
⚠️ Strike incrementado - Ciudadano ID: 5, Strikes totales: 2, Incidente ID: 42, Marcado por: 8 (ENTIDAD)
```

Si la cuenta se deshabilita:

```
🚫 Cuenta deshabilitada - Ciudadano ID: 5 (3 strikes)
```

---

## 🎯 Estados de Incidente

| Estado | Descripción | Incrementa Strikes |
|--------|-------------|--------------------|
| `PENDIENTE` | Recién reportado | ❌ No |
| `EN_PROCESO` | Siendo atendido | ❌ No |
| `RESUELTO` | Ya resuelto | ❌ No |
| `CANCELADO` | **Incidente falso** | ✅ **SÍ** |

---

## 📝 Ejemplo de Uso en Frontend

### Dashboard de Admin - Ver strikes

```jsx
// Mostrar strikes en la lista de usuarios
<Table>
  <TableBody>
    {usuarios.map(usuario => (
      <TableRow key={usuario.id}>
        <TableCell>{usuario.nombre}</TableCell>
        <TableCell>{usuario.email}</TableCell>
        <TableCell>
          <Badge variant={usuario.strikes >= 3 ? 'destructive' : 'warning'}>
            {usuario.strikes} strikes
          </Badge>
        </TableCell>
        <TableCell>
          {usuario.activo ? (
            <Badge variant="success">Activa</Badge>
          ) : (
            <Badge variant="destructive">Deshabilitada</Badge>
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Dashboard de Entidad - Marcar como falso

```jsx
const handleMarkAsFalse = async (incidentId) => {
  try {
    // Solo cambiar estado a CANCELADO
    await updateIncidentStatus(incidentId, 'CANCELADO');
    
    toast.success(
      'Incidente marcado como falso. El usuario recibirá un strike automáticamente.'
    );
    
    refreshIncidents();
  } catch (error) {
    toast.error('Error al marcar incidente como falso');
  }
};
```

---

## 🧪 Testing

### Probar el sistema de strikes

```bash
# 1. Registrar ciudadano
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellidos": "User",
    "email": "test@test.com",
    "contraseña": "123456",
    "cedula": "111111111",
    "telefono": "88888888",
    "direccion": "Test"
  }'

# 2. Login y obtener token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "contraseña": "123456"
  }'
# Guardar access_token

# 3. Reportar incidente (como ciudadano)
curl -X POST http://localhost:3000/incidents \
  -H "Authorization: Bearer TOKEN_CIUDADANO" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "INCENDIO",
    "descripcion": "Incidente de prueba",
    "severidad": "MEDIA",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "direccion": "San José"
  }'
# Guardar incident.id

# 4. Marcar como falso (como entidad)
curl -X PATCH http://localhost:3000/incidents/1 \
  -H "Authorization: Bearer TOKEN_ENTIDAD" \
  -H "Content-Type: application/json" \
  -d '{"estado":"CANCELADO"}'

# 5. Verificar strikes del ciudadano
curl -X GET http://localhost:3000/users/CIUDADANO/1 \
  -H "Authorization: Bearer TOKEN_ENTIDAD"
# Debe mostrar "strikes": 1

# 6. Repetir pasos 3-5 dos veces más para llegar a 3 strikes

# 7. Intentar login con cuenta deshabilitada
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "contraseña": "123456"
  }'
# Debe retornar: 401 "Cuenta deshabilitada"
```

---

## 🔧 Logs de Consola

Al marcar un incidente como CANCELADO, verás en la consola del backend:

```
⚠️ Strike incrementado - Ciudadano ID: 5, Strikes totales: 1, Incidente ID: 42, Marcado por: 8 (ENTIDAD)
```

Si alcanza 3 strikes:

```
⚠️ Strike incrementado - Ciudadano ID: 5, Strikes totales: 3, Incidente ID: 44, Marcado por: 8 (ENTIDAD)
🚫 Cuenta deshabilitada - Ciudadano ID: 5 (3 strikes)
```

Si hay un error:

```
❌ Error al incrementar strikes para ciudadano 5: Error message here
```

---

## 🎯 Resumen

1. ✅ **Automático:** No requiere endpoint manual para strikes
2. ✅ **Seguro:** Solo ENTIDAD/ADMIN pueden marcar como CANCELADO
3. ✅ **Protegido:** Usuarios con 3 strikes no pueden hacer login
4. ✅ **Auditable:** Logs completos de todas las acciones
5. ✅ **Reversible:** ADMIN puede reactivar cuentas

---

**Última actualización:** 31 de Octubre, 2025
