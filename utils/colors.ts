/**
 * Sistema de colores centralizado para PoliGer
 * Define todos los colores utilizados en la aplicación con soporte para tema claro y oscuro
 */

// Colores primarios del sistema (no cambian con el tema)
export const PRIMARY = {
  main: '#182d49',       // Azul navy principal (brand color)
  dark: '#0f1f35',       // Variante oscura
  light: '#e8edf3',      // Variante clara (tint suave)
  contrast: '#ffffff',   // Color de contraste (texto sobre primario)
};

// Colores de fondo y superficie - Tema Claro
const BACKGROUND_LIGHT = {
  primary: '#ffffff',    // Fondo principal
  secondary: '#f8fafc',  // Fondo secundario
  tertiary: '#f3f4f6',   // Fondo terciario
  modal: 'rgba(0, 0, 0, 0.5)', // Overlay de modales
};

// Colores de fondo y superficie - Tema Oscuro
const BACKGROUND_DARK = {
  primary: '#111925',    // Fondo principal (página)
  secondary: '#0b121e',  // Fondo secundario (header/sidebar)
  tertiary: '#354458',   // Fondo de cards/superficies elevadas
  modal: 'rgba(0, 0, 0, 0.75)', // Overlay de modales
};

// Colores de texto - Tema Claro
const TEXT_LIGHT = {
  primary: '#121212',    // Texto principal
  secondary: '#374151',  // Texto secundario
  tertiary: '#6b7280',   // Texto terciario
  disabled: '#9ca3af',   // Texto deshabilitado
  inverse: '#ffffff',    // Texto inverso (sobre fondos oscuros)
};

// Colores de texto - Tema Oscuro
const TEXT_DARK = {
  primary: '#f1f5f9',    // Texto principal (alto contraste)
  secondary: '#c8d8e8',  // Texto secundario
  tertiary: '#abbfcd',   // Texto terciario (más legible que antes)
  disabled: '#8a9ba7',   // Texto deshabilitado (más legible que antes)
  inverse: '#f3f3f3',    // Texto inverso (sobre fondos claros)
};

// Colores de acento y estado (no cambian mucho con el tema)
export const ACCENT = {
  primary: '#182d49',    // Azul navy principal
  secondary: '#182d49',  // Azul navy oscuro
  tertiary: '#e8edf3',   // Tint azul suave
};

// Colores de estado (success, warning, error, info)
export const STATUS = {
  success: '#10B981',    // Verde para éxito
  successDark: '#059669',
  successLight: '#d1fae5',
  warning: '#F59E0B',    // Amarillo/naranja advertencia
  warningDark: '#D97706',
  warningLight: '#FEF3C7',
  error: '#EF4444',      // Rojo error
  errorDark: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#182d49',       // Azul oscuro para info
  infoDark: '#0f1f35',
  infoLight: '#e0e7ff',
  orange: '#f97316',     // Naranja (proceso avanzado)
  orangeLight: '#ffedd5',
};

// Colores de botones y elementos interactivos - Tema Claro
const INTERACTIVE_LIGHT = {
  primary: '#182d49',    // Color primario de botones
  hover: '#f0f0f0',      // Hover general
  pressed: '#e0e0e0',    // Pressed general
  disabled: '#e5e7eb',   // Deshabilitado
  focus: '#182d49',      // Focus
};

// Colores de botones y elementos interactivos - Tema Oscuro
const INTERACTIVE_DARK = {
  primary: '#4a9eda',    // Color primario de botones en dark (azul cielo vibrante)
  hover: '#2d4460',      // Hover general
  pressed: '#3d5878',    // Pressed general
  disabled: '#2d3f55',   // Deshabilitado
  focus: '#60A5FA',      // Focus
};

// Colores de bordes - Tema Claro
const BORDER_LIGHT = {
  light: '#f0f0f0',      // Borde claro
  default: '#e5e7eb',    // Borde por defecto
  medium: '#d1d5db',     // Borde medio
  dark: '#9ca3af',       // Borde oscuro
};

// Colores de bordes - Tema Oscuro
// IMPORTANTE: default NO puede ser igual a background.tertiary (#263548)
const BORDER_DARK = {
  light: '#263548',      // Borde sutil (matches tertiary, para separaciones internas)
  default: '#3a5270',    // Borde por defecto (visible sobre cards)
  medium: '#4d6882',     // Borde medio
  dark: '#6a8299',       // Borde fuerte
};

