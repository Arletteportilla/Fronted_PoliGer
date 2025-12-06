# Implementación ML de Germinación - Frontend

## Resumen

Se ha implementado exitosamente la predicción ML de germinación usando Random Forest en el frontend React Native de PoliGer.

## Archivos Creados/Modificados

### 1. Servicio ML - `services/germinacion-ml.service.ts`

**Ubicación**: `C:\Users\arlet\Desktop\78\PoliGer\services\germinacion-ml.service.ts`

**Funcionalidades**:
- ✅ Clase `GerminacionMLService` con patrón Singleton
- ✅ Método `predecir()` para realizar predicciones ML
- ✅ Método `obtenerInfoModelo()` para obtener metadata del modelo
- ✅ Validación completa de datos de entrada
- ✅ Manejo robusto de errores (400, 401, 403, 500, 503)
- ✅ Utilidades de formato (fechas, confianza, colores)
- ✅ Normalización de clima y estado de cápsula

**Interfaces TypeScript**:
```typescript
PrediccionGerminacionMLRequest {
  fecha_siembra: string;
  especie: string;
  clima: string;
  estado_capsula: string;
  s_stock?: number;
  c_solic?: number;
  dispone?: number;
}

PrediccionGerminacionMLResponse {
  dias_estimados: number;
  fecha_siembra: string;
  fecha_estimada_germinacion: string;
  confianza: number;
  nivel_confianza: 'alta' | 'media' | 'baja';
  modelo: string;
  detalles: {...};
  timestamp: string;
}
```

**Endpoints del API**:
- POST `/api/predicciones/germinacion/ml/` - Realizar predicción
- GET `/api/ml/germinacion/model-info/` - Información del modelo

---

### 2. Componente de Predicción - `components/germinaciones/PrediccionMLGerminacion.tsx`

**Ubicación**: `C:\Users\arlet\Desktop\78\PoliGer\components\germinaciones\PrediccionMLGerminacion.tsx`

**Características**:
- ✅ Predicción automática con debounce de 800ms
- ✅ Detección automática de campos completos
- ✅ Evita duplicados mediante firma de request
- ✅ Loading states con ActivityIndicator
- ✅ Manejo de errores con mensajes amigables
- ✅ Display de resultados con diseño profesional
- ✅ Indicadores de confianza con colores
- ✅ Advertencias para especies nuevas
- ✅ Días restantes hasta germinación
- ✅ Información del modelo y detalles de entrada

**Props**:
```typescript
{
  formData: {
    fecha_siembra?: string;
    especie?: string;
    clima?: string;
    estado_capsula?: string;
    cantidad_solicitada?: number;
    no_capsulas?: number;
  };
  onPrediccionComplete?: (resultado) => void;
  disabled?: boolean;
}
```

**Estados Visuales**:
1. **Loading**: Spinner + mensaje "Calculando predicción ML..."
2. **Error**: Icono de advertencia + mensaje descriptivo
3. **Resultado**: Card completo con toda la información

---

### 3. Integración en Formulario - `app/(tabs)/addGerminacion.tsx`

**Modificaciones**:
- ✅ Importación del componente `PrediccionMLGerminacion`
- ✅ Estado para almacenar predicción ML
- ✅ Handler `handlePrediccionComplete()`
- ✅ Sección de predicción con header estilizado
- ✅ Posicionamiento después de todos los campos del formulario
- ✅ Estilos específicos para la sección de predicción

**Ubicación en el formulario**:
- Aparece después del campo "Responsable de Germinación"
- Antes de los botones de acción
- Se actualiza automáticamente al cambiar campos requeridos

---

### 4. Actualización del Servicio General - `services/prediccion.service.ts`

**Nuevos métodos agregados**:
```typescript
// Predicción ML
predecirGerminacionML(data): Promise<PrediccionGerminacionMLResponse>
obtenerInfoModeloGerminacion()

// Utilidades
formatearFechaGerminacion(fecha: string): string
calcularDiasRestantesGerminacion(fechaObjetivo: string): number
obtenerColorConfianzaGerminacion(nivel): string
normalizarEstadoCapsula(estado: string): string
normalizarClima(clima: string): string
```

---

### 5. Exportaciones - `components/germinaciones/index.ts`

**Actualizado**:
```typescript
export { PrediccionMLGerminacion } from './PrediccionMLGerminacion';
```

---

## Flujo de Funcionamiento

### 1. Usuario completa formulario de germinación

```
Campos requeridos:
- Fecha de Siembra ✓
- Especie ✓
- Clima ✓
- Estado de Cápsula ✓

Campos opcionales:
- Cantidad Solicitada
- Número de Cápsulas
```

### 2. Predicción automática se dispara

