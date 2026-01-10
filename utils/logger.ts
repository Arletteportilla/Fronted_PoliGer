import { CONFIG } from '@/services/config';
import { logger } from '@/services/logger';

/**
 * Logger utility para manejar logs de manera consistente
 * En producción, solo muestra errores críticos
 */
export class Logger {
  static log(message: string, ...args: unknown[]) {
    if (CONFIG.DEBUG_MODE) {
      logger.info(message, ...args);
    }
  }

  static warn(message: string, ...args: unknown[]) {
    if (CONFIG.DEBUG_MODE) {
      logger.warn(message, ...args);
    }
  }

  static error(message: string, ...args: unknown[]) {
    // Los errores siempre se muestran, incluso en producción
    console.error(message, ...args);
  }

  static debug(message: string, ...args: unknown[]) {
    if (CONFIG.DEBUG_MODE) {
      logger.debug(` DEBUG: ${message}`, ...args);
    }
  }

  static info(message: string, ...args: unknown[]) {
    if (CONFIG.DEBUG_MODE) {
      logger.info(` INFO: ${message}`, ...args);
    }
  }

  static success(message: string, ...args: unknown[]) {
    if (CONFIG.DEBUG_MODE) {
      logger.success(` SUCCESS: ${message}`, ...args);
    }
  }

  static warning(message: string, ...args: unknown[]) {
    if (CONFIG.DEBUG_MODE) {
      logger.warn(`⚠️ WARNING: ${message}`, ...args);
    }
  }
}

/**
 * Función helper para crear un logger específico para un contexto
 */
export const createLogger = (context: string) => ({
  log: (message: string, ...args: unknown[]) => Logger.log(`[${context}] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => Logger.warn(`[${context}] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => Logger.error(`[${context}] ${message}`, ...args),
  debug: (message: string, ...args: unknown[]) => Logger.debug(`[${context}] ${message}`, ...args),
  info: (message: string, ...args: unknown[]) => Logger.info(`[${context}] ${message}`, ...args),
  success: (message: string, ...args: unknown[]) => Logger.success(`[${context}] ${message}`, ...args),
  warning: (message: string, ...args: unknown[]) => Logger.warning(`[${context}] ${message}`, ...args),
});

/**
 * Función para limpiar logs en producción
 */
export const cleanLogs = () => {
  if (!CONFIG.DEBUG_MODE) {
    // En producción, reemplazar console.log con función vacía
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
};
