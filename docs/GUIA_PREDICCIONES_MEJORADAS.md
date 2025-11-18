# 🌱 Guía de Usuario - Sistema de Predicciones de Germinación Mejorado

## 📋 Índice

1. [Introducción](#introducción)
2. [Nuevas Funcionalidades](#nuevas-funcionalidades)
3. [Cómo Usar las Predicciones Mejoradas](#cómo-usar-las-predicciones-mejoradas)
4. [Sistema de Alertas](#sistema-de-alertas)
5. [Interpretación de Resultados](#interpretación-de-resultados)
6. [Análisis y Reportes](#análisis-y-reportes)
7. [Solución de Problemas](#solución-de-problemas)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Introducción

El Sistema de Predicciones de Germinación Mejorado de PoliGer utiliza inteligencia artificial para proporcionar estimaciones más precisas sobre cuándo germinarán tus semillas. Esta guía te ayudará a aprovechar al máximo estas nuevas funcionalidades.

### ¿Qué hay de nuevo?

- **Predicciones más precisas** usando modelo de Machine Learning
- **Rangos de confianza** con fechas mínima, probable y máxima
- **Alertas automáticas** para germinaciones próximas
- **Recomendaciones específicas** por especie
- **Análisis de precisión** del modelo
- **Exportación de datos** para análisis externos

---

## 🚀 Nuevas Funcionalidades

### 1. Predicciones con Inteligencia Artificial

El sistema ahora utiliza el modelo `germinacion.bin` entrenado con datos históricos para generar predicciones más precisas basadas en:

- **Especie y género** de la planta
- **Condiciones climáticas** (I, IW, IC, W, C)
- **Fecha de siembra**
- **Datos históricos** de germinaciones similares

### 2. Rangos de Confianza

Cada predicción incluye:
- **Fecha más probable** de germinación
- **Fecha mínima** (escenario optimista)
- **Fecha máxima** (escenario conservador)
- **Nivel de confianza** (alta, media, baja)

### 3. Sistema de Alertas Inteligente

Recibe notificaciones automáticas:
- **7 días antes**: Preparación para monitoreo
- **3 días antes**: Alerta de alta prioridad
- **Día estimado**: Alerta crítica
- **Después de fecha**: Seguimiento necesario

### 4. Recomendaciones Personalizadas

Obtén consejos específicos según:
- La especie de tu planta
- El nivel de confianza de la predicción
- El estado actual de la germinación
- Las condiciones ambientales requeridas

---

## 📱 Cómo Usar las Predicciones Mejoradas

### Paso 1: Crear una Nueva Germinación

1. **Accede al formulario** de nueva germinación
2. **Completa los datos básicos**:
   - Código de germinación
   - Especie y género
   - Fecha de siembra
   - Condiciones climáticas

3. **El sistema calculará automáticamente** la predicción al guardar

### Paso 2: Revisar la Predicción

Después de crear la germinación, verás:

```
🎯 Predicción de Germinación
┌─────────────────────────────────────┐
│ Fecha más probable: 15/03/2024      │
│ Rango: 08/03 - 22/03/2024          │
│ Confianza: 87% (Alta) ✅            │
│ Días restantes: 12                  │
│ Modelo usado: Machine Learning      │
└─────────────────────────────────────┘
```

### Paso 3: Seguir las Recomendaciones

El sistema te proporcionará recomendaciones específicas:

- **Para Phalaenopsis**: "Temperatura constante 22-28°C, alta humedad"
- **Para Cattleya**: "Mantener humedad 70-80%, evitar encharcamiento"
- **Para Dendrobium**: "Requiere período seco antes de germinación"

### Paso 4: Monitorear Alertas

Revisa regularmente el **Dashboard de Alertas** para:
- Ver germinaciones próximas a su fecha estimada
- Marcar alertas como revisadas
- Actualizar el estado de seguimiento

---

## 🔔 Sistema de Alertas

### Tipos de Alertas

#### 🟢 Alerta de Preparación (7 días antes)
- **Propósito**: Prepararte para el monitoreo intensivo
- **Acción**: Revisar condiciones ambientales
- **Color**: Verde

#### 🟡 Alerta de Alta Prioridad (3 días antes)
- **Propósito**: Monitoreo diario requerido
- **Acción**: Inspeccionar diariamente
- **Color**: Amarillo

#### 🔴 Alerta Crítica (día estimado)
- **Propósito**: Día más probable de germinación
- **Acción**: Revisar múltiples veces al día
- **Color**: Rojo

#### ⚫ Alerta de Seguimiento (después de fecha)
- **Propósito**: Germinación retrasada
- **Acción**: Evaluar condiciones y considerar ajustes
- **Color**: Gris

### Gestión de Alertas

#### Ver Alertas Activas
1. Ve al **Dashboard principal**
2. Busca la sección **"Alertas de Germinación"**
3. Las alertas se ordenan por prioridad

#### Marcar Alerta como Revisada
1. **Toca la alerta** que quieres actualizar
2. **Selecciona el nuevo estado**:
   - En revisión
   - Completada
   - Requiere seguimiento
3. **Agrega observaciones** (opcional)
4. **Guarda los cambios**

#### Estados de Seguimiento

- **Pendiente**: Alerta nueva sin revisar
- **En Revisión**: Siendo monitoreada activamente
- **Completada**: Germinación ocurrió o problema resuelto
- **Vencida**: Requiere atención especial

---

## 📊 Interpretación de Resultados

### Niveles de Confianza

#### 🟢 Alta Confianza (85-100%)
- **Significado**: Predicción muy confiable
- **Rango típico**: ±7 días
- **Acción**: Seguir fechas estimadas de cerca
- **Precisión esperada**: 85-95%

#### 🟡 Confianza Media (70-84%)
- **Significado**: Predicción moderadamente confiable
- **Rango típico**: ±14 días
- **Acción**: Monitorear rango completo de fechas
- **Precisión esperada**: 70-85%

#### 🔴 Confianza Baja (50-69%)
- **Significado**: Predicción con incertidumbre
- **Rango típico**: ±21 días
- **Acción**: Revisar periódicamente, considerar factores adicionales
- **Precisión esperada**: 50-70%

### Modelos Utilizados

#### 🤖 Machine Learning (ML)
- **Descripción**: Predicción basada en modelo entrenado
- **Ventajas**: Mayor precisión, considera patrones complejos
- **Indicador**: "Modelo usado: ML"

#### 📋 Heurístico (HEURISTIC)
- **Descripción**: Predicción basada en reglas generales
- **Ventajas**: Funciona sin datos históricos
- **Indicador**: "Modelo usado: HEURISTIC"

### Colores de Indicadores

- **Verde (#4CAF50)**: Alta confianza, todo bien
- **Naranja (#FF9800)**: Confianza media, atención moderada
- **Rojo (#F44336)**: Baja confianza o alerta crítica
- **Gris (#9E9E9E)**: Estado neutro o información

---

## 📈 Análisis y Reportes

### Dashboard de Estadísticas

Accede a **"Estadísticas de Precisión"** para ver:

#### Métricas Generales
- **Precisión promedio** del modelo
- **Total de predicciones** realizadas
- **Predicciones completadas** vs pendientes
- **Error promedio** en días

#### Análisis por Especie
- **Especies más precisas** en predicciones
- **Número de registros** por especie
- **Precisión específica** por tipo de planta

#### Evolución Temporal
- **Mejora de precisión** a lo largo del tiempo
- **Tendencias** en los datos
- **Efectividad** del reentrenamiento

### Exportar Datos

#### Formato CSV
1. Ve a **"Configuración"** → **"Exportar Datos"**
2. Selecciona **"Predicciones CSV"**
3. Elige el **rango de fechas**
4. **Descarga** el archivo

#### Contenido del Export
```csv
codigo,especie,genero,clima,fecha_siembra,dias_estimados,fecha_estimada,confianza,modelo_usado,precision_real
GERM001,Phalaenopsis amabilis,Phalaenopsis,I,2024-01-15,45,2024-03-01,87.5,ML,89.2
```

### Backup del Modelo

#### Crear Backup Manual
1. Ve a **"Configuración Avanzada"**
2. Selecciona **"Crear Backup del Modelo"**
3. Agrega una **descripción** (opcional)
4. **Confirma** la creación

#### Backups Automáticos
- **Diario**: Backup automático cada 24 horas
- **Pre-entrenamiento**: Antes de cada reentrenamiento
- **Retención**: 30 días de historial

---

## 🔧 Solución de Problemas

### Problema: Predicción con Baja Confianza

#### Posibles Causas
- Especie poco común en la base de datos
- Combinación inusual de parámetros
- Datos históricos insuficientes

#### Soluciones
1. **Revisar datos ingresados** (especie, género, clima)
2. **Usar rango completo** de fechas estimadas
3. **Monitorear más frecuentemente**
4. **Considerar factores ambientales** adicionales

### Problema: Alertas No Aparecen

#### Verificaciones
1. **Fecha de siembra** está correctamente ingresada
2. **Predicción fue calculada** automáticamente
3. **Permisos de usuario** son correctos
4. **Configuración de alertas** está activada

#### Soluciones
1. **Recalcular predicción** manualmente
2. **Verificar configuración** de notificaciones
3. **Contactar administrador** si persiste

### Problema: Modelo No Disponible

#### Síntomas
- Mensaje "Modelo usado: HEURISTIC"
- Confianza consistentemente baja
- Predicciones menos precisas

#### Soluciones
1. **Verificar** que `germinacion.bin` existe
2. **Reiniciar** la aplicación
3. **Reentrenar modelo** si es necesario
4. **Contactar soporte técnico**

### Problema: Predicción Muy Diferente a la Realidad

#### Acciones Inmediatas
1. **Documentar** la diferencia observada
2. **Verificar** condiciones ambientales
3. **Actualizar** estado de la germinación
4. **Marcar** como completada cuando ocurra

#### Mejora del Sistema
- Los datos reales se usan para **reentrenar** el modelo
- La **precisión mejora** con más datos
- El sistema **aprende** de las diferencias

---

## ❓ Preguntas Frecuentes

### ¿Qué tan precisas son las predicciones?

La precisión varía según el nivel de confianza:
- **Alta confianza**: 85-95% de precisión
- **Confianza media**: 70-85% de precisión  
- **Baja confianza**: 50-70% de precisión

### ¿Puedo modificar una predicción después de crearla?

Sí, puedes:
- **Recalcular** la predicción con nuevos datos
- **Actualizar** parámetros como clima o fecha de siembra
- El sistema **regenerará** automáticamente la predicción

### ¿Qué significa el rango de fechas?

El rango representa la **incertidumbre** de la predicción:
- **Fecha mínima**: Escenario más optimista
- **Fecha probable**: Predicción más likely
- **Fecha máxima**: Escenario más conservador

### ¿Cómo mejora el modelo con el tiempo?

El modelo mejora mediante:
- **Reentrenamiento automático** con nuevos datos
- **Aprendizaje** de germinaciones completadas
- **Ajuste** de parámetros basado en precisión real

### ¿Puedo desactivar las alertas?

Actualmente las alertas son automáticas, pero puedes:
- **Marcar** alertas como revisadas
- **Cambiar** el estado de seguimiento
- **Configurar** días de anticipación (próximamente)

### ¿Qué hago si una germinación no ocurre en la fecha estimada?

1. **Mantén la calma** - es normal cierta variación
2. **Revisa** las condiciones ambientales
3. **Continúa** monitoreando según el rango de fechas
4. **Marca** la alerta como "en revisión"
5. **Documenta** cuando finalmente ocurra

### ¿Cómo interpreto las recomendaciones?

Las recomendaciones incluyen:
- **Consejos específicos** por especie
- **Condiciones ambientales** óptimas
- **Acciones** basadas en el estado actual
- **Alertas** sobre factores críticos

### ¿Puedo usar el sistema sin conexión a internet?

El sistema requiere conexión para:
- **Calcular** nuevas predicciones
- **Sincronizar** alertas
- **Actualizar** el modelo

Pero puedes **consultar** predicciones ya calculadas sin conexión.

---

## 📞 Soporte y Contacto

### Soporte Técnico
- **Email**: soporte@poligerlab.com
- **Teléfono**: +57 (1) 234-5678
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

### Documentación Adicional
- **Manual de Usuario Completo**: `/docs/manual-usuario.pdf`
- **Guía de API**: `/docs/api-documentation.md`
- **Videos Tutoriales**: `https://youtube.com/poligerlab`

### Reportar Problemas
1. **Describe** el problema detalladamente
2. **Incluye** capturas de pantalla
3. **Menciona** los pasos para reproducir
4. **Proporciona** información del dispositivo

---

¡Esperamos que esta guía te ayude a aprovechar al máximo el Sistema de Predicciones de Germinación Mejorado! 🌱✨