```typescript
useEffect(() => {
  // Verifica campos mínimos
  if (fecha_siembra && especie && clima && estado_capsula && !disabled) {
    // Debounce de 800ms
    setTimeout(() => realizarPrediccion(), 800);
  }
}, [formData]);
```

### 3. Request al backend

```typescript
POST /api/predicciones/germinacion/ml/
{
  "fecha_siembra": "2024-12-05",
  "especie": "Phragmipedium kovachii",
  "clima": "IC",
  "estado_capsula": "Cerrada",
  "s_stock": 100,
  "c_solic": 50,
  "dispone": 0
}
```

### 4. Pipeline del backend (Random Forest)

```
PASO 1: Feature Engineering
  - Temporal features (mes, día, trimestre, semana)
  - Cyclic features (sin/cos)
  - Derived features (log, ratios)

PASO 2: One-Hot Encoding
  - CLIMA, ESPECIE_AGRUPADA, E.CAPSU
  - Manejo de especies nuevas (vector zero)

PASO 3: Feature Alignment
  - Alinear a 129 features en orden exacto
  - Rellenar con 0 las columnas faltantes

PASO 4: Normalización y Predicción
  - RobustScaler
  - RandomForestRegressor.predict()
```

### 5. Response procesada

```json
{
  "dias_estimados": 87,
  "fecha_siembra": "2024-12-05",
  "fecha_estimada_germinacion": "2025-03-02",
  "confianza": 85,
  "nivel_confianza": "alta",
  "modelo": "Random Forest",
  "detalles": {
    "especie_original": "Phragmipedium kovachii",
    "especie_agrupada": "Phragmipedium kovachii",
    "clima": "IC",
    "estado_capsula": "Cerrada",
    "s_stock": 100,
    "c_solic": 50,
    "dispone": 0,
    "features_generadas": 129,
    "es_especie_nueva": false
  }
}
```

### 6. Display en UI

```
┌─────────────────────────────────────────┐
│ ✓ Predicción de Germinación             │
├─────────────────────────────────────────┤
│                                          │
│   Días Estimados de Germinación         │
│            87 días                       │
│                                          │
│ 📅 Fecha de Siembra                     │
│    5 de diciembre de 2024               │
│                                          │
│ 📅 Fecha Estimada de Germinación        │
│    2 de marzo de 2025                   │
│                                          │
│ ⏰ 87 días restantes                    │
│                                          │
│ Nivel de Confianza                      │
│ [85% - ALTA] ████████████████           │
│                                          │
│ Parámetros de Entrada                   │
│ Especie: Phragmipedium kovachii         │
│ Clima: IC                               │
│ Estado Cápsula: Cerrada                 │
│                                          │
│ Información del Modelo                  │
│ Algoritmo: Random Forest                │
│ Features generadas: 129                 │
│ R² Score: ~85%                          │
└─────────────────────────────────────────┘
```

---

## Características Implementadas

### ✅ Validación de Entrada

- Fecha en formato YYYY-MM-DD
- Fecha no puede ser futura
- Clima: I, IW, IC, W, C, Cool, Warm, Intermedio
- Estado cápsula: Cerrada, Abierta, Semiabiert
- Campos numéricos >= 0

### ✅ Manejo de Errores

| Código | Descripción | Mensaje Frontend |
|--------|-------------|------------------|
| 400 | Datos inválidos | "Datos inválidos: [detalles]" |
| 401 | No autenticado | "Sesión expirada" |
| 403 | Sin permisos | "No tienes permisos" |
| 500 | Error servidor | "Error en el pipeline" |
| 503 | Modelo no disponible | "Modelo no disponible temporalmente" |

### ✅ Optimizaciones

1. **Debounce**: 800ms para evitar múltiples llamadas
2. **Firma de Request**: Evita duplicados exactos
3. **Cleanup**: Limpia timeouts al desmontar componente
4. **Condicional**: Solo predice con datos completos
5. **Loading States**: Feedback visual inmediato

### ✅ UX Mejorado

