# Refactorización del Módulo de Perfil - Plan Fase 2

## Estado Actual

✅ **Fase 1 Completada**:
- 4 hooks reutilizables creados (useConfirmation, useModalState, usePaginatedSearch, useCRUDOperations)
- 1 utilidad de colores (colorHelpers.ts)
- 3 componentes actualizados
- ~210 líneas de código duplicado eliminadas
- Código 100% reutilizable listo para usar

## Desafío de Fase 2

El archivo `perfil.tsx` tiene **1382 líneas** y requiere cambios en **~300+ ubicaciones** para usar los nuevos hooks. Hacer todos estos cambios de golpe es riesgoso y puede introducir errores.

## Recomendación

Tienes **3 opciones**:

### Opción 1: Refactorización Gradual (RECOMENDADA)
Aplicar los hooks gradualmente, una sección a la vez, probando entre cada cambio.

**Ventajas**:
- Menos riesgoso
- Puedes probar después de cada cambio
- Fácil revertir si algo falla

**Desventajas**:
- Más tiempo
- Requiere disciplina

### Opción 2: Dejar como Está
Los hooks están creados y listos. Puedes usarlos en:
- Nuevos componentes
- Nuevas features
- Componentes pequeños que necesites refactorizar

**Ventajas**:
- Sin riesgo
- Hooks disponibles para uso futuro
- Código nuevo ya será mejor

**Desventajas**:
- perfil.tsx sigue con código duplicado
- No reduce complejidad del archivo principal

### Opción 3: Refactorización Completa Asistida
Refactorizar todo perfil.tsx en una sola sesión con pasos guiados y pruebas.

**Ventajas**:
- Máxima reducción de código
- perfil.tsx completamente limpio
- ~450 líneas eliminadas

**Desventajas**:
- Requiere 1-2 horas
- Riesgo medio de bugs
- Necesita pruebas exhaustivas

---

## Plan Detallado - Opción 1: Refactorización Gradual

Si eliges la Opción 1, sigue estos pasos en orden:

### Paso 1: Reemplazar useConfirmation en handleLogout (10 min)

**Archivo**: `perfil.tsx` líneas 495-519

**Antes**:
```typescript
const handleLogout = useCallback(async () => {
  if (Platform.OS === 'web') {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      try {
        setLoading(true);
        await SecureStore.secureStore.removeItem('authToken');
        await forceLogout();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      } finally {
        setLoading(false);
      }
    }
  } else {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            await SecureStore.secureStore.removeItem('authToken');
            await forceLogout();
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
          } finally {
            setLoading(false);
          }
        }}
      ]
    );
  }
}, [forceLogout]);
```

**Después**:
```typescript
// 1. Agregar import al inicio del archivo
import { useConfirmation } from '@/hooks';

// 2. Agregar hook en la sección de hooks
const { showConfirmation } = useConfirmation();

// 3. Simplificar la función
const handleLogout = useCallback(async () => {
  const confirmed = await showConfirmation(
    'Cerrar sesión',
    '¿Estás seguro de que deseas cerrar sesión?',
    'Cerrar sesión',
    'Cancelar'
  );

  if (!confirmed) return;

  try {
    setLoading(true);
    await SecureStore.secureStore.removeItem('authToken');
    await forceLogout();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    setLoading(false);
  }
}, [forceLogout, showConfirmation]);
```

**Líneas eliminadas**: ~20
**Probar**: Logout en web y mobile

---

### Paso 2: Reemplazar useModalState para Polinizaciones (30 min)

**Afectados**: 8 estados + ~50 referencias

**2.1 Reemplazar estados** (líneas 80-82):
```typescript
// ANTES (3 variables separadas)
const [showPolinizacionDetailsModal, setShowPolinizacionDetailsModal] = useState(false);
const [showPolinizacionEditModal, setShowPolinizacionEditModal] = useState(false);
const [selectedPolinizacion, setSelectedPolinizacion] = useState<Polinizacion | null>(null);

// DESPUÉS (1 hook reutilizable)
const [polinizacionDetailsModal, polinizacionDetailsControls] = useModalState<Polinizacion>();
const [polinizacionEditModal, polinizacionEditControls] = useModalState<Polinizacion>();
```

**2.2 Actualizar handleViewPolinizacion** (líneas 535-538):
```typescript
// ANTES
const handleViewPolinizacion = useCallback((item: Polinizacion) => {
  setSelectedPolinizacion(item);
  setShowPolinizacionDetailsModal(true);
}, []);

// DESPUÉS
const handleViewPolinizacion = useCallback((item: Polinizacion) => {
  polinizacionDetailsControls.open(item);
}, [polinizacionDetailsControls]);
```

