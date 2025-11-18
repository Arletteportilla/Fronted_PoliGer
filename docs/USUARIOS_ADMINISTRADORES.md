# 👥 Usuarios Administradores del Sistema PoliGer

## 🎯 Resumen

El sistema PoliGer cuenta con múltiples usuarios administradores configurados con acceso completo (rol TIPO_4 - Gestor del Sistema) para garantizar la disponibilidad y gestión del sistema.

## 🔐 Usuarios Administradores Disponibles

### 1. **Usuario Principal**
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Email**: `admin@poliger.com`
- **Nombre**: Administrador Sistema
- **Departamento**: Administración
- **Teléfono**: 000-000-0000

### 2. **Super Administrador**
- **Usuario**: `superadmin`
- **Contraseña**: `PoliGer2024!`
- **Email**: `superadmin@poliger.com`
- **Nombre**: Super Administrador
- **Departamento**: Dirección General
- **Teléfono**: 000-000-0001

### 3. **Administrador de Laboratorio**
- **Usuario**: `admin_lab`
- **Contraseña**: `LabAdmin2024!`
- **Email**: `admin.lab@poliger.com`
- **Nombre**: Admin Laboratorio
- **Departamento**: Laboratorio
- **Teléfono**: 000-000-0002

### 4. **Gestor de Sistema**
- **Usuario**: `gestor_sistema`
- **Contraseña**: `GestorSis2024!`
- **Email**: `gestor.sistema@poliger.com`
- **Nombre**: Gestor Sistema
- **Departamento**: Sistemas
- **Teléfono**: 000-000-0003

## 🛡️ Permisos del Rol TIPO_4 (Gestor del Sistema)

Todos los usuarios administradores tienen los siguientes permisos:

### ✅ **Germinaciones**
- Ver todas las germinaciones
- Crear nuevas germinaciones
- Editar germinaciones existentes
- Eliminar germinaciones
- Exportar datos de germinaciones

### ✅ **Polinizaciones**
- Ver todas las polinizaciones
- Crear nuevas polinizaciones
- Editar polinizaciones existentes
- Eliminar polinizaciones
- Exportar datos de polinizaciones

### ✅ **Reportes**
- Ver todos los reportes
- Generar reportes personalizados
- Exportar reportes en diferentes formatos
- Acceder a estadísticas avanzadas

### ✅ **Administración de Usuarios**
- Crear nuevos usuarios
- Editar perfiles de usuarios
- Asignar roles a usuarios
- Activar/desactivar usuarios
- Cambiar contraseñas de usuarios

### ✅ **Estadísticas Globales**
- Ver estadísticas del sistema completo
- Acceder a métricas de rendimiento
- Monitorear uso del sistema
- Ver logs de actividad

### ✅ **Configuración del Sistema**
- Configurar parámetros globales
- Gestionar backups
- Configurar alertas
- Acceso a configuraciones avanzadas

## 🚀 Cómo Crear los Usuarios Administradores

### Método 1: Script Individual (Recomendado)

```bash
# Crear segundo administrador
cd BACK/backend
python crear_admin2.py

# O usar el script batch en Windows
crear_admin2.bat
```

### Método 2: Múltiples Administradores

```bash
# Crear todos los administradores adicionales
cd BACK/backend
python crear_multiples_admins.py
```

### Método 3: Shell de Django

```bash
cd BACK/backend
python manage.py shell
```

Luego ejecutar:
```python
from django.contrib.auth.models import User
from laboratorio.models import UserProfile

# Crear usuario superadmin
user = User.objects.create_user(
    username='superadmin',
    password='PoliGer2024!',
    email='superadmin@poliger.com',
    first_name='Super',
    last_name='Administrador',
    is_staff=True,
    is_superuser=True,
    is_active=True
)

# Crear perfil con rol TIPO_4
profile = UserProfile.objects.create(
    usuario=user,
    rol='TIPO_4',
    activo=True,
    departamento='Dirección General',
    telefono='000-000-0001'
)
```

## 🔒 Seguridad y Mejores Prácticas

### ⚠️ **Acciones Inmediatas Requeridas**

1. **Cambiar contraseñas por defecto** inmediatamente después de la primera sesión
2. **Usar contraseñas seguras** (mínimo 12 caracteres con números, símbolos y mayúsculas)
3. **No compartir credenciales** entre usuarios
4. **Implementar autenticación de dos factores** si es posible

### 🔐 **Contraseñas Seguras Sugeridas**

```
AdminPoliGer2024!@#
SuperAdmin2024!$%
LabManager2024!^&
SystemGestor2024!*(
```

### 📋 **Lista de Verificación de Seguridad**

- [ ] Cambiar contraseña del usuario `admin`
- [ ] Cambiar contraseña del usuario `superadmin`
- [ ] Cambiar contraseña del usuario `admin_lab`
- [ ] Cambiar contraseña del usuario `gestor_sistema`
- [ ] Documentar las nuevas contraseñas en lugar seguro
- [ ] Configurar alertas de login para administradores
- [ ] Revisar logs de acceso regularmente
- [ ] Crear usuarios específicos para tareas operativas

## 🎯 Uso Recomendado por Usuario

### **admin** - Usuario Principal
- **Uso**: Acceso general al sistema
- **Responsabilidad**: Gestión diaria del sistema
- **Cuándo usar**: Operaciones rutinarias de administración

### **superadmin** - Super Administrador
- **Uso**: Acceso de emergencia y configuraciones críticas
- **Responsabilidad**: Configuración del sistema y resolución de problemas
- **Cuándo usar**: Emergencias y configuraciones importantes

### **admin_lab** - Administrador de Laboratorio
- **Uso**: Gestión específica del laboratorio
- **Responsabilidad**: Supervisión de procesos de laboratorio
- **Cuándo usar**: Gestión de germinaciones y polinizaciones

### **gestor_sistema** - Gestor de Sistema
- **Uso**: Gestión técnica del sistema
- **Responsabilidad**: Mantenimiento y optimización
- **Cuándo usar**: Tareas técnicas y mantenimiento

## 🔍 Verificación de Usuarios

### Comprobar que los usuarios existen:

```bash
cd BACK/backend
python manage.py shell
```

```python
from django.contrib.auth.models import User
from laboratorio.models import UserProfile

# Listar todos los administradores
admins = UserProfile.objects.filter(rol='TIPO_4', activo=True)
for admin in admins:
    user = admin.usuario
    print(f"Usuario: {user.username}")
    print(f"Email: {user.email}")
    print(f"Es superuser: {user.is_superuser}")
    print(f"Activo: {admin.activo}")
    print("-" * 30)
```

### Probar acceso:

1. **Iniciar sesión** en la aplicación con cada usuario
2. **Verificar acceso** a todas las secciones
3. **Confirmar permisos** de administración
4. **Probar creación** de otros usuarios

## 📞 Soporte y Mantenimiento

### En caso de problemas:

1. **Verificar que Django esté funcionando** correctamente
2. **Revisar logs** del servidor para errores
3. **Comprobar la base de datos** y migraciones
4. **Verificar permisos** de archivos y directorios

### Comandos útiles:

```bash
# Verificar migraciones
python manage.py showmigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario manualmente
python manage.py createsuperuser

# Verificar usuarios
python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(is_superuser=True).count())"
```

---

**Creado el**: $(date)  
**Versión**: 2.0  
**Estado**: ✅ Listo para usar  
**Usuarios Administradores**: 4 configurados
