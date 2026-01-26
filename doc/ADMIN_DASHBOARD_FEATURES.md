# 🛡️ Panel de Administrador - Opciones Disponibles

## 📋 Resumen

Ya has integrado correctamente el **Panel de Administrador** con el **Auth Service JWT**. Ahora un usuario con rol `admin` tiene acceso a un **dashboard completo** con múltiples opciones de gestión.

---

## ✅ Cómo Acceder al Panel Admin

### **Opción 1: Registrar Admin (Recomendado)**

```bash
# En PowerShell, ejecuta:
$body = @{
    email = "admin@example.com"
    password = "Admin123456"
    full_name = "Administrator"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8001/auth/register" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

### **Opción 2: Iniciar Sesión**

1. Ve a `http://localhost:5173/login`
2. Ingresa credenciales:
   - **Email:** `admin@example.com`
   - **Contraseña:** `Admin123456`
3. ✅ Se redirige automáticamente al dashboard admin

### **Opción 3: Acceso Directo (Si ya está autenticado)**

- Navega a: `http://localhost:5173/admin`
- Sistema verifica automáticamente que tengas rol `admin`

---

## 🎯 Opciones Disponibles en el Dashboard

### **1. 📊 Dashboard / Inicio**

- **Estadísticas principales:**
  - Total de usuarios registrados
  - Total de administradores
  - Usuarios activos
  - Actividad reciente del sistema
- **Resumen de operaciones:**
  - Últimas reservas
  - Tours más populares
  - Destinos con más visitas

---

### **2. 👥 Gestión de Usuarios**

**Acciones disponibles:**

- ✅ **Ver lista completa** de usuarios registrados
- ✅ **Buscar usuarios** por email o nombre
- ✅ **Ver detalles** de cada usuario:
  - Email, nombre completo
  - Rol (admin/user)
  - Estado (activo/inactivo)
  - Fecha de registro
- ✅ **Editar usuario:**
  - Cambiar nombre completo
  - Cambiar rol (promover a admin o degradar a user)
  - Activar/desactivar usuario
- ✅ **Eliminar usuario** (con confirmación)
- ✅ **Visualizar historial:**
  - Reservas del usuario
  - Contrataciones realizadas

---

### **3. 🗺️ Gestión de Destinos**

**Acciones disponibles:**

- ✅ **Ver todos los destinos** con información:
  - Nombre, descripción
  - Ubicación (latitud/longitud)
  - Región, provincia
  - Imágenes asociadas
- ✅ **Crear nuevo destino:**
  - Nombre y descripción
  - Localización geográfica
  - Información turística
  - Imagen principal
- ✅ **Editar destinos existentes:**
  - Actualizar información
  - Cambiar imágenes
  - Modificar ubicación
- ✅ **Eliminar destino** (si no tiene tours asociados)
- ✅ **Ver tours** relacionados a cada destino

---

### **4. 👨‍🏫 Gestión de Guías**

**Acciones disponibles:**

- ✅ **Listar guías turísticos** con:
  - Nombre completo
  - Especialidad (idiomas, tipo de tours)
  - Calificación (estrellas)
  - Destinos donde trabaja
- ✅ **Crear nuevo guía:**
  - Información personal
  - Especialidades
  - Idiomas que habla
  - Disponibilidad
- ✅ **Editar información del guía**
- ✅ **Eliminar guía** del sistema
- ✅ **Ver tours** asignados al guía

---

### **5. 🚌 Gestión de Tours**

**Acciones disponibles:**

- ✅ **Ver todos los tours** con:
  - Nombre y descripción
  - Destino asociado
  - Guía asignado
  - Duración y precio
  - Disponibilidad
- ✅ **Crear nuevo tour:**
  - Seleccionar destino
  - Asignar guía
  - Establecer duración
  - Definir precio
  - Establecer horarios
  - Definir capacidad máxima
