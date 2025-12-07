/**
 * Utilidades para colores de estados y tipos
 * Centraliza la lógica de colores que estaba duplicada en múltiples componentes
 */

/**
 * Obtiene el color correspondiente a un estado de polinización o germinación
 * @param estado - Estado de la polinización/germinación
 * @returns Color hexadecimal
 */
export const getEstadoColor = (estado?: string): string => {
  const estadoLower = estado?.toLowerCase() || '';

  const colorMap: Record<string, string> = {
    // Estados completados/finalizados
    'completado': '#10B981',     // Green
    'finalizado': '#10B981',     // Green
    'lista': '#10B981',          // Green
    'listo': '#10B981',          // Green

    // Estados en proceso
    'en proceso': '#F59E0B',     // Orange
    'en_proceso': '#F59E0B',     // Orange
    'en desarrollo': '#fbbf24',  // Yellow
    'pendiente': '#f59e0b',      // Orange

    // Estados iniciales
    'ingresado': '#6B7280',      // Gray
    'inicial': '#3B82F6',        // Blue

    // Estados específicos
    'maduro': '#60a5fa',         // Light Blue
    'abierta': '#10B981',        // Green
    'cerrada': '#6B7280',        // Gray
    'semiabierta': '#F59E0B',    // Orange
  };

  return colorMap[estadoLower] || '#6B7280'; // Default: Gray
};

/**
 * Obtiene el color correspondiente a un tipo de polinización
 * @param tipo - Tipo de polinización (SELF, SIBLING, HÍBRIDA)
 * @returns Color hexadecimal
 */
export const getTipoColor = (tipo?: string): string => {
  const tipoLower = tipo?.toLowerCase() || '';

  const colorMap: Record<string, string> = {
    'self': '#3B82F6',           // Blue
    'sibling': '#8B5CF6',        // Purple
    'híbrida': '#F59E0B',        // Orange
    'hibrida': '#F59E0B',        // Orange
    'replante': '#3b82f6',       // Blue
  };

  return colorMap[tipoLower] || '#3B82F6'; // Default: Blue
};

/**
 * Obtiene el color correspondiente a un nivel de clima
 * @param clima - Nivel de clima (I, IW, IC, W, C)
 * @returns Color hexadecimal
 */
export const getClimaColor = (clima?: string): string => {
  const climaLower = clima?.toLowerCase() || '';

  const colorMap: Record<string, string> = {
    'i': '#3B82F6',              // Blue - Intermedio
    'iw': '#F59E0B',             // Orange - Intermedio Caliente
    'ic': '#60a5fa',             // Light Blue - Intermedio Frío
    'w': '#93c5fd',              // Very Light Blue - Frío
    'c': '#f87171',              // Red - Caliente
  };

  return colorMap[climaLower] || '#6B7280'; // Default: Gray
};

/**
 * Obtiene el color correspondiente al progreso
 * @param progreso - Porcentaje de progreso (0-100)
 * @returns Color hexadecimal
 */
export const getProgresoColor = (progreso: number): string => {
  if (progreso >= 100) return '#10B981'; // Green - Completado
  if (progreso >= 75) return '#60a5fa';  // Light Blue - Casi completo
  if (progreso >= 50) return '#F59E0B';  // Orange - En proceso
  if (progreso >= 25) return '#fbbf24';  // Yellow - Iniciando
  return '#6B7280';                       // Gray - Sin progreso
};
