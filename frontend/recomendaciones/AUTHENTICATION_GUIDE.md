# Sistema de Autenticación - Explora Ecuador

## 🚀 Funcionalidades Implementadas

### ✅ Páginas de Autenticación
- **Login Page** (`/login`) - Página de inicio de sesión con validación completa
- **Register Page** (`/register`) - Página de registro con validaciones avanzadas
- **Profile Page** (`/profile`) - Página de perfil personal con edición en vivo
- **Landing Page** (`/`) - Página principal con navegación dinámica

### ✅ Características del Sistema
- **Autenticación funcional** con simulación de API
- **Validación en tiempo real** de formularios
- **Estados de carga** con spinners y feedback visual
- **Notificaciones** de éxito/error
- **Persistencia de sesión** en localStorage
- **Navegación protegida** según estado de autenticación
- **Perfil de usuario editable** con información personal completa
- **Rutas protegidas** que requieren autenticación
- **Responsive design** para móviles y desktop

## 🔐 Cómo Probar la Autenticación

### 1. Registro de Usuario Nuevo
1. Ve a `http://localhost:5173/register`
2. Completa el formulario con datos válidos:
   - **Nombre**: Mínimo 2 caracteres
   - **Apellido**: Mínimo 2 caracteres
   - **Email**: Formato válido (ej: `usuario@email.com`)
   - **Username**: Mínimo 3 caracteres, solo letras, números y guiones bajos
   - **Password**: Mínimo 8 caracteres con mayúscula, minúscula y número
   - **Confirmar Password**: Debe coincidir con la contraseña
   - **Fecha de Nacimiento**: Debes tener al menos 13 años
   - **Aceptar términos**: Requerido

3. Haz clic en "Crear Cuenta"
4. Si todo es válido, serás automáticamente logueado y redirigido al inicio

### 2. Inicio de Sesión
1. Ve a `http://localhost:5173/login`
2. Usa las credenciales del usuario que registraste:
   - **Username/Email**: Puedes usar cualquiera de los dos
   - **Password**: La contraseña que configuraste

3. Haz clic en "Iniciar Sesión"
4. Si las credenciales son correctas, serás redirigido al inicio

### 3. Usuarios de Prueba Predefinidos
Para facilitar las pruebas, puedes usar estos usuarios (se crean automáticamente):

```javascript
// Usuario 1 - Administrador
Username: admin
Email: admin@exploraecuador.com
Password: Admin123
Destino Favorito: Islas Galápagos
Estilo: Ecológico

// Usuario 2 - Aventurero
Username: usuario1
Email: usuario1@test.com
Password: Test123
Destino Favorito: Quilotoa
Estilo: Aventura

// Usuario 3 - Guía Local
Username: maria_ecuador
Email: maria@ecuador.com
Password: Ecuador2025
Destino Favorito: Centro Histórico de Quito
Estilo: Cultural
```

### 4. Gestión de Perfil
1. Una vez logueado, haz clic en tu nombre en el navbar
2. Selecciona "Mi Perfil" del menú desplegable
3. Ve a `http://localhost:5173/profile`
4. Explora la información personal:
   - **Avatar personalizado** con iniciales
   - **Estadísticas** de destinos visitados y reseñas
   - **Información de contacto** y fechas importantes
   - **Logros e insignias** del sistema

5. Para editar tu perfil:
   - Haz clic en el botón "Editar"
   - Modifica cualquier campo (nombre, biografía, destino favorito, etc.)
   - Haz clic en "Guardar" para aplicar los cambios
   - Los cambios se reflejan inmediatamente en toda la aplicación

## 🧪 Casos de Prueba Sugeridos

### ✅ Validaciones del Formulario de Registro
- [ ] Intentar registrarse sin completar campos obligatorios
- [ ] Usar un email con formato inválido
- [ ] Usar un username con caracteres especiales
- [ ] Usar una contraseña débil (menos de 8 caracteres)
- [ ] Usar contraseñas que no coincidan
- [ ] Registrarse siendo menor de 13 años
- [ ] No aceptar términos y condiciones

### ✅ Validaciones del Formulario de Login
- [ ] Intentar login con credenciales vacías
- [ ] Usar credenciales incorrectas
- [ ] Usar un email válido pero no registrado
- [ ] Usar la contraseña incorrecta

