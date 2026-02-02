import api from './api';
import { logger } from '@/services/logger';

// ============================================================================
// INTERFACES PARA PREDICCIÓN ML (XGBoost)
// ============================================================================

/**
 * Request para predicción ML usando XGBoost
 * Todos los campos son requeridos
 */
export interface PrediccionMLRequest {
  fechapol: string;           // Formato: "YYYY-MM-DD"
  genero: string;             // Género de la planta
  especie: string;            // Especie de la planta
  ubicacion: string;          // Ubicación física
  responsable: string;        // Responsable del registro
  Tipo: string;               // Tipo de polinización (SELF, SIBLING, etc.)
  cantidad: number;           // Cantidad de cápsulas (0-1000)
  disponible: number;         // 0 o 1
}

/**
 * Response de predicción ML
 */
export interface PrediccionMLResponse {
  dias_estimados: number;
  fecha_polinizacion: string;
  fecha_estimada_maduracion: string;
  confianza: number;                    // 0-100
  nivel_confianza: 'alta' | 'media' | 'baja';
  metodo: string;                       // "XGBoost"
  modelo: string;                       // "polinizacion.joblib"
  input_data: {
    genero: string;
    especie: string;
    ubicacion: string;
    responsable: string;
    tipo: string;
    cantidad: number;
    disponible: number;
  };
  features_count: number;               // 16
  categorias_nuevas: number;            // 0-5
  timestamp: string;
}

/**
 * Información del modelo ML
 */
export interface ModeloMLInfo {
  loaded: boolean;
  model_type: string;                   // "XGBRegressor"
  n_features: number;                   // 16
  features: string[];
  categorical_columns: string[];
  encoders: string[];
  preprocessing: {
    scaling: boolean;
    target_encoding: boolean;
    frequency_encoding: boolean;
    label_encoding: boolean;
  };
  input_required: string[];
}

/**
 * Error response del API
 */
export interface ErrorResponse {
  error: string;
  details?: any;
  codigo?: string;
  tipo?: string;
  claves_disponibles?: string[];
  usuario?: string;
}

// ============================================================================
// SERVICIO DE PREDICCIÓN ML (XGBoost)
// ============================================================================

class PolinizacionMLService {

