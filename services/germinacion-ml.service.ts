import api from './api';
import { logger } from '@/services/logger';

// ============================================================================
// INTERFACES PARA PREDICCIÓN ML (Random Forest)
// ============================================================================

/**
 * Request para predicción ML usando Random Forest
 * Todos los campos son requeridos
 */
export interface PrediccionGerminacionMLRequest {
  fecha_siembra: string;        // Formato: "YYYY-MM-DD"
  especie: string;              // Especie completa
  clima: string;                // CLIMA: I, IW, IC, W, C
  estado_capsula: string;       // E.CAPSU: Cerrada, Abierta, Semiabiert
  s_stock?: number;             // S.STOCK (opcional, default 0)
  c_solic?: number;             // C.SOLIC (opcional, default 0)
  dispone?: number;             // DISPONE (opcional, default 0)
}

/**
 * Response de predicción ML de germinación
 */
export interface PrediccionGerminacionMLResponse {
  dias_estimados: number;
  fecha_siembra: string;
  fecha_estimada_germinacion: string;
  confianza: number;                    // 0-100
  nivel_confianza: 'alta' | 'media' | 'baja';
  modelo: string;                       // "Random Forest"
  detalles: {
    especie_original: string;
    especie_agrupada: string;
    clima: string;
    estado_capsula: string;
    s_stock: number;
    c_solic: number;
    dispone: number;
    features_generadas: number;
    es_especie_nueva: boolean;
  };
  timestamp: string;
}

/**
 * Información del modelo ML de germinación
 */
export interface ModeloGerminacionMLInfo {
  loaded: boolean;
  model_type: string;                   // "RandomForestRegressor"
  n_features: number;                   // 129
  features: string[];
  top_especies: string[];               // Top 100 especies
  categorical_features: string[];
  preprocessing: {
    scaling: string;                    // "RobustScaler"
    feature_engineering: boolean;
    one_hot_encoding: boolean;
  };
  metrics: {
    rmse: number;
    r2_score: number;
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
  error_type?: string;
}

// ============================================================================
// SERVICIO DE PREDICCIÓN ML (Random Forest para Germinación)
// ============================================================================

class GerminacionMLService {