### ✅ Funcionalidades del Sistema
- [ ] Verificar que se muestre el nombre del usuario en el navbar después del login
- [ ] Probar el menú desplegable del usuario
- [ ] Acceder a "Mi Perfil" desde el menú
- [ ] Verificar la página de perfil con toda la información personal
- [ ] Probar la edición de perfil (nombre, biografía, destino favorito, etc.)
- [ ] Verificar que los cambios se guarden y persistan
- [ ] Cerrar sesión y verificar que regrese al estado no autenticado
- [ ] Verificar persistencia de sesión (recargar página)
- [ ] Probar navegación entre páginas cuando está logueado
- [ ] Verificar que las notificaciones se muestren correctamente
- [ ] Probar acceso a `/profile` sin estar logueado (debe redirigir a login)

### ✅ Responsive Design
- [ ] Probar en pantalla de escritorio (>768px)
- [ ] Probar en tablet (768px)
- [ ] Probar en móvil (<768px)
- [ ] Verificar que los formularios se vean bien en todos los tamaños

## 🔧 Estados del Sistema

### Usuario No Autenticado
- Navbar muestra botones "Registrarse" e "Iniciar Sesión"
- Acceso libre a todas las páginas públicas
- Redirección automática desde `/login` y `/register` si ya está logueado

### Usuario Autenticado
- Navbar muestra el nombre del usuario y menú desplegable
- Menú incluye "Mi Perfil", "Mis Reservas" y "Cerrar Sesión"
- Acceso completo a la página de perfil (`/profile`)
- Puede editar su información personal en tiempo real
- Acceso a funcionalidades protegidas
- Persistencia de sesión entre recargas de página

## 👤 Página de Perfil

### Características de la Página de Perfil:
- **Panel izquierdo**: Avatar, estadísticas, información rápida
- **Panel derecho**: Formulario de edición completo
- **Avatar personalizado** con las iniciales del usuario
- **Estadísticas dinámicas** (destinos visitados, reseñas)
- **Logros e insignias** del sistema
- **Edición en vivo** con validación en tiempo real

### Campos Editables:
- ✅ **Nombre y Apellido**
- ✅ **Email** (con validación de formato)
- ✅ **Username** (único en el sistema)
- ✅ **Fecha de Nacimiento**
- ✅ **Biografía Personal** (textarea expandible)
- ✅ **Destino Favorito** en Ecuador
- ✅ **Estilo de Viaje** (aventura, cultural, relajante, etc.)

### Protección de Rutas:
- La página `/profile` está protegida
- Usuarios no autenticados son redirigidos a `/login`
- Loading state mientras se verifica la autenticación

## 📱 Notificaciones

El sistema incluye notificaciones automáticas para:
- ✅ **Registro exitoso**: "¡Cuenta creada exitosamente! Bienvenido a Explora Ecuador."
- ✅ **Login exitoso**: "¡Bienvenido de vuelta! Has iniciado sesión correctamente."
- ✅ **Logout**: "Has cerrado sesión correctamente. ¡Hasta pronto!"
- ❌ **Errores**: Mensajes específicos según el tipo de error

## 🎨 Características Visuales

- **Diseño glassmorphism** con efectos de cristal y blur
- **Animaciones suaves** en transiciones y hover effects
- **Spinners de carga** durante operaciones asíncronas
- **Iconografía consistente** con Lucide React
- **Paleta de colores turística** (verdes, azules, naranjas)
- **Tipografía moderna** con Inter font

## 🛠️ Tecnologías Utilizadas

- **React 19.1.1** - Framework frontend
- **React Router DOM 7.9.4** - Navegación SPA
- **Lucide React 0.546.0** - Iconografía
- **Context API** - Manejo de estado global
- **LocalStorage** - Persistencia de datos
- **CSS-in-JS** - Estilos inline con objetos JavaScript

## 🔄 Flujo de Datos

```
1. Usuario completa formulario
   ↓
2. Validación en frontend
   ↓
3. Simulación de API call (1-1.5s delay)
   ↓
4. Almacenamiento en localStorage
   ↓
5. Actualización del contexto global
   ↓
6. Notificación de éxito/error
   ↓
7. Redirección automática (si es exitoso)
```

## 🚀 Próximas Funcionalidades

- [ ] Recuperación de contraseña
- [ ] Cambio de contraseña desde el perfil
- [ ] Subida de foto de perfil personalizada
- [ ] Verificación de email
- [ ] Autenticación con redes sociales
- [ ] Roles y permisos
- [ ] Historial de actividad
- [ ] Página "Mis Reservas" funcional
- [ ] Sistema de amigos/seguidores
- [ ] Preferencias de notificaciones