// Colores de sombras
export const SHADOW = {
  color: '#000000',
  light: 'rgba(0, 0, 0, 0.05)',
  medium: 'rgba(0, 0, 0, 0.1)',
  dark: 'rgba(0, 0, 0, 0.25)',
};

// Colores específicos de módulos - Tema Claro
export const MODULE = {
  germinacion: {
    primary: '#e9ad14',    // Amarillo/dorado
    light: '#fef3c7',
    icon: '#d97706',
  },
  polinizacion: {
    primary: '#182d49',    // Azul oscuro
    light: '#e0e7ff',
    icon: '#1e40af',
  },
  reporte: {
    primary: '#182d49',    // Azul oscuro
    light: '#e0e7ff',
    icon: '#1e40af',
  },
  notificacion: {
    primary: '#e9ad14',    // Amarillo/dorado
    light: '#fef3c7',
    icon: '#d97706',
  },
};

// Colores específicos de módulos - Tema Oscuro
const MODULE_DARK = {
  germinacion: {
    primary: '#e9ad14',    // Amarillo/dorado (visible en dark)
    light: '#2d2200',      // Tint oscuro
    icon: '#f0c04a',       // Ícono más brillante
  },
  polinizacion: {
    primary: '#4a9eda',    // Azul claro (visible en dark, reemplaza navy oscuro)
    light: '#1a3352',      // Tint oscuro
    icon: '#60a5fa',       // Ícono azul claro
  },
  reporte: {
    primary: '#4a9eda',    // Azul claro
    light: '#1a3352',
    icon: '#60a5fa',
  },
  notificacion: {
    primary: '#e9ad14',
    light: '#2d2200',
    icon: '#f0c04a',
  },
};

// Colores de variantes del modal de confirmación
export const CONFIRMATION_VARIANTS = {
  danger: {
    bg: '#EF4444',
    hover: '#DC2626',
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
    icon: 'trash-outline' as const,
  },
  warning: {
    bg: '#F59E0B',
    hover: '#D97706',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    icon: 'warning-outline' as const,
  },
  info: {
    bg: '#182d49',
    hover: '#0f1f34',
    iconBg: '#e0e7ff',
    iconColor: '#182d49',
    icon: 'information-circle-outline' as const,
  },
  download: {
    bg: '#10B981',
    hover: '#059669',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    icon: 'document-text-outline' as const,
  },
};

// Colores de la barra de progreso de estados - Tema Claro
export const PROGRESS_STATES = {
  inicial:           { color: '#182d49', light: '#e8edf3' },
  enProcesoTemprano: { color: '#F59E0B', light: '#FEF3C7' },
  enProcesoAvanzado: { color: '#f97316', light: '#ffedd5' },
  finalizado:        { color: '#10B981', light: '#d1fae5' },
};

// Colores de la barra de progreso de estados - Tema Oscuro
const PROGRESS_STATES_DARK = {
  inicial:           { color: '#4a9eda', light: '#1a3352' }, // Azul claro visible
  enProcesoTemprano: { color: '#F59E0B', light: '#2d2600' },
  enProcesoAvanzado: { color: '#f97316', light: '#2d1a00' },
  finalizado:        { color: '#10B981', light: '#062a1a' },
};

// Colores de estados de cápsula - Tema Claro
export const CAPSULA_STATES = {
  CERRADA: '#6B7280',
  ABIERTA: '#28e86e',
  SEMIABIERTA: '#F59E0B',
};

// Colores de estados de cápsula - Tema Oscuro
const CAPSULA_STATES_DARK = {
  CERRADA: '#94a3b8',    // Más visible en dark
  ABIERTA: '#28e86e',
  SEMIABIERTA: '#F59E0B',
};

// Colores de climas - Tema Claro
export const CLIMA = {
  I: '#182d49',    // Intermedio - Azul
  IW: '#8B5CF6',   // Intermedio-Cálido - Púrpura
  IC: '#06B6D4',   // Intermedio-Frío - Cyan
  W: '#EF4444',    // Cálido - Rojo
  C: '#0EA5E9',    // Frío - Azul claro
};

// Colores de climas - Tema Oscuro
const CLIMA_DARK = {
  I: '#4a9eda',    // Azul claro (navy oscuro es invisible en dark)
  IW: '#a78bfa',   // Púrpura más claro
  IC: '#22d3ee',   // Cyan más claro
  W: '#f87171',    // Rojo más claro
  C: '#38bdf8',    // Azul más claro
};