  /**
   * Realiza predicción usando el modelo Random Forest
   *
   * @param data Datos de entrada (7 campos: 4 requeridos + 3 opcionales)
   * @returns Predicción con días estimados y fecha de germinación
   * @throws Error con detalles específicos del backend
   *
   * @example
   * ```typescript
   * const prediccion = await germinacionMLService.predecir({
   *   fecha_siembra: "2024-11-30",
   *   especie: "Phragmipedium kovachii",
   *   clima: "IC",
   *   estado_capsula: "Cerrada",
   *   s_stock: 100,
   *   c_solic: 50,
   *   dispone: 50
   * });
   *
   * logger.info(`Días estimados: ${prediccion.dias_estimados}`);
   * logger.info(`Confianza: ${prediccion.confianza}%`);
   * ```
   */
  async predecir(data: PrediccionGerminacionMLRequest): Promise<PrediccionGerminacionMLResponse> {
    try {
      // Validar datos antes de enviar
      this.validarDatos(data);

      const response = await api.post<PrediccionGerminacionMLResponse>(
        'predicciones/germinacion/ml/',
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
      logger.error('❌ [ML Germinación] Error en predicción:', error);
      throw this.procesarError(error);
    }
  }

  /**
   * Obtiene información sobre el modelo cargado
   *
   * @returns Información del modelo Random Forest
   *
   * @example
   * ```typescript
   * const info = await germinacionMLService.obtenerInfoModelo();
   * logger.info(`Modelo: ${info.model_type}`);
   * logger.info(`Features: ${info.n_features}`);
   * logger.info(`Cargado: ${info.loaded}`);
   * ```
   */
  async obtenerInfoModelo(): Promise<ModeloGerminacionMLInfo> {
    try {
      const response = await api.get<ModeloGerminacionMLInfo>('ml/germinacion/model-info/');
      return response.data;

    } catch (error: any) {
      logger.error('❌ [ML Germinación] Error obteniendo info del modelo:', error);
      throw this.procesarError(error);
    }
  }

  /**
   * Valida los datos de entrada antes de enviar al backend
   *
   * @param data Datos a validar
   * @throws Error si los datos son inválidos
   */
  private validarDatos(data: PrediccionGerminacionMLRequest): void {
    const errores: string[] = [];

    // Validar campos requeridos
    if (!data.fecha_siembra) errores.push('fecha_siembra es requerida');
    if (!data.especie) errores.push('especie es requerida');
    if (!data.clima) errores.push('clima es requerido');
    if (!data.estado_capsula) errores.push('estado_capsula es requerido');

    // Validar formato de fecha
    if (data.fecha_siembra) {
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(data.fecha_siembra)) {
        errores.push('fecha_siembra debe tener formato YYYY-MM-DD');
      } else {
        // Comparar fechas como strings (más simple y sin problemas de timezone)
        const hoy = new Date();
        const hoyString = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

        // Permitir fecha de hoy y pasado, no futuro
        if (data.fecha_siembra > hoyString) {
          errores.push('fecha_siembra no puede ser futura');
        }
      }
    }

    // Validar clima
    const climasValidos = ['I', 'IW', 'IC', 'W', 'C', 'Cool', 'Warm', 'Intermedio'];
    if (data.clima && !climasValidos.includes(data.clima)) {
      errores.push(`clima debe ser uno de: ${climasValidos.join(', ')}`);
    }

    // Validar estado_capsula
    const estadosValidos = ['Cerrada', 'Abierta', 'Semiabiert', 'CERRADA', 'ABIERTA', 'SEMIABIERTA'];
    if (data.estado_capsula && !estadosValidos.includes(data.estado_capsula)) {
      errores.push(`estado_capsula debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    // Validar campos numéricos opcionales
    if (data.s_stock !== undefined && data.s_stock < 0) {
      errores.push('s_stock debe ser >= 0');
    }
    if (data.c_solic !== undefined && data.c_solic < 0) {
      errores.push('c_solic debe ser >= 0');
    }
    if (data.dispone !== undefined && data.dispone < 0) {
      errores.push('dispone debe ser >= 0');
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
      const errorObj = new Error('No tienes permisos para realizar predicciones de germinación');
      (errorObj as any).code = 'FORBIDDEN';
      return errorObj;
    }

    // Error interno del servidor (500)
    if (error.response?.status === 500) {
      const errorData: ErrorResponse = error.response.data;

      let mensaje = 'Error del servidor al procesar predicción';

      if (errorData.codigo === 'PIPELINE_ERROR') {
        mensaje = 'Error en el pipeline de predicción';
      } else if (errorData.codigo === 'FEATURE_ENGINEERING_ERROR') {
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
      const errorObj = new Error('Modelo de predicción de germinación no disponible temporalmente');
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
   * Genera explicación de la confianza para germinación
   */
  obtenerExplicacionConfianza(confianza: number, esEspecieNueva: boolean): string {
    const baseConfianza = 85;

    if (!esEspecieNueva) {
      return `Confianza de ${confianza}% (modelo Random Forest con ~85% R²)`;
    }

    const penalizacion = 10; // Penalización para especies nuevas (agrupadas como "OTRAS")

    return `Confianza de ${confianza}% (base: ${baseConfianza}%, penalización: -${penalizacion}% por especie nueva no vista en entrenamiento)`;
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

  /**
   * Normaliza estado de cápsula al formato esperado por el backend
   */
  normalizarEstadoCapsula(estado: string): string {
    const estadoUpper = estado.toUpperCase();

    if (estadoUpper === 'CERRADA') return 'Cerrada';
    if (estadoUpper === 'ABIERTA') return 'Abierta';
    if (estadoUpper === 'SEMIABIERTA' || estadoUpper === 'SEMIABIERT') return 'Semiabiert';

    // Si ya viene en formato correcto, retornar como está
    return estado;
  }

  /**
   * Normaliza clima al formato esperado por el backend
   */
  normalizarClima(clima: string): string {
    // El backend acepta tanto abreviaturas (I, IW, IC, W, C) como nombres completos
    const climaUpper = clima.toUpperCase();

    // Mapeo de nombres completos a abreviaturas si es necesario
    const mapeoClimas: {[key: string]: string} = {
      'INTERMEDIO': 'I',
      'INTERMEDIO CALIENTE': 'IW',
      'INTERMEDIO FRÍO': 'IC',
      'CALIENTE': 'W',
      'FRÍO': 'C',
      'COOL': 'Cool',
      'WARM': 'Warm'
    };

    return mapeoClimas[climaUpper] || clima;
  }
}

// Exportar instancia única del servicio
export const germinacionMLService = new GerminacionMLService();