1. **Predicción Automática**: No requiere botón manual
2. **Feedback Visual**: Loading, error, success states
3. **Colores Semánticos**:
   - Verde (#4CAF50): Confianza alta (≥85%)
   - Amarillo (#FFC107): Confianza media (70-84%)
   - Naranja (#FF9800): Confianza baja (<70%)
4. **Advertencias Contextuales**: Para especies nuevas
5. **Información Completa**: Todos los detalles disponibles

---

## Diferencias con Polinización ML

| Aspecto | Polinización (XGBoost) | Germinación (Random Forest) |
|---------|------------------------|------------------------------|
| **Modelo** | XGBoost | Random Forest |
| **Features** | 16 | 129 |
| **R² Score** | 95.63% | ~85% |
| **Encoding** | Label Encoding | One-Hot Encoding |
| **Scaler** | StandardScaler | RobustScaler |
| **Pipeline** | 2 pasos | 4 pasos |
| **Especies nuevas** | Penalización -5% por categoría | Agrupadas como "OTRAS" (-10%) |
| **Color tema** | Azul (#2196F3) | Verde (#2E7D32) |

---

## Testing

### Casos de Prueba Recomendados

#### 1. Especie Conocida (Top 100)
```typescript
{
  fecha_siembra: "2024-12-05",
  especie: "Phragmipedium kovachii",
  clima: "IC",
  estado_capsula: "Cerrada"
}
// Esperado: Confianza 85% (alta)
```

#### 2. Especie Nueva
```typescript
{
  fecha_siembra: "2024-12-05",
  especie: "Especie Desconocida XYZ",
  clima: "I",
  estado_capsula: "Abierta"
}
// Esperado: Confianza 75% (media), agrupada como "OTRAS"
```

#### 3. Validación de Fecha Futura
```typescript
{
  fecha_siembra: "2025-12-31", // Futura
  especie: "Cattleya maxima",
  clima: "W",
  estado_capsula: "Semiabierta"
}
// Esperado: Error "fecha_siembra no puede ser futura"
```

#### 4. Campos Incompletos
```typescript
{
  fecha_siembra: "2024-12-05",
  especie: "", // Faltante
  clima: "IC",
  estado_capsula: "Cerrada"
}
// Esperado: No se dispara predicción (silencioso)
```

---

## Próximos Pasos (Opcional)

1. **Analytics**: Tracking de uso de predicciones
2. **Caché**: Guardar predicciones en localStorage
3. **Comparación**: Mostrar predicción vs real después de germinación
4. **Feedback Loop**: Permitir al usuario reportar precisión
5. **Gráficos**: Visualización de distribución de predicciones
6. **Export**: Incluir predicción en PDF/Excel
7. **Notificaciones**: Alertas cuando se acerque fecha estimada

---

## Troubleshooting

### Error: "Modelo de predicción no disponible"
**Causa**: Backend no tiene el modelo cargado
**Solución**: Verificar que existan los archivos en backend:
- `random_forest_germinacion.joblib`
- `germinacion_transformador.pkl`
- `feature_order_germinacion.json`

### Error: "Error de conexión"
**Causa**: Backend no está corriendo o problemas de red
**Solución**:
1. Verificar que Django está corriendo en `http://127.0.0.1:8000`
2. Verificar configuración de `services/config.ts`
3. Revisar firewall/antivirus

### Predicción no se dispara automáticamente
**Causa**: Faltan campos requeridos
**Solución**: Verificar que estén completos:
- fecha_siembra
- especie
- clima
- estado_capsula

### TypeScript warnings en IDE
**Causa**: Caché de TypeScript desactualizado
**Solución**:
```bash
# Limpiar caché y reiniciar
npx expo start -c
```

---

## Documentación de Referencia

### Backend
- [RESUMEN_PARA_FRONTEND.md](C:\Users\arlet\Desktop\78\BACK\RESUMEN_PARA_FRONTEND.md)
- [germinacion_predictor.py](C:\Users\arlet\Desktop\78\BACK\backend\laboratorio\ml\predictors\germinacion_predictor.py)

### Frontend
- [germinacion-ml.service.ts](C:\Users\arlet\Desktop\78\PoliGer\services\germinacion-ml.service.ts)
- [PrediccionMLGerminacion.tsx](C:\Users\arlet\Desktop\78\PoliGer\components\germinaciones\PrediccionMLGerminacion.tsx)
- [addGerminacion.tsx](C:\Users\arlet\Desktop\78\PoliGer\app\(tabs)\addGerminacion.tsx)

---

## Métricas del Modelo

| Métrica | Valor |
|---------|-------|
| **R² Score** | ~0.85 (85%) |
| **RMSE** | ~52 días |
| **Features** | 129 |
| **Top Especies** | 100 |
| **Algoritmo** | Random Forest Regressor |
| **Scaler** | RobustScaler (resistente a outliers) |

---

## Conclusión

✅ **Implementación Completa y Funcional**

La predicción ML de germinación está completamente integrada en el frontend de PoliGer, siguiendo los mismos patrones de diseño que la predicción de polinización pero adaptada a las características específicas del modelo Random Forest.

**Características clave**:
- Predicción automática en tiempo real
- Manejo robusto de errores
- UX optimizada con feedback visual
- Código limpio y mantenible
- TypeScript con tipos completos
- Documentación exhaustiva

**Estado**: Listo para uso en producción 🚀
