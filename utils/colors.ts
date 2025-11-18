/**
 * Sistema de colores centralizado para PoliGer
 * Define todos los colores utilizados en la aplicación
 */

// Colores primarios del sistema
export const PRIMARY = {
  main: '#e9ad14',       // Amarillo/dorado principal
  dark: '#c89512',       // Variante oscura
  light: '#f9c54d',      // Variante clara
  contrast: '#ffffff',   // Color de contraste (texto sobre primario)
};

// Colores de fondo y superficie
export const BACKGROUND = {
  primary: '#ffffff',    // Fondo principal
  secondary: '#f8fafc',  // Fondo secundario
  tertiary: '#f3f4f6',   // Fondo terciario
  modal: 'rgba(0, 0, 0, 0.5)', // Overlay de modales
};

// Colores de texto
export const TEXT = {
  primary: '#121212',    // Texto principal
  secondary: '#374151',  // Texto secundario
  tertiary: '#6b7280',   // Texto terciario
  disabled: '#9ca3af',   // Texto deshabilitado
  inverse: '#ffffff',    // Texto inverso (sobre fondos oscuros)
};

// Colores de acento y estado
export const ACCENT = {
  primary: '#182d49',    // Azul oscuro principal
  secondary: '#3B82F6',  // Azul estándar
  tertiary: '#60A5FA',   // Azul claro
};

// Colores de estado (success, warning, error, info)
export const STATUS = {
  success: '#10B981',    // Verde éxito
  successLight: '#D1FAE5',
  warning: '#F59E0B',    // Amarillo/naranja advertencia
  warningLight: '#FEF3C7',
  error: '#EF4444',      // Rojo error
  errorLight: '#FEE2E2',
  info: '#3B82F6',       // Azul info
  infoLight: '#DBEAFE',
};

// Colores de botones y elementos interactivos
export const INTERACTIVE = {
  hover: '#f0f0f0',      // Hover general
  pressed: '#e0e0e0',    // Pressed general
  disabled: '#e5e7eb',   // Deshabilitado
  focus: '#3B82F6',      // Focus
};

// Colores de bordes
export const BORDER = {
  light: '#f0f0f0',      // Borde claro
  default: '#e5e7eb',    // Borde por defecto
  medium: '#d1d5db',     // Borde medio
  dark: '#9ca3af',       // Borde oscuro
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
    primary: '#10B981',    // Verde
    light: '#D1FAE5',
    icon: '#059669',
  },
  // Polinizaciones
  polinizacion: {
    primary: '#F59E0B',    // Naranja
    light: '#FEF3C7',
    icon: '#D97706',
  },
  // Reportes
  reporte: {
    primary: '#3B82F6',    // Azul
    light: '#DBEAFE',
    icon: '#2563EB',
  },
  // Notificaciones
  notificacion: {
    primary: '#8B5CF6',    // Púrpura
    light: '#EDE9FE',
    icon: '#7C3AED',
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
    '#3B82F6',  // Azul
    '#10B981',  // Verde
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

// Exportar objeto completo de colores para fácil acceso
export const colors = {
  primary: PRIMARY,
  background: BACKGROUND,
  text: TEXT,
  accent: ACCENT,
  status: STATUS,
  interactive: INTERACTIVE,
  border: BORDER,
  shadow: SHADOW,
  module: MODULE,
  capsulaStates: CAPSULA_STATES,
  clima: CLIMA,
  chart: CHART,
  special: SPECIAL,
};

// Colores planos para uso directo (mantener compatibilidad con código existente)
export default {
  // Primarios
  primary: PRIMARY.main,
  primaryDark: PRIMARY.dark,
  primaryLight: PRIMARY.light,

  // Fondos
  background: BACKGROUND.primary,
  backgroundSecondary: BACKGROUND.secondary,
  backgroundTertiary: BACKGROUND.tertiary,

  // Textos
  text: TEXT.primary,
  textSecondary: TEXT.secondary,
  textTertiary: TEXT.tertiary,
  textDisabled: TEXT.disabled,

  // Acentos
  accent: ACCENT.primary,
  accentSecondary: ACCENT.secondary,

  // Estados
  success: STATUS.success,
  warning: STATUS.warning,
  error: STATUS.error,
  info: STATUS.info,

  // Bordes
  border: BORDER.default,
  borderLight: BORDER.light,
  borderDark: BORDER.dark,

  // Especiales
  star: SPECIAL.star,
  link: SPECIAL.link,
};