  /**
   * Realiza predicción usando el modelo XGBoost
   *
   * @param data Datos de entrada (8 campos requeridos)
   * @returns Predicción con días estimados y fecha de maduración
   * @throws Error con detalles específicos del backend
   *
   * @example
   * ```typescript
   * const prediccion = await polinizacionMLService.predecir({
   *   fechapol: "2024-11-30",
   *   genero: "Cattleya",
   *   especie: "Cattleya maxima",
   *   ubicacion: "Vivero 1",
   *   responsable: "Juan Pérez",
   *   Tipo: "SELF",
   *   cantidad: 3,
   *   disponible: 1
   * });
   *
   * logger.info(`Días estimados: ${prediccion.dias_estimados}`);
   * logger.info(`Confianza: ${prediccion.confianza}%`);
   * ```
   */
  async predecir(data: PrediccionMLRequest): Promise<PrediccionMLResponse> {
    try {
      // Validar datos antes de enviar
      this.validarDatos(data);

      const response = await api.post<PrediccionMLResponse>(
        'predicciones/polinizacion/ml/',
        data,
        {
          timeout: 30000, // 30 segundos
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error: any) {
      logger.error('❌ [ML] Error en predicción:', error);
      throw this.procesarError(error);
    }
  }

  /**
   * Obtiene información sobre el modelo cargado
   *
   * @returns Información del modelo XGBoost
   *
   * @example
   * ```typescript
   * const info = await polinizacionMLService.obtenerInfoModelo();
   * logger.info(`Modelo: ${info.model_type}`);
   * logger.info(`Features: ${info.n_features}`);
   * logger.info(`Cargado: ${info.loaded}`);
   * ```
   */
  async obtenerInfoModelo(): Promise<ModeloMLInfo> {
    try {
      const response = await api.get<ModeloMLInfo>('ml/model-info/');
      return response.data;

    } catch (error: any) {
      logger.error('❌ [ML] Error obteniendo info del modelo:', error);
      throw this.procesarError(error);
    }
  }

  /**
   * Valida los datos de entrada antes de enviar al backend
   *
   * @param data Datos a validar
   * @throws Error si los datos son inválidos
   */
  private validarDatos(data: PrediccionMLRequest): void {
    const errores: string[] = [];

    // Validar campos requeridos
    if (!data.fechapol) errores.push('fechapol es requerido');
    if (!data.genero) errores.push('genero es requerido');
    if (!data.especie) errores.push('especie es requerido');
    if (!data.ubicacion) errores.push('ubicacion es requerido');
    if (!data.responsable) errores.push('responsable es requerido');
    if (!data.Tipo) errores.push('Tipo es requerido');
    if (data.cantidad === undefined || data.cantidad === null) {
      errores.push('cantidad es requerido');
    }
    if (data.disponible === undefined || data.disponible === null) {
      errores.push('disponible es requerido');
    }

    // Validar formato de fecha
    if (data.fechapol) {
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(data.fechapol)) {
        errores.push('fechapol debe tener formato YYYY-MM-DD');
      } else {
        // Validar que no sea una fecha muy futura (permitir hasta mañana para cubrir diferencias de timezone)
        const fechaPol = new Date(data.fechapol + 'T00:00:00');
        const hoy = new Date();
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        mañana.setHours(23, 59, 59, 999);

        if (fechaPol > mañana) {
          errores.push('fechapol no puede ser más de 1 día en el futuro');
        }
      }
    }

    // Validar cantidad
    if (data.cantidad !== undefined && data.cantidad !== null) {
      if (data.cantidad < 0) {
        errores.push('cantidad debe ser >= 0');
      }
      if (data.cantidad > 1000) {
        errores.push('cantidad debe ser <= 1000');
      }
    }

    // Validar disponible
    if (data.disponible !== undefined && data.disponible !== null) {
      if (data.disponible !== 0 && data.disponible !== 1) {
        errores.push('disponible debe ser 0 o 1');
      }
    }

    if (errores.length > 0) {
      throw new Error(`Errores de validación:\n- ${errores.join('\n- ')}`);
    }
  }

  /**
   * Procesa errores del backend y los convierte en errores amigables
   *
   * @param error Error original
   * @returns Error procesado con mensaje amigable
   */
  private procesarError(error: any): Error {
    // Error de validación del backend (400)
    if (error.response?.status === 400) {
      const errorData: ErrorResponse = error.response.data;

      if (errorData.details) {
        const detalles = Object.entries(errorData.details)
          .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
          .join('\n');

        const errorObj = new Error(`Datos inválidos:\n${detalles}`);
        (errorObj as any).code = 'INVALID_INPUT';
        (errorObj as any).details = errorData.details;
        return errorObj;
      }

      return new Error(errorData.error || 'Datos de entrada inválidos');
    }

    // Error de autenticación (401)
    if (error.response?.status === 401) {
      const errorObj = new Error('No autenticado. Por favor inicia sesión.');
      (errorObj as any).code = 'UNAUTHORIZED';
      return errorObj;
    }

    // Error de permisos (403)
    if (error.response?.status === 403) {
      const errorObj = new Error('No tienes permisos para realizar predicciones');
      (errorObj as any).code = 'FORBIDDEN';
      return errorObj;
    }

    // Error interno del servidor (500)
    if (error.response?.status === 500) {
      const errorData: ErrorResponse = error.response.data;

      let mensaje = 'Error del servidor al procesar predicción';

      if (errorData.codigo === 'FEATURE_ENGINEERING_ERROR') {
        mensaje = 'Error procesando las características del modelo';
      } else if (errorData.codigo === 'ALIGNMENT_ERROR') {
        mensaje = 'Error interno: Datos del modelo desalineados';
      } else if (errorData.codigo === 'PREDICTOR_ERROR') {
        mensaje = 'Error en el predictor de machine learning';
      }

      const errorObj = new Error(mensaje);
      (errorObj as any).code = errorData.codigo || 'SERVER_ERROR';
      (errorObj as any).details = errorData.details;
      return errorObj;
    }

    // Modelo no disponible (503)
    if (error.response?.status === 503) {
      const errorObj = new Error('Modelo de predicción no disponible temporalmente');
      (errorObj as any).code = 'MODEL_NOT_LOADED';
      return errorObj;
    }

    // Error de timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const errorObj = new Error('La predicción tardó demasiado. Intenta de nuevo.');
      (errorObj as any).code = 'TIMEOUT';
      return errorObj;
    }

    // Error de red
    if (error.message?.includes('Network Error') || !error.response) {
      const errorObj = new Error('Error de conexión. Verifica tu internet.');
      (errorObj as any).code = 'NETWORK_ERROR';
      return errorObj;
    }

    // Error genérico
    return new Error(error.response?.data?.error || error.message || 'Error desconocido');
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Determina el color para mostrar según nivel de confianza
   */
  obtenerColorConfianza(nivelConfianza: 'alta' | 'media' | 'baja'): string {
    switch (nivelConfianza) {
      case 'alta':
        return '#4CAF50'; // Verde
      case 'media':
        return '#FFC107'; // Amarillo
      case 'baja':
        return '#FF9800'; // Naranja
      default:
        return '#9E9E9E'; // Gris
    }
  }

  /**
   * Determina el color según valor numérico de confianza
   */
  obtenerColorConfianzaNumerico(confianza: number): string {
    if (confianza >= 85) return '#4CAF50'; // Verde - Alta
    if (confianza >= 70) return '#FFC107'; // Amarillo - Media
    return '#FF9800'; // Naranja - Baja
  }

  /**
   * Formatea fecha ISO a formato legible
   */
  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  }

