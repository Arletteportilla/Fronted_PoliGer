# Estructura de Componentes

Esta carpeta contiene todos los componentes de la aplicación organizados por funcionalidad y propósito.

## Estructura de Carpetas

### 📁 `alerts/`
Componentes relacionados con alertas y notificaciones
- `AlertasCombinadas.tsx` - Alertas combinadas del sistema
- `AlertasGerminacionMejoradas.tsx` - Alertas específicas de germinaciones
- `AlertasPolinizacion.tsx` - Alertas específicas de polinizaciones
- `NotificationItem.tsx` - Item individual de notificación
- `NotificationsList.tsx` - Lista de notificaciones

### 📁 `cards/`
Componentes de tarjetas para mostrar información
- `GerminacionCard.tsx` - Tarjeta de germinación
- `PolinizacionCard.tsx` - Tarjeta de polinización

### 📁 `charts/`
Componentes de gráficos y estadísticas
- `EstadisticasPrecisionPolinizacion.tsx` - Estadísticas de precisión
- `VictoryTestComponent.tsx` - Componente de prueba para gráficos
- `VictoryUniversal.tsx` - Componente universal de gráficos

### 📁 `common/`
Componentes reutilizables y generales
- `AutocompleteInput.tsx` - Input con autocompletado
- `IndicadorConfianza.tsx` - Indicador de confianza
- `OptionsPicker.tsx` - Selector de opciones
- `ProcessLine.tsx` - Línea de proceso
- `RolePermissionsBadge.tsx` - Badge de permisos de rol
- `SimpleCalendarPicker.tsx` - Selector de calendario simple

### 📁 `dashboard/`
Componentes del dashboard principal
- `DashboardWithCards.tsx` - Dashboard con tarjetas
- `DiagnosticPanel.tsx` - Panel de diagnóstico

### 📁 `filters/`
Componentes de filtros
- `GerminacionFilters.tsx` - Filtros de germinaciones
- `PolinizacionFilters.tsx` - Filtros de polinizaciones
- `Pagination.tsx` - Componente de paginación

### 📁 `forms/`
Componentes de formularios
- `FormField.tsx` - Campo de formulario genérico
- `FormPicker.tsx` - Selector de formulario
- `GerminacionForm.tsx` - Formulario de germinación
- `PolinizacionForm.tsx` - Formulario de polinización

### 📁 `germinaciones/`
Componentes específicos de germinaciones
- `GerminacionesContent.tsx` - Contenido principal de germinaciones
- `GerminacionesHeader.tsx` - Header de germinaciones
- `GerminacionFormWithOptions.tsx` - Formulario con opciones
- `PrediccionGerminacionCard.tsx` - Tarjeta de predicción

### 📁 `modals/`
Componentes de modales
- `ExportBackupModal.tsx` - Modal de exportación y backup
- `PrediccionMejoradaModal.tsx` - Modal de predicción mejorada

### 📁 `navigation/`
Componentes de navegación y rutas
- `PermissionBasedTabs.tsx` - Tabs basadas en permisos
- `ProtectedRoute.tsx` - Rutas protegidas
- `TabNavigation.tsx` - Navegación por tabs

### 📁 `polinizaciones/`
Componentes específicos de polinizaciones
- `PrediccionPolinizacion.tsx` - Predicción de polinización

### 📁 `ui/`
Componentes básicos de UI
- `EmptyState.tsx` - Estado vacío
- `LoadingOverlay.tsx` - Overlay de carga

### 📁 `UserManagement/`
Componentes de gestión de usuarios
- `CreateUserModal.tsx` - Modal de creación de usuario
- `EditUserModal.tsx` - Modal de edición de usuario
- `UserManagementTable.tsx` - Tabla de gestión de usuarios

## Uso de Importaciones

Cada carpeta tiene un archivo `index.ts` que exporta todos sus componentes, permitiendo importaciones más limpias:

```typescript
// ❌ Antes
import { TabNavigation } from '@/components/TabNavigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ✅ Ahora
import { TabNavigation, ProtectedRoute } from '@/components/navigation';
```

## Principios de Organización

1. **Por funcionalidad**: Los componentes se agrupan según su propósito
2. **Reutilización**: Los componentes comunes están en `common/`
3. **Especificidad**: Los componentes específicos de módulos tienen su propia carpeta
4. **Escalabilidad**: La estructura permite agregar nuevos módulos fácilmente

## Agregar Nuevos Componentes

1. Identifica la carpeta apropiada según la funcionalidad
2. Crea el componente en la carpeta correspondiente
3. Actualiza el archivo `index.ts` de la carpeta
4. Usa importaciones desde el índice en otros archivos