// Colores para gráficos y visualizaciones - Tema Claro
export const CHART = {
  polinizaciones: STATUS.warning,
  germinaciones: PRIMARY.main,
  colors: [
    '#e9ad14',  // Amarillo/dorado principal
    '#182d49',  // Azul oscuro
    '#F59E0B',  // Naranja
    '#EF4444',  // Rojo
    '#8B5CF6',  // Púrpura
    '#EC4899',  // Rosa
    '#06B6D4',  // Cyan
    '#84CC16',  // Lima
  ],
  gridColor: '#e5e7eb',
  axisColor: '#6b7280',
};

// Colores para gráficos y visualizaciones - Tema Oscuro
const CHART_DARK = {
  polinizaciones: STATUS.warning,
  germinaciones: '#4a9eda',   // Azul claro (navy es invisible en dark)
  colors: [
    '#e9ad14',  // Amarillo/dorado
    '#4a9eda',  // Azul claro (reemplaza navy)
    '#F59E0B',  // Naranja
    '#f87171',  // Rojo claro
    '#a78bfa',  // Púrpura claro
    '#f472b6',  // Rosa claro
    '#22d3ee',  // Cyan claro
    '#a3e635',  // Lima claro
  ],
  gridColor: '#334155',
  axisColor: '#94a3b8',
};

// Colores especiales - Tema Claro
export const SPECIAL = {
  star: '#fbbf24',       // Estrella/favorito
  link: '#182d49',       // Enlaces
  highlight: '#FEF3C7',  // Resaltado
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay general
};

// Colores especiales - Tema Oscuro
const SPECIAL_DARK = {
  star: '#fbbf24',
  link: '#60a5fa',       // Azul claro para enlaces en dark
  highlight: '#2d2600',  // Resaltado oscuro
  overlay: 'rgba(0, 0, 0, 0.65)',
};

// Función para obtener colores según el tema
export function getColors(theme: 'light' | 'dark' = 'light') {
  const isDark = theme === 'dark';
  return {
    primary: PRIMARY,
    background: isDark ? BACKGROUND_DARK : BACKGROUND_LIGHT,
    text: isDark ? TEXT_DARK : TEXT_LIGHT,
    accent: ACCENT,
    status: STATUS,
    interactive: isDark ? INTERACTIVE_DARK : INTERACTIVE_LIGHT,
    border: isDark ? BORDER_DARK : BORDER_LIGHT,
    shadow: SHADOW,
    module: isDark ? MODULE_DARK : MODULE,
    confirmationVariants: CONFIRMATION_VARIANTS,
    progressStates: isDark ? PROGRESS_STATES_DARK : PROGRESS_STATES,
    capsulaStates: isDark ? CAPSULA_STATES_DARK : CAPSULA_STATES,
    clima: isDark ? CLIMA_DARK : CLIMA,
    chart: isDark ? CHART_DARK : CHART,
    special: isDark ? SPECIAL_DARK : SPECIAL,
  };
}

// Exportar objeto completo de colores para fácil acceso (tema claro por defecto)
export const colors = getColors('light');

// Colores planos para uso directo (mantener compatibilidad con código existente)
export default {
  // Primarios
  primary: PRIMARY.main,
  primaryDark: PRIMARY.dark,
  primaryLight: PRIMARY.light,

  // Fondos
  background: BACKGROUND_LIGHT.primary,
  backgroundSecondary: BACKGROUND_LIGHT.secondary,
  backgroundTertiary: BACKGROUND_LIGHT.tertiary,

  // Textos
  text: TEXT_LIGHT.primary,
  textSecondary: TEXT_LIGHT.secondary,
  textTertiary: TEXT_LIGHT.tertiary,
  textDisabled: TEXT_LIGHT.disabled,

  // Acentos
  accent: ACCENT.primary,
  accentSecondary: ACCENT.secondary,

  // Estados
  success: STATUS.success,
  warning: STATUS.warning,
  error: STATUS.error,
  info: STATUS.info,

  // Bordes
  border: BORDER_LIGHT.default,
  borderLight: BORDER_LIGHT.light,
  borderDark: BORDER_LIGHT.dark,

  // Especiales
  star: SPECIAL.star,
  link: SPECIAL.link,
};