**2.3 Actualizar handleEditPolinizacion** (líneas 540-543):
```typescript
// ANTES
const handleEditPolinizacion = useCallback((item: Polinizacion) => {
  setSelectedPolinizacion(item);
  setShowPolinizacionEditModal(true);
}, []);

// DESPUÉS
const handleEditPolinizacion = useCallback((item: Polinizacion) => {
  polinizacionEditControls.open(item);
}, [polinizacionEditControls]);
```

**2.4 Actualizar modal de detalles** (línea 1195):
```typescript
// ANTES
{selectedPolinizacion && (
  <PolinizacionDetailsModal
    visible={showPolinizacionEditModal}
    // ... más props con selectedPolinizacion
    onClose={() => {
      setShowPolinizacionEditModal(false);
      setSelectedPolinizacion(null);
    }}
  />
)}

// DESPUÉS
<PolinizacionDetailsModal
  visible={polinizacionEditModal.visible}
  polinizacion={polinizacionEditModal.selectedItem}
  // ... más props
  onClose={polinizacionEditControls.close}
/>
```

**Líneas eliminadas**: ~30
**Probar**: Abrir/cerrar modales de polinización

---

### Paso 3: Reemplazar useModalState para Germinaciones (30 min)

Similar al Paso 2, pero para germinaciones.

**3.1 Reemplazar estados** (líneas 85-93):
```typescript
// ANTES (6 variables)
const [showGerminacionDetailsModal, setShowGerminacionDetailsModal] = useState(false);
const [showGerminacionEditModal, setShowGerminacionEditModal] = useState(false);
const [selectedGerminacion, setSelectedGerminacion] = useState<Germinacion | null>(null);
const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
const [germinacionToChangeStatus, setGerminacionToChangeStatus] = useState<Germinacion | null>(null);
const [showFinalizarModal, setShowFinalizarModal] = useState(false);
const [germinacionToFinalizar, setGerminacionToFinalizar] = useState<Germinacion | null>(null);

// DESPUÉS (3 hooks)
const [germinacionDetailsModal, germinacionDetailsControls] = useModalState<Germinacion>();
const [germinacionEditModal, germinacionEditControls] = useModalState<Germinacion>();
const [germinacionChangeStatusModal, germinacionChangeStatusControls] = useModalState<Germinacion>();
const [germinacionFinalizarModal, germinacionFinalizarControls] = useModalState<Germinacion>();
```

**3.2 Actualizar handlers** (similar al Paso 2):
- handleViewGerminacion (líneas 594-598)
- handleEditGerminacion (líneas 600-604)
- handleOpenChangeStatus (líneas 680-682)
- handleOpenFinalizarGerminacion (líneas 707-710)

**3.3 Actualizar modales**:
- GerminacionDetailsModal (línea 984)
- GerminacionEditModal (línea 994)
- CambiarEstadoModal (línea 1064)
- FinalizarModal (línea 1361)

**Líneas eliminadas**: ~40
**Probar**: Todos los modales de germinación

---

### Paso 4: Reemplazar handleDelete con useCRUDOperations (20 min)

**4.1 Agregar hooks** (después de línea 100):
```typescript
const polinizacionesCRUD = useCRUDOperations(
  polinizacionService,
  {
    entityName: 'polinización',
    idField: 'numero',
    codigoField: 'codigo'
  },
  fetchData
);

const germinacionesCRUD = useCRUDOperations(
  germinacionService,
  {
    entityName: 'germinación',
    idField: 'id',
    codigoField: 'codigo'
  },
  fetchData
);
```

**4.2 Reemplazar handleDeletePolinizacion** (líneas 542-583):
```typescript
// ANTES (~40 líneas con Platform.OS, confirm, Alert, try-catch)
const handleDeletePolinizacion = async (item: Polinizacion) => {
  const codigoCompleto = item.codigo || item.nombre || 'esta polinización';

  if (Platform.OS === 'web') {
    if (confirm(`¿Estás seguro de eliminar la polinización ${codigoCompleto}?`)) {
      try {
        setLoading(true);
        await polinizacionService.delete(item.numero);
        await fetchData();
        toast.success('Polinización eliminada correctamente');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'No se pudo eliminar');
      } finally {
        setLoading(false);
      }
    }
  } else {
    Alert.alert(/* ... mismo código ... */);
  }
};

// DESPUÉS (1 línea)
const handleDeletePolinizacion = polinizacionesCRUD.handleDelete;
```

**4.3 Reemplazar handleDeleteGerminacion** (líneas 608-649):
```typescript
// DESPUÉS (1 línea)
const handleDeleteGerminacion = germinacionesCRUD.handleDelete;
```