- ✅ **Editar tours:**
  - Cambiar información
  - Actualizar precios
  - Modificar disponibilidad
  - Cambiar guía asignado
- ✅ **Eliminar tour** (si no tiene reservas)
- ✅ **Ver reservas** de cada tour

---

### **6. 🏨 Gestión de Servicios**

**Acciones disponibles:**

- ✅ **Listar servicios** (hospedaje, alimentación, transporte, etc.):
  - Nombre y descripción
  - Tipo de servicio
  - Precio
  - Proveedor
- ✅ **Crear nuevo servicio:**
  - Información completa
  - Categoría (hospedaje/alimentación/transporte/etc.)
  - Precio base
  - Ubicación
- ✅ **Editar servicios**
- ✅ **Eliminar servicio** (si no está en reservas activas)
- ✅ **Ver disponibilidad** del servicio

---

### **7. 📅 Gestión de Reservas**

**Acciones disponibles:**

- ✅ **Ver todas las reservas** con estado:
  - Nombre del usuario
  - Tour/servicio reservado
  - Fecha de reserva
  - Estado (pendiente, confirmada, cancelada)
- ✅ **Actualizar estado de reserva:**
  - Cambiar a confirmada
  - Cambiar a cancelada
  - Ver detalles completos
- ✅ **Procesar pagos** asociados
- ✅ **Generar comprobantes** de reserva
- ✅ **Buscar reservas** por usuario o tour

---

### **8. 💡 Gestión de Recomendaciones**

**Acciones disponibles:**

- ✅ **Ver recomendaciones** generadas por el sistema:
  - Usuario que las recibió
  - Tours recomendados
  - Fecha de generación
- ✅ **Editar recomendaciones** existentes
- ✅ **Ver efectividad** (cuántas se convirtieron en reserva)
- ✅ **Crear recomendaciones manual**

---

### **9. 🤝 Gestión de Contrataciones**

**Acciones disponibles:**

- ✅ **Ver todas las contrataciones** (servicios contratados):
  - Usuario que contrató
  - Servicio contratado
  - Fecha de contratación
  - Estado (activa/completada/cancelada)
- ✅ **Actualizar estado** de contrataciones
- ✅ **Ver detalles** de cada contratación
- ✅ **Procesar pagos** relacionados

---

### **10. 📈 Reportes y Análisis**

**Disponible desde cualquier sección:**

- ✅ **Estadísticas de ingresos:**
  - Ingresos por tour
  - Ingresos por servicio
  - Tendencias mensuales
- ✅ **Análisis de demanda:**
  - Tours más reservados
  - Destinos más visitados
  - Horas pico de reserva
- ✅ **Reporte de usuarios:**
  - Usuarios nuevos
  - Usuarios activos
  - Tasa de retención
- ✅ **Exportar reportes** (CSV/PDF)

---

### **11. ⚙️ Configuración de Cuenta**

**Disponible en el perfil admin:**

- ✅ **Cambiar nombre completo**
- ✅ **Actualizar email**
- ✅ **Cambiar contraseña**
- ✅ **Ver historial de accesos**
- ✅ **Cerrar sesión**

---

## 🔧 Cambios Realizados en el Sistema

### **ProtectedAdminRoute.jsx**

✅ Ahora acepta dos formas de autenticación admin:

1. **Sistema antiguo:** Requiere `adminToken` + `adminData` con email `admin@turismo.com`
2. **Sistema nuevo JWT:** Requiere JWT token válido con rol `admin` del Auth Service

```javascript
// Opción 1: Sistema admin antiguo (adminToken + adminData)
const adminToken = localStorage.getItem('adminToken');
const adminData = localStorage.getItem('adminData');

// Opción 2: Sistema JWT Auth Service
const token = localStorage.getItem('token');
const userData = localStorage.getItem('userData');
if (user.role === 'admin') {
  // ✅ Acceso permitido
}
```

### **AdminDashboard.jsx**

