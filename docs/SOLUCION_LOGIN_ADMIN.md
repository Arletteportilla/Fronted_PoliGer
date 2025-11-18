# 🔐 Solución para Problemas de Login de Administrador

## 🚨 Problema Identificado

No puedes iniciar sesión con las credenciales del usuario administrador. Esto puede deberse a varios factores:

1. **El usuario no se creó correctamente**
2. **Problemas con la base de datos**
3. **Configuración de Django**
4. **Problemas con el entorno de Python**

## 🛠️ Soluciones Paso a Paso

### **Solución 1: Crear Usuario Administrador Manualmente**

#### **Opción A: Usando Django Admin (Recomendado)**

1. **Abrir terminal en el directorio del backend:**
   ```bash
   cd BACK/backend
   ```

2. **Ejecutar el servidor Django:**
   ```bash
   python manage.py runserver
   ```

3. **Abrir navegador y ir a:**
   ```
   http://localhost:8000/admin/
   ```

4. **Si no tienes usuario, crear uno con:**
   ```bash
   python manage.py createsuperuser
   ```
   - Usuario: `admin`
   - Email: `admin@poliger.com`
   - Contraseña: `admin123`

5. **Una vez en Django Admin:**
   - Ir a "Users" → "Add user"
   - Crear usuario con:
     - Username: `admin`
     - Password: `admin123`
     - Email: `admin@poliger.com`
     - Marcar "Staff status" y "Superuser status"

6. **Crear perfil de usuario:**
   - Ir a "User profiles" → "Add user profile"
   - Seleccionar el usuario creado
   - Rol: `TIPO_4` (Gestor del Sistema)
   - Activo: ✅
   - Departamento: `Administración`

#### **Opción B: Usando Python Shell**

1. **Abrir terminal en el directorio del backend:**
   ```bash
   cd BACK/backend
   ```

2. **Abrir shell de Django:**
   ```bash
   python manage.py shell
   ```

3. **Ejecutar estos comandos uno por uno:**
   ```python
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   # Crear usuario
   user = User.objects.create_user(
       username='admin',
       password='admin123',
       email='admin@poliger.com',
       first_name='Admin',
       last_name='Sistema',
       is_staff=True,
       is_superuser=True,
       is_active=True
   )
   
   # Crear perfil
   profile = UserProfile.objects.create(
       usuario=user,
       rol='TIPO_4',
       activo=True,
       departamento='Administración',
       telefono='000-000-0000'
   )
   
   print("Usuario admin creado exitosamente")
   ```

4. **Salir del shell:**
   ```python
   exit()
   ```

### **Solución 2: Verificar Usuarios Existentes**

#### **Comprobar qué usuarios existen:**

1. **Abrir shell de Django:**
   ```bash
   python manage.py shell
   ```

2. **Verificar usuarios:**
   ```python
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   # Listar todos los usuarios
   users = User.objects.all()
   for user in users:
       print(f"Usuario: {user.username}")
       print(f"Email: {user.email}")
       print(f"Es superuser: {user.is_superuser}")
       print(f"Es staff: {user.is_staff}")
       print(f"Está activo: {user.is_active}")
       
       # Verificar perfil
       try:
           profile = UserProfile.objects.get(usuario=user)
           print(f"Rol: {profile.rol}")
           print(f"Perfil activo: {profile.activo}")
       except:
           print("Sin perfil")
       print("-" * 30)
   ```

3. **Si hay usuarios pero no funcionan:**
   ```python
   # Resetear contraseña
   user = User.objects.get(username='admin')
   user.set_password('admin123')
   user.save()
   print("Contraseña reseteada")
   ```

### **Solución 3: Crear Usuario desde Cero**

#### **Si nada funciona, crear usuario completamente nuevo:**

1. **Eliminar usuarios existentes:**
   ```bash
   python manage.py shell
   ```
   ```python
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   # Eliminar usuario admin si existe
   User.objects.filter(username='admin').delete()
   UserProfile.objects.filter(usuario__username='admin').delete()
   
   print("Usuarios eliminados")
   exit()
   ```

2. **Crear usuario nuevo:**
   ```bash
   python manage.py createsuperuser
   ```
   - Username: `admin`
   - Email: `admin@poliger.com`
   - Password: `admin123`

3. **Crear perfil:**
   ```bash
   python manage.py shell
   ```
   ```python
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   user = User.objects.get(username='admin')
   profile = UserProfile.objects.create(
       usuario=user,
       rol='TIPO_4',
       activo=True,
       departamento='Administración',
       telefono='000-000-0000'
   )
   print("Perfil creado")
   exit()
   ```

### **Solución 4: Verificar Base de Datos**

#### **Si hay problemas con la base de datos:**

1. **Verificar migraciones:**
   ```bash
   python manage.py showmigrations
   ```

2. **Aplicar migraciones:**
   ```bash
   python manage.py migrate
   ```

3. **Verificar estado de la base de datos:**
   ```bash
   python manage.py check
   ```

### **Solución 5: Script Automatizado**

#### **Crear y ejecutar script de emergencia:**

1. **Crear archivo `fix_admin.py` en `BACK/backend/`:**
   ```python
   import os
   import django
   
   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
   django.setup()
   
   from django.contrib.auth.models import User
   from laboratorio.models import UserProfile
   
   try:
       # Eliminar usuario existente
       User.objects.filter(username='admin').delete()
       print("Usuario existente eliminado")
       
       # Crear nuevo usuario
       user = User.objects.create_user(
           username='admin',
           password='admin123',
           email='admin@poliger.com',
           first_name='Admin',
           last_name='Sistema',
           is_staff=True,
           is_superuser=True,
           is_active=True
       )
       
       # Crear perfil
       profile = UserProfile.objects.create(
           usuario=user,
           rol='TIPO_4',
           activo=True,
           departamento='Administración',
           telefono='000-000-0000'
       )
       
       print("✅ Usuario admin creado exitosamente")
       print(f"Usuario: {user.username}")
       print(f"Contraseña: admin123")
       print(f"Email: {user.email}")
       
   except Exception as e:
       print(f"❌ Error: {e}")
   ```

2. **Ejecutar script:**
   ```bash
   python fix_admin.py
   ```

## 🔍 Verificación Final

### **Probar login:**

1. **Iniciar servidor:**
   ```bash
   python manage.py runserver
   ```

2. **Ir a la aplicación web**
3. **Intentar login con:**
   - Usuario: `admin`
   - Contraseña: `admin123`

### **Si aún no funciona:**

1. **Verificar logs de Django** en la consola
2. **Comprobar configuración de autenticación**
3. **Verificar que la base de datos esté funcionando**

## 📞 Credenciales de Emergencia

Si nada funciona, usa estas credenciales temporales:

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Email**: `admin@poliger.com`
- **Rol**: `TIPO_4` (Gestor del Sistema)

## ⚠️ Importante

Después de crear el usuario:

1. **Cambiar la contraseña** por una más segura
2. **Verificar que el perfil** tenga el rol correcto
3. **Probar todas las funcionalidades** del sistema
4. **Crear usuarios adicionales** si es necesario

---

**Si ninguna de estas soluciones funciona, contacta al administrador del sistema o revisa los logs de Django para más detalles del error.**
