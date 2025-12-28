/**
 * Sistema de colores centralizado para PoliGer
 * Define todos los colores utilizados en la aplicación con soporte para tema claro y oscuro
 */

// Colores primarios del sistema (no cambian con el tema)
export const PRIMARY = {
  main: '#e9ad14',       // Amarillo/dorado principal
  dark: '#c89512',       // Variante oscura
  light: '#f9c54d',      // Variante clara
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
  primary: '#182d49',    // Azul oscuro principal
  secondary: '#3B82F6',  // Azul estándar
  tertiary: '#60A5FA',   // Azul claro
};

// Colores de estado (success, warning, error, info)
export const STATUS = {
  success: '#e9ad14',    // Amarillo/dorado para éxito
  successLight: '#fef3c7',
  warning: '#F59E0B',    // Amarillo/naranja advertencia
  warningLight: '#FEF3C7',
  error: '#EF4444',      // Rojo error
  errorLight: '#FEE2E2',
  info: '#182d49',       // Azul oscuro para info
  infoLight: '#e0e7ff',
};

// Colores de botones y elementos interactivos - Tema Claro
const INTERACTIVE_LIGHT = {
  hover: '#f0f0f0',      // Hover general
  pressed: '#e0e0e0',    // Pressed general
  disabled: '#e5e7eb',   // Deshabilitado
  focus: '#3B82F6',      // Focus
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

// Colores de estados de cápsula
export const CAPSULA_STATES = {
  CERRADA: '#6B7280',
  ABIERTA: '#10B981',
  SEMIABIERTA: '#F59E0B',
};

// Colores de climas
export const CLIMA = {
  I: '#3B82F6',    // Intermedio - Azul
  IW: '#8B5CF6',   // Intermedio-Cálido - Púrpura
  IC: '#06B6D4',   // Intermedio-Frío - Cyan
  W: '#EF4444',    // Cálido - Rojo
  C: '#0EA5E9',    // Frío - Azul claro
};

// Colores para gráficos y visualizaciones
export const CHART = {
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
  link: '#3B82F6',       // Enlaces
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