✅ Ahora carga datos de ambos sistemas:

1. Primero verifica `adminToken` (sistema antiguo)
2. Si no existe, verifica JWT con rol `admin` (sistema nuevo)
3. Mapea automáticamente los datos al formato esperado

```javascript
const adminDataOld = localStorage.getItem('adminData');
if (adminToken && adminDataOld) {
  // Sistema antiguo
  setAdminData(JSON.parse(adminDataOld));
}

const user = JSON.parse(userData);
if (user.role === 'admin') {
  // Sistema JWT - mapear datos
  setAdminData({
    nombre: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
  });
}
```

---

## 🧪 Verificación Paso a Paso

### **Paso 1: Iniciar sesión como admin**

```bash
# En el navegador:
1. Ve a http://localhost:5173/login
2. Email: admin@example.com
3. Contraseña: Admin123456
4. Click en "Iniciar Sesión"
```

### **Paso 2: Verificar que funciona**

- ✅ Se debe redirigir automáticamente a `/admin`
- ✅ Se debe ver el **Dashboard con todas las opciones admin**
- ✅ Se debe mostrar "Bienvenido, Admin User" (o tu nombre)

### **Paso 3: Probar opciones**

- ✅ Click en "Usuarios" → Ver lista de usuarios
- ✅ Click en "Destinos" → Ver/crear destinos
- ✅ Click en "Tours" → Ver/crear tours
- ✅ Click en "Servicios" → Ver/crear servicios
- ✅ Etc.

---

## 🚨 Si No Ves el Dashboard Admin

**Verificar:**

1. ¿Estás viendo un dashboard, pero sin opciones de admin?
   - → Controla la **consola del navegador** (F12 > Console)
   - → Busca mensajes como:
     - ✅ `✅ [AdminDashboard] Admin JWT autenticado: admin@example.com`
     - ❌ `❌ [AdminDashboard] Usuario no es admin, rol: user`

2. ¿Se redirige a `/admin/login`?
   - → El usuario NO tiene rol `admin`
   - → Verifica en Auth Service que se guardó el rol correctamente:

     ```bash
     # PowerShell: Validar token
     $token = "tu_access_token_aqui"

     $body = @{ token = $token } | ConvertTo-Json
     Invoke-WebRequest -Uri "http://localhost:8001/auth/validate" `
       -Method POST `
       -Headers @{"Content-Type" = "application/json"} `
       -Body $body
     ```

3. ¿Auth Service responde pero no guarda rol?
   - → Verifica el endpoint `/auth/login` en `routes.py`
   - → Asegúrate que devuelve el rol: `"role": user.role`

---

## 📝 Resumen Comparativo

| Función                     | Usuario Normal | Admin |
| --------------------------- | -------------- | ----- |
| **Ver destinos**            | ✅             | ✅    |
| **Ver tours**               | ✅             | ✅    |
| **Hacer reservas**          | ✅             | ✅    |
| **Ver mis reservas**        | ✅             | ✅    |
| **Crear destinos**          | ❌             | ✅    |
| **Editar destinos**         | ❌             | ✅    |
| **Eliminar destinos**       | ❌             | ✅    |
| **Gestionar usuarios**      | ❌             | ✅    |
| **Ver reportes**            | ❌             | ✅    |
| **Gestionar pagos**         | ❌             | ✅    |
| **Panel de administración** | ❌             | ✅    |

---

## 🎉 ¡Listo!

El sistema está completamente integrado. Ahora:

1. Admins ven el **panel completo de gestión**
2. Usuarios normales ven la **interfaz de cliente**
3. Ambos usan el **mismo Auth Service JWT**
4. La autenticación es **segura y escalable**

**Próximos pasos:**

- ✅ Iniciar **REST API** en puerto 8000
- ✅ Conectar AdminDashboard con la **base de datos real**
- ✅ Crear **datos de demo** para testing
