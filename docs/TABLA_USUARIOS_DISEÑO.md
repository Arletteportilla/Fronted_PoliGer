# 📊 Tabla de Usuarios - Diseño Profesional

## 🎯 Resumen

Se ha implementado una tabla profesional para la gestión de usuarios, siguiendo el diseño de referencia proporcionado. La nueva tabla presenta información de manera estructurada y organizada, similar a las tablas de datos modernas.

## 🏗️ Estructura de la Tabla

### **Encabezados de Columnas**
```
| Usuario | Información | Rol | Estado | Progreso | Ingreso | Acciones |
```

### **Información por Columna**

#### **1. Usuario (Avatar)**
- **Avatar circular** con iniciales del usuario
- **Fondo azul** (#3b82f6) para consistencia visual
- **Iniciales en blanco** para contraste

#### **2. Información**
- **Nombre completo** o username
- **Email** del usuario
- **Tipografía jerárquica** (nombre más grande, email más pequeño)

#### **3. Rol**
- **Badge con icono** según el tipo de rol:
  - `shield-checkmark` para Administradores (TIPO_4)
  - `person` para Usuarios básicos (TIPO_1)
  - `leaf` para Especialistas en Germinación (TIPO_2)
  - `flower` para otros roles
- **Fondo azul claro** (#e0e7ff)
- **Texto azul oscuro** (#3730a3)

#### **4. Estado**
- **Badge dinámico** según el estado:
  - **Verde** (#dcfce7) para usuarios activos
  - **Rojo** (#fee2e2) para usuarios inactivos
- **Icono contextual** (checkmark-circle / close-circle)

#### **5. Progreso**
- **Barra de progreso visual** (60px de ancho, 4px de alto)
- **Texto con métricas** (actual/meta o porcentaje)
- **Lógica adaptativa** según el rol:
  - Especialistas en Germinación: Solo germinaciones
  - Especialistas en Polinización: Solo polinizaciones
  - Otros roles: Promedio de ambas métricas

#### **6. Ingreso**
- **Fecha formateada** (DD/MM/AA)
- **Texto gris** (#6b7280)
- **Centrado** en la columna

#### **7. Acciones**
- **Tres botones circulares**:
  - **Ver** (azul): `eye-outline` - Ver detalles del usuario
  - **Editar** (verde): `create-outline` - Editar usuario
  - **Eliminar** (rojo): `trash-outline` - Eliminar usuario
- **Iconos blancos** sobre fondo de color
- **Tamaño consistente** (32x32px)

## 🎨 Diseño Visual

### **Paleta de Colores**
```css
/* Colores Principales */
--primary-blue: #3b82f6;      /* Azul principal */
--primary-green: #10b981;     /* Verde para acciones positivas */
--primary-red: #ef4444;       /* Rojo para acciones destructivas */
--text-primary: #1f2937;      /* Texto principal */
--text-secondary: #6b7280;    /* Texto secundario */

/* Colores de Estado */
--success-bg: #dcfce7;        /* Fondo verde para activos */
--success-text: #16a34a;      /* Texto verde para activos */
--error-bg: #fee2e2;          /* Fondo rojo para inactivos */
--error-text: #dc2626;        /* Texto rojo para inactivos */

/* Colores de Fondo */
--background: #f8fafc;        /* Fondo de la app */
--card-background: #ffffff;   /* Fondo de tarjetas */
--header-background: #f8fafc; /* Fondo del header */
```

### **Tipografía**
- **Headers**: 14px, peso 600, color #374151
- **Nombres de usuario**: 14px, peso 600, color #1f2937
- **Email**: 12px, peso normal, color #6b7280
- **Badges**: 12px, peso 500
- **Fechas**: 12px, peso normal, color #6b7280

### **Espaciado**
- **Padding vertical filas**: 16px
- **Padding horizontal**: 16px
- **Gap entre botones**: 8px
- **Altura del header**: 12px padding vertical

## 🔧 Implementación Técnica

### **Estructura de Archivos**
```
Fronted/PoliGer/
├── app/(tabs)/perfil.tsx                    # Componente principal
├── utils/Perfil/
│   ├── styles.tsx                          # Estilos originales
│   └── userManagementStyles.tsx            # Estilos de la tabla
└── docs/
    └── TABLA_USUARIOS_DISEÑO.md            # Esta documentación
```

### **Estilos Clave**
```tsx
// Contenedor principal de la tabla
userTableContainer: {
  backgroundColor: '#ffffff',
  borderRadius: 8,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
}

// Header de la tabla
tableHeader: {
  backgroundColor: '#f8fafc',
  flexDirection: 'row',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
}

// Filas de datos
tableRow: {
  flexDirection: 'row',
  paddingVertical: 16,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#f3f4f6',
  alignItems: 'center',
}
```

### **Lógica de Progreso**
```tsx
// Adaptación según el rol del usuario
const rol = usuario.profile?.rol || '';
const esEspecialistaGerminacion = rol.includes('GERMINACION') || rol.includes('Germinacion');
const esEspecialistaPolinizacion = rol.includes('POLINIZACION') || rol.includes('Polinizacion');

if (esEspecialistaGerminacion) {
  // Mostrar solo progreso de germinaciones
} else if (esEspecialistaPolinizacion) {
  // Mostrar solo progreso de polinizaciones
} else {
  // Mostrar promedio de ambas métricas
}
```

## 📱 Responsive Design

### **Columnas Flexibles**
- **Avatar**: Ancho fijo (50px)
- **Información**: Flex 2 (más espacio para nombres largos)
- **Rol**: Flex 1.5
- **Estado**: Flex 1
- **Progreso**: Flex 1.5
- **Fecha**: Flex 1
- **Acciones**: Flex 1

### **Adaptabilidad**
- **Texto truncado** automáticamente si es muy largo
- **Badges adaptativos** según el contenido
- **Barras de progreso** con ancho fijo para consistencia

## 🚀 Funcionalidades

### **Acciones Disponibles**
1. **Ver Usuario**: Modal con información detallada (pendiente de implementar)
2. **Editar Usuario**: Modal de edición existente
3. **Eliminar Usuario**: Confirmación doble con validaciones

### **Estados Visuales**
- **Hover**: Efectos de hover en botones (nativo de React Native)
- **Loading**: Indicador de carga mientras se procesan acciones
- **Empty State**: Mensaje cuando no hay usuarios

## 🎯 Beneficios del Diseño

### **Para el Usuario**
- ✅ **Escaneo rápido**: Información organizada en columnas
- ✅ **Acciones claras**: Botones con iconos intuitivos
- ✅ **Estados visuales**: Colores que indican estado inmediatamente
- ✅ **Información completa**: Todos los datos relevantes visibles

### **Para el Sistema**
- ✅ **Mantenibilidad**: Estilos separados y organizados
- ✅ **Escalabilidad**: Fácil agregar nuevas columnas
- ✅ **Consistencia**: Patrones de diseño uniformes
- ✅ **Performance**: Renderizado eficiente de listas

## 🔄 Próximas Mejoras

### **Funcionalidades**
- [ ] **Ordenamiento**: Por columnas (nombre, fecha, rol)
- [ ] **Filtrado**: Por rol, estado, fecha de ingreso
- [ ] **Búsqueda**: En tiempo real por nombre o email
- [ ] **Paginación**: Para listas muy grandes

### **UX/UI**
- [ ] **Selección múltiple**: Para acciones en lote
- [ ] **Vista de detalles**: Modal expandido
- [ ] **Exportación**: PDF/Excel de la tabla
- [ ] **Animaciones**: Transiciones suaves

---

**La nueva tabla de usuarios proporciona una interfaz profesional, organizada y eficiente para la gestión de usuarios del sistema, siguiendo las mejores prácticas de diseño de datos.**
