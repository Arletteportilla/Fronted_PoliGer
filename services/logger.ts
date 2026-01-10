/**
 * Servicio de logging centralizado
 * En producción solo muestra errores, en desarrollo muestra todo
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Detectar si estamos en desarrollo usando __DEV__ de React Native
    this.isDevelopment = __DEV__;
  }

  /**
   * Log informativo (solo en desarrollo)
   */
  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Log de advertencia (solo en desarrollo)
   */
  warn(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  /**
   * Log de error (siempre se muestra)
   */
  error(message: string, ...args: any[]) {
    console.error(`❌ ${message}`, ...args);
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`🐛 ${message}`, ...args);
    }
  }

  /**
   * Log de éxito (solo en desarrollo)
   */
  success(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  /**
   * Log de inicio de operación (solo en desarrollo)
   */
  start(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`🔄 ${message}`, ...args);
    }
  }

  /**
   * Log de API request (solo en desarrollo)
   */
  api(method: string, url: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`📡 ${method.toUpperCase()} ${url}`, ...args);
    }
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Sobrescribir console.log global en producción
if (!__DEV__ && typeof window !== 'undefined') {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalDebug = console.debug;

  // Deshabilitar console.log en producción
  console.log = () => {};
  console.warn = () => {};
  console.debug = () => {};

  // Mantener console.error
  // console.error se mantiene sin cambios

  // Guardar los originales por si se necesitan
  (window as any).__originalConsole = {
    log: originalLog,
    warn: originalWarn,
    debug: originalDebug,
  };
}

export default logger;
