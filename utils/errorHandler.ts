import { Alert } from 'react-native';
import { Logger } from './logger';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: string;
  networkError?: boolean;
}

export class ErrorHandler {
  /**
   * Procesa errores de la API y los convierte en un formato consistente
   */
  static processApiError(error: unknown): ApiError {
    Logger.debug('Processing API error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: any; status?: number } };
      
      if (axiosError.response?.data) {
        return {
          message: axiosError.response.data.error || 'Error del servidor',
          status: axiosError.response.status || 500,
          code: axiosError.response.data.code || 'UNKNOWN_ERROR',
          details: axiosError.response.data.details || 'Sin detalles adicionales',
        };
      }
      
      if (axiosError.response?.status) {
        return {
          message: this.getStatusMessage(axiosError.response.status),
          status: axiosError.response.status,
        };
      }
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
      };
    }

    return {
      message: 'Error desconocido',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Muestra un error al usuario usando Alert
   */
  static showError(error: unknown, title: string = 'Error'): void {
    const processedError = this.processApiError(error);
    
    Alert.alert(
      title,
      processedError.message,
      [{ text: 'OK' }]
    );
  }

  /**
   * Registra un error para debugging
   */
  static logError(error: unknown, context: string = ''): void {
    const processedError = this.processApiError(error);
    
    Logger.error(`Error in ${context}:`, {
      message: processedError.message,
      status: processedError.status,
      code: processedError.code,
      details: processedError.details,
      originalError: error,
    });
  }

  /**
   * Maneja errores de manera consistente
   */
  static handleError(error: unknown, context?: string): void {
    this.logError(error, context);
    this.showError(error);
  }

  /**
   * Maneja errores asíncronos
   */
  static async handleAsyncError<T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }

  /**
   * Obtiene mensaje de error basado en el código de estado HTTP
   */
  private static getStatusMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Solicitud incorrecta. Verifica los datos enviados.';
      case 401:
        return 'No autorizado. Inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 409:
        return 'Conflicto con el estado actual del recurso.';
      case 422:
        return 'Datos de entrada inválidos.';
      case 429:
        return 'Demasiadas solicitudes. Intenta más tarde.';
      case 500:
        return 'Error interno del servidor. Inténtalo más tarde.';
      case 502:
        return 'Error del servidor. Inténtalo más tarde.';
      case 503:
        return 'Servicio no disponible. Inténtalo más tarde.';
      case 504:
        return 'Tiempo de espera agotado. Inténtalo más tarde.';
      default:
        return 'Error del servidor. Inténtalo más tarde.';
    }
  }

  /**
   * Verifica si un error es recuperable
   */
  static isRecoverableError(error: unknown): boolean {
    const processedError = this.processApiError(error);
    
    // Errores de red son generalmente recuperables
    if (processedError.networkError) {
      return true;
    }
    
    // Errores de timeout son recuperables
    if (processedError.code === 'ECONNABORTED') {
      return true;
    }
    
    // Errores 5xx son generalmente recuperables
    if (processedError.status && processedError.status >= 500) {
      return true;
    }
    
    // Errores 429 (rate limiting) son recuperables
    if (processedError.status === 429) {
      return true;
    }
    
    return false;
  }

  /**
   * Crea un error personalizado
   */
  static createError(
    message: string,
    code?: string,
    details?: string
  ): ApiError {
    return {
      message,
      code: code || 'CUSTOM_ERROR',
      details: details || 'Sin detalles adicionales',
    };
  }
}

/**
 * Hook para manejar errores en componentes React
 */
export const useErrorHandler = () => {
  return {
    handleError: ErrorHandler.handleError,
    showError: ErrorHandler.showError,
    logError: ErrorHandler.logError,
    isRecoverableError: ErrorHandler.isRecoverableError,
    createError: ErrorHandler.createError,
  };
};