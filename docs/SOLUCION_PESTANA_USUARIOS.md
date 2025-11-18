# 🔧 Solución: Pestaña "Usuarios" No Aparece

## 🚨 Problema Identificado

La pestaña "Usuarios" no aparece en el perfil, aunque ya iniciaste sesión como administrador.

## 🔍 Causas del Problema

1. **Error en verificación de rol**: La pestaña verificaba `user?.rol` en lugar de `user?.profile?.rol`
2. **Endpoints no registrados**: Los endpoints de gestión de usuarios no estaban en las URLs
3. **Usuario sin perfil correcto**: El usuario admin puede no tener el perfil con rol TIPO_4

## ✅ Soluciones Implementadas

### 1. **Corrección del Frontend** ✅
He corregido la verificación de rol en `Fronted/PoliGer/app/(tabs)/perfil.tsx`:

```typescript
// ❌ ANTES (incorrecto)
{user?.rol === 'TIPO_4' && (

// ✅ DESPUÉS (correcto)
{user?.profile?.rol === 'TIPO_4' && (
```

### 2. **Registro de Endpoints** ✅
He agregado las rutas en `BACK/backend/laboratorio/urls.py`:

```python
# ViewSets para gestión de usuarios
router.register(r'api/user-profiles', UserProfileViewSet, basename='user-profiles')
router.register(r'api/user-management', UserManagementViewSet, basename='user-management')
router.register(r'api/user-metas', UserMetasViewSet, basename='user-metas')
```

## 🔄 Pasos para Aplicar la Solución

### **Paso 1: Verificar Usuario Administrador**

Ejecuta en la terminal del backend:

```bash
cd BACK/backend
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.contrib.auth.models import User
from laboratorio.models import UserProfile

user = User.objects.get(username='admin')
profile, created = UserProfile.objects.get_or_create(
    usuario=user,
    defaults={'rol': 'TIPO_4', 'activo': True, 'departamento': 'Administración'}
)
profile.rol = 'TIPO_4'
profile.activo = True
profile.save()
print('✅ Usuario admin configurado')
print(f'Rol: {profile.rol}')
print(f'Activo: {profile.activo}')
"
```

### **Paso 2: Reiniciar Servidor Backend**

```bash
# En la terminal del backend:
Ctrl+C  # Detener servidor
python manage.py runserver  # Reiniciar
```

### **Paso 3: Reiniciar Aplicación Frontend**

```bash
# En la terminal del frontend:
Ctrl+C  # Detener app
npm start  # Reiniciar
```

### **Paso 4: Verificar en la Aplicación**

1. **Ve al Perfil**
2. **Busca la pestaña "Usuarios"** (debería aparecer ahora)
3. **Haz clic en "Usuarios"**
4. **Deberías ver**:
   - ✅ Estadísticas de usuarios
   - ✅ Botón "Crear Usuario"
   - ✅ Tabla de usuarios

## 🔍 Verificación de Debug

He agregado logs de debug en el frontend. Abre la consola del navegador (F12) y busca:

```
🔍 DEBUG PerfilScreen - User data: {
  username: 'admin',
  profile: {...},
  rol: 'TIPO_4',
  isAdmin: true
}
```

Si `isAdmin: false`, significa que hay un problema con el perfil del usuario.

## 🛠️ Scripts de Ayuda Creados

### **Verificar Usuario Admin**
```bash
cd BACK/backend
python fix_admin_profile.py
```

### **Probar Endpoints**
```bash
cd BACK/backend
python test_user_endpoints.py
```

### **Reiniciar Servidor**
```bash
cd BACK/backend
python restart_server.py
```

## 🎯 Estructura Correcta del Usuario

Para que funcione, el usuario debe tener esta estructura:

```javascript
user: {
  username: 'admin',
  profile: {
    rol: 'TIPO_4',        // ← Esto es clave
    activo: true,
    departamento: 'Administración'
  }
}
```

## 🔧 Si Aún No Funciona

### **Opción 1: Crear Usuario Completamente Nuevo**

```bash
cd BACK/backend
python manage.py shell
```

```python
from django.contrib.auth.models import User
from laboratorio.models import UserProfile

# Eliminar usuario existente
User.objects.filter(username='admin').delete()

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

print('✅ Usuario creado correctamente')
exit()
```

### **Opción 2: Verificar en Django Admin**

1. Ve a: `http://localhost:8000/admin/`
2. Login con: `admin` / `admin123`
3. Ve a **Users** → busca el usuario `admin`
4. Ve a **User profiles** → verifica que tenga rol `TIPO_4`

## 📱 Verificación Final

Después de aplicar todos los pasos:

1. ✅ **Pestaña "Usuarios" visible** en el perfil
2. ✅ **Al hacer clic** se muestra la gestión de usuarios
3. ✅ **Botón "Crear Usuario"** funcional
4. ✅ **Tabla de usuarios** con datos
5. ✅ **Sin errores 404** en la consola

## 🚨 Problemas Comunes

### **Error 404 en /api/user-management/**
- **Causa**: Endpoints no registrados
- **Solución**: Reiniciar servidor backend

### **Pestaña no aparece**
- **Causa**: Rol incorrecto en el perfil
- **Solución**: Verificar que `user.profile.rol === 'TIPO_4'`

### **Usuario sin perfil**
- **Causa**: Perfil no creado
- **Solución**: Crear perfil con rol TIPO_4

---

**✅ Con estos cambios, la pestaña "Usuarios" debería aparecer y funcionar correctamente.**