**Líneas eliminadas**: ~100
**Probar**: Eliminar polinización y germinación

---

### Paso 5: Simplificar handleDescargarPDF con useConfirmation (15 min)

**Antes** (líneas 470-492):
```typescript
if (Platform.OS === 'web') {
  if (confirm(`¿Descargar PDF de ${tipo}?${searchText}`)) {
    await ejecutarDescarga();
  }
} else {
  Alert.alert('Descargar PDF', `¿Descargar PDF de ${tipo}?${searchText}`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Descargar', onPress: ejecutarDescarga }
  ]);
}
```

**Después**:
```typescript
const confirmed = await showConfirmation(
  'Descargar PDF',
  `¿Descargar PDF de ${tipo}?${searchText}`,
  'Descargar',
  'Cancelar'
);

if (confirmed) {
  await ejecutarDescarga();
}
```

**Líneas eliminadas**: ~15
**Probar**: Descargar PDF en web y mobile

---

## Métricas Estimadas - Fase 2 Completa

| Paso | Líneas Eliminadas | Tiempo | Dificultad |
|------|-------------------|--------|------------|
| 1. useConfirmation (logout) | ~20 | 10 min | Fácil |
| 2. useModalState (polinizaciones) | ~30 | 30 min | Media |
| 3. useModalState (germinaciones) | ~40 | 30 min | Media |
| 4. useCRUDOperations (delete) | ~100 | 20 min | Fácil |
| 5. useConfirmation (PDF) | ~15 | 15 min | Fácil |
| **TOTAL FASE 2** | **~205 líneas** | **~105 min** | |

### Balance Final (Fase 1 + Fase 2)

| Métrica | Valor |
|---------|-------|
| Código duplicado eliminado (Fase 1) | 210 líneas |
| Código duplicado eliminado (Fase 2) | 205 líneas |
| **Total eliminado** | **415 líneas** |
| Código reutilizable creado | 563 líneas |
| **Reducción neta de perfil.tsx** | **205 líneas (15%)** |
| **Tamaño final de perfil.tsx** | **~1177 líneas** |

---

## Checklist de Pruebas

Después de cada paso, verificar:

### Polinizaciones
- [ ] Ver detalles de polinización
- [ ] Editar polinización
- [ ] Eliminar polinización
- [ ] Cambiar estado de polinización
- [ ] Finalizar polinización
- [ ] Buscar polinizaciones
- [ ] Paginar polinizaciones
- [ ] Descargar PDF de polinizaciones

### Germinaciones
- [ ] Ver detalles de germinación
- [ ] Editar germinación
- [ ] Eliminar germinación
- [ ] Cambiar estado de germinación
- [ ] Finalizar germinación
- [ ] Buscar germinaciones
- [ ] Paginar germinaciones
- [ ] Descargar PDF de germinaciones

### General
- [ ] Logout en web
- [ ] Logout en mobile
- [ ] Todos los modales se abren/cierran correctamente
- [ ] Confirmaciones funcionan en web y mobile
- [ ] Toast notifications aparecen
- [ ] Loading states funcionan

---

## Comandos Útiles

```bash
# Hacer backup antes de empezar cada paso
cp app/\(tabs\)/perfil.tsx app/\(tabs\)/perfil.tsx.backup-step-X

# Revertir si algo sale mal
cp app/\(tabs\)/perfil.tsx.backup-step-X app/\(tabs\)/perfil.tsx

# Verificar que no haya errores de TypeScript
npx tsc --noEmit

# Ejecutar la app
npm start
```

---

## Conclusión

### ¿Qué Opción Elegir?

**Opción 1** (Gradual) - Si quieres:
- Minimizar riesgos
- Aprender los hooks mientras refactorizas
- Poder parar en cualquier momento

**Opción 2** (Dejar como está) - Si quieres:
- Sin riesgo
- Los hooks están listos para uso futuro
- Enfocarte en nuevas features

**Opción 3** (Completa) - Si quieres:
- Máxima limpieza de código
- Tienes 1-2 horas disponibles
- Confías en las pruebas

### Próximos Pasos

1. **Decidir qué opción seguir**
2. **Si eliges Opción 1**: Empezar por el Paso 1 (más fácil)
3. **Si eliges Opción 3**: Reservar tiempo para sesión guiada
4. **Si eliges Opción 2**: Los hooks ya están listos para nuevos componentes

**Los hooks creados en Fase 1 ya son un gran logro**. Cualquier código nuevo que escribas puede usarlos desde ya, y refactorizar perfil.tsx es opcional.