  /**
   * Calcula días restantes hasta una fecha
   */
  calcularDiasRestantes(fechaObjetivo: string): number {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const objetivo = new Date(fechaObjetivo);
      objetivo.setHours(0, 0, 0, 0);

      const diferencia = objetivo.getTime() - hoy.getTime();
      return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Genera mensaje de advertencia según categorías nuevas
   */
  obtenerMensajeCategorias(categoriasNuevas: number): string {
    if (categoriasNuevas === 0) {
      return '';
    }

    if (categoriasNuevas === 1) {
      return 'Una categoría no fue vista durante el entrenamiento del modelo';
    }

    return `${categoriasNuevas} categorías no fueron vistas durante el entrenamiento del modelo`;
  }

  /**
   * Genera explicación de la confianza
   */
  obtenerExplicacionConfianza(confianza: number, categoriasNuevas: number): string {
    const baseConfianza = 85;

    // FIX: Validar que categoriasNuevas no sea undefined o NaN
    const categoriasValidadas = (categoriasNuevas === undefined || categoriasNuevas === null || isNaN(categoriasNuevas))
      ? 0
      : categoriasNuevas;

    const penalizacion = categoriasValidadas * 5;

    if (categoriasValidadas === 0) {
      return `Confianza de ${confianza}% (modelo XGBoost con 95.63% R²)`;
    }

    return `Confianza de ${confianza}% (base: ${baseConfianza}%, penalización: -${penalizacion}% por ${categoriasValidadas} ${categoriasValidadas === 1 ? 'categoría nueva' : 'categorías nuevas'})`;
  }

  /**
   * Convierte fecha a formato YYYY-MM-DD para el API
   */
  formatearFechaParaAPI(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// Exportar instancia única del servicio
export const polinizacionMLService = new PolinizacionMLService();
