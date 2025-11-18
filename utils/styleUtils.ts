import { Platform } from 'react-native';

/**
 * Utilidad para manejar estilos compatibles entre web y móvil
 * Elimina los warnings de estilos deprecated
 */
export const createCompatibleStyle = (mobileStyle: any, webStyle?: any) => {
  return Platform.select({
    web: webStyle || mobileStyle,
    default: mobileStyle,
  });
};

/**
 * Utilidad para crear sombras compatibles
 */
export const createShadow = (color: string, offset: { width: number; height: number }, opacity: number, radius: number) => {
  return Platform.select({
    web: {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    },
    default: {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation: radius,
    },
  });
};

/**
 * Utilidad para crear sombras de texto compatibles
 */
export const createTextShadow = (color: string, offset: { width: number; height: number }, radius: number) => {
  return Platform.select({
    web: {
      textShadow: `${offset.width}px ${offset.height}px ${radius}px ${color}`,
    },
    default: {
      textShadowColor: color,
      textShadowOffset: offset,
      textShadowRadius: radius,
    },
  });
};

/**
 * Utilidad para manejar pointerEvents de forma compatible
 */
export const createPointerEvents = (value: 'auto' | 'none' | 'box-none' | 'box-only') => {
  return Platform.select({
    web: {
      style: { pointerEvents: value },
    },
    default: {
      pointerEvents: value,
    },
  });
};

/**
 * Utilidad para manejar resizeMode de forma compatible
 */
export const createResizeMode = (mode: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center') => {
  return Platform.select({
    web: {
      style: { resizeMode: mode },
    },
    default: {
      resizeMode: mode,
    },
  });
};

/**
 * Utilidad para crear estilos de botón compatibles
 */
export const createButtonStyle = (backgroundColor: string, shadowColor: string) => {
  return {
    backgroundColor,
    ...createShadow(shadowColor, { width: 0, height: 4 }, 0.3, 8),
  };
};

/**
 * Utilidad para crear estilos de tarjeta compatibles
 */
export const createCardStyle = (backgroundColor: string, shadowColor: string) => {
  return {
    backgroundColor,
    ...createShadow(shadowColor, { width: 0, height: 4 }, 0.1, 12),
  };
};

/**
 * Utilidad para limpiar estilos deprecated de un objeto de estilos
 */
export const cleanDeprecatedStyles = (style: any) => {
  const cleaned = { ...style };
  
  // Remover propiedades deprecated
  delete cleaned.shadowColor;
  delete cleaned.shadowOffset;
  delete cleaned.shadowOpacity;
  delete cleaned.shadowRadius;
  delete cleaned.textShadowColor;
  delete cleaned.textShadowOffset;
  delete cleaned.textShadowRadius;
  delete cleaned.pointerEvents;
  delete cleaned.resizeMode;
  
  return cleaned;
};

/**
 * Utilidad para aplicar estilos compatibles con web
 */
export const applyWebCompatibleStyles = (baseStyle: any, webOverrides: any = {}) => {
  return Platform.select({
    web: {
      ...cleanDeprecatedStyles(baseStyle),
      ...webOverrides,
    },
    default: baseStyle,
  });
};
