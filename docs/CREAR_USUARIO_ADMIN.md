# 👤 Guía para Crear Usuario Administrador

## 🎯 Objetivo
Crear un usuario administrador con acceso completo al sistema PoliGer (rol TIPO_4 - Gestor del Sistema).

## 📋 Información del Usuario Administrador

### Credenciales por Defecto:
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Email**: `admin@poliger.com`
- **Nombre**: Administrador Sistema
- **Rol**: TIPO_4 (Gestor del Sistema)

### Permisos del Rol TIPO_4:
- ✅ Ver/Crear/Editar Germinaciones
- ✅ Ver/Crear/Editar Polinizaciones
- ✅ Ver/Generar Reportes
- ✅ Exportar Datos
- ✅ Gestión de Usuarios
- ✅ Estadísticas Globales
- ✅ Acceso total al sistema

## 🚀 Métodos para Crear el Usuario

### Método 1: Comando Django (Recomendado)

1. **Abrir terminal en el directorio del backend:**
   ```bash
   cd BACK/backend
   ```

2. **Ejecutar el comando de creación:**
   ```bash
   python manage.py create_admin_user --username admin --password admin123 --email admin@poliger.com --first-name Administrador --last-name Sistema
   ```

3. **Si el comando no existe, ejecutar el script personalizado:**
   ```bash
   python create_admin_simple.py
   ```

### Método 2: Shell de Django

1. **Abrir el shell de Django:**
   ```bash
   cd BACK/backend
   python manage.py shell
   ```

2. **Ejecutar los siguientes comandos en el shell:**
   ```python
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   # Crear usuario administrador
   user = User.objects.create_user(
       username='admin',
       password='admin123',
       email='admin@poliger.com',
       first_name='Administrador',
       last_name='Sistema',
       is_staff=True,
       is_superuser=True,
       is_active=True
   )
   
   # Crear perfil con rol TIPO_4
   profile = UserProfile.objects.create(
       usuario=user,
       rol='TIPO_4',
       activo=True,
       departamento='Administración',
       telefono='000-000-0000'
   )
   
   print("Usuario administrador creado exitosamente!")
   print(f"Usuario: admin")
   print(f"Contraseña: admin123")
   print(f"Rol: {profile.get_rol_display()}")
   ```

3. **Salir del shell:**
   ```python
   exit()
   ```

### Método 3: Script Python Personalizado

1. **Crear archivo `create_admin_manual.py` en `BACK/backend/`:**
   ```python
   import os
   import django
   
   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
   django.setup()
   
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   def create_admin():
       # Crear usuario
       user, created = User.objects.get_or_create(
           username='admin',
           defaults={
               'email': 'admin@poliger.com',
               'first_name': 'Administrador',
               'last_name': 'Sistema',
               'is_staff': True,
               'is_superuser': True,
               'is_active': True
           }
       )
       
       if created:
           user.set_password('admin123')
           user.save()
           print("✅ Usuario admin creado")
       else:
           print("ℹ️ Usuario admin ya existe")
       
       # Crear/actualizar perfil
       profile, created = UserProfile.objects.get_or_create(
           usuario=user,
           defaults={
               'rol': 'TIPO_4',
               'activo': True,
               'departamento': 'Administración',
               'telefono': '000-000-0000'
           }
       )
       
       if not created:
           profile.rol = 'TIPO_4'
           profile.activo = True
           profile.save()
       
       print("✅ Perfil TIPO_4 configurado")
       print(f"Usuario: admin")
       print(f"Contraseña: admin123")
   
   if __name__ == '__main__':
       create_admin()
   ```

2. **Ejecutar el script:**
   ```bash
   cd BACK/backend
   python create_admin_manual.py
   ```

## ✅ Verificación

### Verificar que el usuario fue creado correctamente:

1. **Usando el shell de Django:**
   ```python
   python manage.py shell
   ```

2. **Verificar usuario:**
   ```python
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   admin = User.objects.get(username='admin')
   print(f"Usuario: {admin.username}")
   print(f"Es superuser: {admin.is_superuser}")
   print(f"Es staff: {admin.is_staff}")
   print(f"Está activo: {admin.is_active}")
   
   profile = UserProfile.objects.get(usuario=admin)
   print(f"Rol: {profile.rol}")
   print(f"Rol display: {profile.get_rol_display()}")
   print(f"Está activo: {profile.activo}")
   ```

## 🔐 Cambiar Credenciales

### Cambiar contraseña del administrador:

1. **Usando el shell de Django:**
   ```python
   from django.contrib.auth.models import User
   
   admin = User.objects.get(username='admin')
   admin.set_password('nueva_contraseña_segura')
   admin.save()
   print("Contraseña actualizada")
   ```

2. **Usando comando Django:**
   ```bash
   python manage.py changepassword admin
   ```

## 🎯 Uso del Usuario Administrador

### Acceso a Funcionalidades:

1. **Iniciar sesión en la aplicación** con las credenciales del admin
2. **Verificar acceso a todas las secciones:**
   - ✅ Germinaciones (ver, crear, editar)
   - ✅ Polinizaciones (ver, crear, editar)
   - ✅ Reportes (ver, generar, exportar)
   - ✅ Administración (gestión de usuarios)
   - ✅ Perfil (configuración completa)

### Gestión de Otros Usuarios:

1. **Crear nuevos usuarios** desde la sección de administración
2. **Asignar roles** según las necesidades
3. **Activar/desactivar usuarios**
4. **Ver estadísticas** del sistema

## 🚨 Seguridad

### Recomendaciones de Seguridad:

1. **Cambiar la contraseña por defecto** inmediatamente
2. **Usar contraseñas seguras** (mínimo 12 caracteres)
3. **No compartir credenciales** del administrador
4. **Revisar logs de acceso** regularmente
5. **Crear usuarios específicos** para diferentes tareas

### Contraseña Segura Sugerida:
```
Admin
PoliGer2024!@#
```

## 📞 Soporte

Si tienes problemas creando el usuario administrador:

1. **Verificar que Django esté instalado** correctamente
2. **Ejecutar migraciones** antes de crear usuarios:
   ```bash
   python manage.py migrate
   ```
3. **Verificar permisos** de escritura en la base de datos
4. **Revisar logs** del servidor Django

---

**Creado el**: $(date)  
**Versión**: 1.0  
**Estado**: ✅ Listo para usar
