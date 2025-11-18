import { LogBox } from 'react-native';
import { CONFIG } from '@/services/config';

/**
 * Configuración para suprimir warnings específicos en desarrollo
 * Estos warnings son conocidos y no afectan la funcionalidad
 */
export const configureWarnings = () => {
  if (__DEV__) {
    // Suprimir warnings de estilos deprecated que ya están siendo manejados
    LogBox.ignoreLogs([
      '"shadow*" style props are deprecated. Use "boxShadow".',
      '"textShadow*" style props are deprecated. Use "textShadow".',
      'props.pointerEvents is deprecated. Use style.pointerEvents',
      'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
      'Warning: ReactDOM.render is no longer supported in React 18.',
      'Warning: componentWillReceiveProps has been renamed',
      'Warning: componentWillUpdate has been renamed',
    ]);
  }
};

/**
 * Configuración para el manejo de errores globales
 */
export const configureErrorHandling = () => {
  if (__DEV__) {
    // Capturar errores no manejados
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Filtrar errores específicos que no son críticos
      const message = args.join(' ');
      if (message.includes('Warning: ReactDOM.render is no longer supported') ||
          message.includes('Warning: componentWillReceiveProps') ||
          message.includes('Warning: componentWillUpdate')) {
        return; // Ignorar estos warnings específicos
      }
      originalConsoleError(...args);
    };
  }
};

/**
 * Configuración para el manejo de promesas no manejadas
 */
export const configureUnhandledRejection = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      if (CONFIG.DEBUG_MODE) {
        console.warn('Promesa no manejada detectada:', event.reason);
      }
      event.preventDefault(); // Prevenir el error por defecto
    });
  }
};

/**
 * Configuración completa para el manejo de errores y warnings
 */
export const configureGlobalErrorHandling = () => {
  configureWarnings();
  configureErrorHandling();
  configureUnhandledRejection();
};
