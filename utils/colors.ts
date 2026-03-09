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
  primary: '#1e293b',    // Fondo principal (slate-800)
  secondary: '#0f172a',  // Fondo secundario (slate-900)
  tertiary: '#334155',   // Fondo terciario (slate-700)
  modal: 'rgba(0, 0, 0, 0.7)', // Overlay de modales
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
  primary: '#f1f5f9',    // Texto principal (slate-100)
  secondary: '#cbd5e1',  // Texto secundario (slate-300)
  tertiary: '#94a3b8',   // Texto terciario (slate-400)
  disabled: '#64748b',   // Texto deshabilitado (slate-500)
  inverse: '#121212',    // Texto inverso (sobre fondos claros)
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
  hover: '#f0f0f0',      // Hover general
  pressed: '#e0e0e0',    // Pressed general
  disabled: '#e5e7eb',   // Deshabilitado
  focus: '#182d49',      // Focus
};

// Colores de botones y elementos interactivos - Tema Oscuro
const INTERACTIVE_DARK = {
  hover: '#334155',      // Hover general
  pressed: '#475569',    // Pressed general
  disabled: '#475569',   // Deshabilitado
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
const BORDER_DARK = {
  light: '#475569',      // Borde claro
  default: '#334155',    // Borde por defecto
  medium: '#475569',     // Borde medio
  dark: '#64748b',       // Borde oscuro
};

// Colores de sombras
export const SHADOW = {
  color: '#000000',
  light: 'rgba(0, 0, 0, 0.05)',
  medium: 'rgba(0, 0, 0, 0.1)',
  dark: 'rgba(0, 0, 0, 0.25)',
};

// Colores específicos de módulos
export const MODULE = {
  // Germinaciones
  germinacion: {
    primary: '#e9ad14',    // Amarillo/dorado
    light: '#fef3c7',
    icon: '#d97706',
  },
  // Polinizaciones
  polinizacion: {
    primary: '#182d49',    // Azul oscuro
    light: '#e0e7ff',
    icon: '#1e40af',
  },
  // Reportes
  reporte: {
    primary: '#182d49',    // Azul oscuro
    light: '#e0e7ff',
    icon: '#1e40af',
  },
  // Notificaciones
  notificacion: {
    primary: '#e9ad14',    // Amarillo/dorado
    light: '#fef3c7',
    icon: '#d97706',
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

// Colores de la barra de progreso de estados
export const PROGRESS_STATES = {
  inicial:           { color: '#182d49', light: '#e8edf3' },
  enProcesoTemprano: { color: '#F59E0B', light: '#FEF3C7' },
  enProcesoAvanzado: { color: '#f97316', light: '#ffedd5' },
  finalizado:        { color: '#10B981', light: '#d1fae5' },
};

// Colores de estados de cápsula
export const CAPSULA_STATES = {
  CERRADA: '#6B7280',
  ABIERTA: '#28e86e',
  SEMIABIERTA: '#F59E0B',
};

// Colores de climas
export const CLIMA = {
  I: '#182d49',    // Intermedio - Azul
  IW: '#8B5CF6',   // Intermedio-Cálido - Púrpura
  IC: '#06B6D4',   // Intermedio-Frío - Cyan
  W: '#EF4444',    // Cálido - Rojo
  C: '#0EA5E9',    // Frío - Azul claro
};

// Colores para gráficos y visualizaciones
export const CHART = {
  polinizaciones: STATUS.warning,    // Naranja/ámbar para polinizaciones
  germinaciones: PRIMARY.main,       // Azul navy oscuro para germinaciones
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

// Colores especiales
export const SPECIAL = {
  star: '#fbbf24',       // Estrella/favorito
  link: '#182d49',       // Enlaces
  highlight: '#FEF3C7',  // Resaltado
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay general
};

// Función para obtener colores según el tema
export function getColors(theme: 'light' | 'dark' = 'light') {
  return {
    primary: PRIMARY,
    background: theme === 'dark' ? BACKGROUND_DARK : BACKGROUND_LIGHT,
    text: theme === 'dark' ? TEXT_DARK : TEXT_LIGHT,
    accent: ACCENT,
    status: STATUS,
    interactive: theme === 'dark' ? INTERACTIVE_DARK : INTERACTIVE_LIGHT,
    border: theme === 'dark' ? BORDER_DARK : BORDER_LIGHT,
    shadow: SHADOW,
    module: MODULE,
    confirmationVariants: CONFIRMATION_VARIANTS,
    progressStates: PROGRESS_STATES,
    capsulaStates: CAPSULA_STATES,
    clima: CLIMA,
    chart: CHART,
    special: SPECIAL,
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
