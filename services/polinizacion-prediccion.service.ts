import api from './api';
import { logger } from '@/services/logger';

// ============================================================================
// INTERFACES PARA PREDICCIONES DE POLINIZACIÓN CON MODELO .BIN
// ============================================================================

export interface CondicionesClimaticas {
  temperatura?: {
    promedio?: number;
    minima?: number;
    maxima?: number;
  };
  humedad?: number;
  precipitacion?: number;
  estacion?: 'primavera' | 'verano' | 'otoño' | 'invierno';
  viento_promedio?: number;
  horas_luz?: number;
}

export interface PrediccionPolinizacionRequest {
  especie: string;
  genero?: string;
  clima?: string;
  ubicacion?: string;
  fecha_polinizacion?: string;
  tipo_polinizacion?: string;
  condiciones_climaticas?: CondicionesClimaticas;
  fecha_maduracion?: string;
}

export interface PrediccionPolinizacionResponse {
  dias_estimados: number;
  fecha_estimada_semillas?: string;
  confianza: number;
  tipo_prediccion: 'inicial' | 'refinada' | 'basica_con_fecha' | 'validada';
  especie_info: {
    especie: string;
    tipo: string;
    clima_usado?: string;
    ubicacion_usada?: string;
    metodo: string;
    factores_considerados: string[];
    factores_faltantes?: string[];
    refinamientos_aplicados?: {
      fecha_polinizacion: boolean;
      condiciones_climaticas: boolean;
      tipo_polinizacion: boolean;
    };
    mejora_confianza?: number;
  };
  parametros_usados: PrediccionPolinizacionRequest;
  datos_del_modelo?: {
    dias_base_especie: number;
    factor_clima_especie: number;
    ajuste_clima_aplicado: number;
  };
  comparacion_con_inicial?: {
    dias_iniciales: number;
    dias_refinados: number;
    diferencia_dias: number;
    confianza_inicial: number;
    confianza_refinada: number;
  };
  siguiente_paso?: string;
}

export interface ValidacionPrediccionResponse {
  fecha_estimada: string;
  fecha_real: string;
  fecha_polinizacion: string;
  dias_estimados: number;
  dias_reales: number;
  diferencia_dias: number;
  precision: number;
  desviacion_porcentual: number;
  calidad_prediccion: string;
  tendencia: string;
  factor_correccion: number;
  prediccion_original: PrediccionPolinizacionResponse;
  metricas_detalladas: {
    error_absoluto: number;
    error_relativo: number;
    precision_temporal: number;
    factor_ajuste_sugerido: number;
  };
  recomendaciones_mejora: string[];
  datos_para_entrenamiento: {
    especie: string;
    clima?: string;
    ubicacion?: string;
    tipo_polinizacion?: string;
    dias_reales_observados: number;
    condiciones_climaticas?: CondicionesClimaticas;
  };
}

export interface HistorialPrediccionItem {
  id: number;
  codigo: string;
  especie: string;
  fecha_polinizacion?: string;
  fecha_estimada_semillas?: string;
  dias_estimados: number;
  confianza: number;
  tipo_prediccion: string;
  tipo_prediccion_display: string;
  estado: string;
  precision?: number;
  calidad_prediccion?: string;
  dias_restantes?: number;
  fecha_creacion: string;
}

export interface HistorialPrediccionesResponse {
  predicciones: HistorialPrediccionItem[];
  estadisticas: {
    total_predicciones: number;
    predicciones_validadas: number;
    precision_promedio: number;
    especies_mas_predichas: string[];
    confianza_promedio: number;
  };
  filtros_aplicados: {
    especie?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    limit: number;
  };
}

export interface EstadisticasPredicciones {
  total_predicciones: number;
  predicciones_validadas: number;
  precision_promedio: number;
  confianza_promedio: number;
  especies_mas_predichas: {
    especie: string;
    cantidad: number;
    precision_promedio?: number;
  }[];
  distribucion_por_tipo: {
    inicial: number;
    refinada: number;
    basica_con_fecha: number;
    validada: number;
  };
  distribucion_por_calidad: {
    excelente: number;
    buena: number;
    aceptable: number;
    regular: number;
    pobre: number;
  };
  tendencia_mensual: {
    mes: string;
    predicciones: number;
    precision_promedio?: number;
  }[];
  modelo_version: string;
  modelo_precision: number;
  ultima_actualizacion: string;
}

// ============================================================================
// SERVICIO DE PREDICCIONES DE POLINIZACIÓN
// ============================================================================

class PolinizacionPrediccionService {
  
  /**
   * Genera una predicción inicial de polinización usando solo el modelo .bin
   * Requiere únicamente la especie, clima, ubicación y fecha_polinizacion son opcionales
   */
  async generarPrediccionInicial(data: {
    especie: string;
    clima?: string;
    ubicacion?: string;
    fecha_polinizacion?: string;
  }): Promise<PrediccionPolinizacionResponse> {
    try {
      logger.info('🌸 Generando predicción inicial de polinización:', data);

      // Usar el endpoint existente: predicciones/polinizacion/
      const response = await api.post('predicciones/polinizacion/', data, {
        timeout: 30000, // 30 segundos
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.success(' Predicción generada exitosamente:', response.data);

      // El endpoint existente devuelve la predicción directamente
      // Adaptamos la respuesta al formato esperado
      const especieInfoStr = typeof response.data.especie_info === 'string'
        ? response.data.especie_info
        : data.especie;

      const factoresConsiderados: string[] = ['especie'];
      if (data.clima) factoresConsiderados.push('clima');
      if (data.ubicacion) factoresConsiderados.push('ubicacion');

      return {
        dias_estimados: response.data.dias_estimados || 0,
        fecha_estimada_semillas: response.data.fecha_estimada_semillas,
        confianza: response.data.confianza || 50,
        tipo_prediccion: response.data.tipo_prediccion || 'inicial',
        especie_info: {
          especie: especieInfoStr,
          tipo: response.data.tipo_prediccion || 'inicial',
          ...(data.clima && { clima_usado: data.clima }),
          ...(data.ubicacion && { ubicacion_usada: data.ubicacion }),
          metodo: 'prediccion heuristica',
          factores_considerados: factoresConsiderados
        },
        parametros_usados: response.data.parametros_usados || data
      };
    } catch (error: any) {
      console.error('❌ Error en predicción inicial de polinización:', error);

      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorWithDetails = new Error(errorData.error || 'Error en la predicción inicial');
        (errorWithDetails as any).errorCode = errorData.error_code;
        (errorWithDetails as any).sugerencias = errorData.sugerencias;
        (errorWithDetails as any).response = error.response;
        throw errorWithDetails;
      }

      // Manejar errores de timeout
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const timeoutError = new Error('La predicción tardó demasiado tiempo en procesarse');
        (timeoutError as any).code = 'ECONNABORTED';
        throw timeoutError;
      }

      // Manejar errores de red
      if (error.message?.includes('Network Error') || !error.response) {
        const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
        (networkError as any).code = 'NETWORK_ERROR';
        throw networkError;
      }

      throw new Error('Error inesperado al generar predicción inicial');
    }
  }

  /**
   * Refina una predicción existente con datos adicionales del usuario
   * Permite agregar fecha de polinización, condiciones climáticas y tipo de polinización
   */
  async refinarPrediccion(data: PrediccionPolinizacionRequest): Promise<PrediccionPolinizacionResponse> {
    try {
      logger.info('🌸 Refinando predicción de polinización:', data);
      
      // Configurar timeout específico para refinamiento (25 segundos)
      const response = await api.post('predicciones/polinizacion/refinar/', data, {
        timeout: 25000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        logger.success(' Predicción refinada exitosamente');
        return response.data.prediccion;
      } else {
        throw new Error(response.data.error || 'Error desconocido en refinamiento');
      }
    } catch (error: any) {
      console.error('❌ Error refinando predicción de polinización:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorWithDetails = new Error(errorData.error || 'Error refinando la predicción');
        (errorWithDetails as any).errorCode = errorData.error_code;
        (errorWithDetails as any).sugerencias = errorData.sugerencias;
        (errorWithDetails as any).response = error.response;
        throw errorWithDetails;
      }
      
      // Manejar errores de timeout
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const timeoutError = new Error('El refinamiento tardó demasiado tiempo en procesarse');
        (timeoutError as any).code = 'ECONNABORTED';
        throw timeoutError;
      }
      
      // Manejar errores de red
      if (error.message?.includes('Network Error') || !error.response) {
        const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
        (networkError as any).code = 'NETWORK_ERROR';
        throw networkError;
      }
      
      throw new Error('Error inesperado al refinar predicción');
    }
  }

  /**
   * Valida una predicción comparándola con la fecha real de maduración
   * Calcula métricas de precisión y proporciona retroalimentación
   */
  async validarPrediccion(
    prediccionOriginal: PrediccionPolinizacionResponse,
    fechaMaduracionReal: string
  ): Promise<ValidacionPrediccionResponse> {
    try {
      logger.info('🌸 Validando predicción de polinización');
      
      const data = {
        prediccion_original: prediccionOriginal,
        fecha_maduracion_real: fechaMaduracionReal
      };
      
      const response = await api.post('predicciones/polinizacion/validar/', data);
      
      if (response.data.success) {
        logger.success(' Predicción validada exitosamente');
        return response.data.validacion;
      } else {
        throw new Error(response.data.error || 'Error desconocido en validación');
      }
    } catch (error: any) {
      console.error('❌ Error validando predicción de polinización:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.networkError) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        throw new Error('Error inesperado al validar predicción');
      }
    }
  }

  /**
   * Obtiene el historial de predicciones con filtros opcionales
   * Permite filtrar por especie, rango de fechas y límite de resultados
   */
  async obtenerHistorial(filtros?: {
    especie?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    limit?: number;
  }): Promise<HistorialPrediccionesResponse> {
    try {
      logger.info('🌸 Obteniendo historial de predicciones:', filtros);
      
      const params = new URLSearchParams();
      if (filtros?.especie) params.append('especie', filtros.especie);
      if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros?.limit) params.append('limit', filtros.limit.toString());
      
      const response = await api.get(`predicciones/polinizacion/historial/?${params.toString()}`);
      
      if (response.data.success) {
        logger.success(' Historial obtenido exitosamente');
        return response.data.historial;
      } else {
        throw new Error(response.data.error || 'Error desconocido obteniendo historial');
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo historial de predicciones:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.networkError) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        throw new Error('Error inesperado al obtener historial');
      }
    }
  }

  /**
   * Obtiene estadísticas generales del sistema de predicciones
   * Incluye métricas de rendimiento, distribuciones y tendencias
   */
  async obtenerEstadisticas(): Promise<EstadisticasPredicciones> {
    try {
      logger.info('🌸 Obteniendo estadísticas de predicciones de polinización');
      
      // Por ahora retornamos estadísticas simuladas
      // En una implementación completa, esto haría una llamada al backend
      const estadisticasSimuladas: EstadisticasPredicciones = {
        total_predicciones: 45,
        predicciones_validadas: 32,
        precision_promedio: 87.5,
        confianza_promedio: 82.3,
        especies_mas_predichas: [
          { especie: 'cattleya', cantidad: 15, precision_promedio: 92.1 },
          { especie: 'phalaenopsis', cantidad: 12, precision_promedio: 85.7 },
          { especie: 'dendrobium', cantidad: 8, precision_promedio: 89.3 },
          { especie: 'oncidium', cantidad: 6, precision_promedio: 83.2 },
          { especie: 'vanda', cantidad: 4, precision_promedio: 78.9 }
        ],
        distribucion_por_tipo: {
          inicial: 18,
          refinada: 20,
          basica_con_fecha: 5,
          validada: 2
        },
        distribucion_por_calidad: {
          excelente: 12,
          buena: 15,
          aceptable: 8,
          regular: 4,
          pobre: 1
        },
        tendencia_mensual: [
          { mes: '2024-01', predicciones: 8, precision_promedio: 85.2 },
          { mes: '2024-02', predicciones: 12, precision_promedio: 87.8 },
          { mes: '2024-03', predicciones: 15, precision_promedio: 89.1 },
          { mes: '2024-04', predicciones: 10, precision_promedio: 86.5 }
        ],
        modelo_version: '1.0.0',
        modelo_precision: 87.5,
        ultima_actualizacion: new Date().toISOString()
      };
      
      logger.success(' Estadísticas obtenidas exitosamente');
      return estadisticasSimuladas;
      
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas de predicciones:', error);
      throw new Error('Error inesperado al obtener estadísticas');
    }
  }

  /**
   * Utilidades para validación de datos de entrada
   */
  validarDatosPrediccion(data: Partial<PrediccionPolinizacionRequest>): string[] {
    const errores: string[] = [];
    
    if (!data.especie || data.especie.trim() === '') {
      errores.push('La especie es requerida');
    }
    
    if (data.fecha_polinizacion) {
      const fecha = new Date(data.fecha_polinizacion);
      const hoy = new Date();
      
      if (fecha > hoy) {
        errores.push('La fecha de polinización no puede ser futura');
      }
    }
    
    if (data.fecha_maduracion && data.fecha_polinizacion) {
      const fechaPol = new Date(data.fecha_polinizacion);
      const fechaMad = new Date(data.fecha_maduracion);
      
      if (fechaMad <= fechaPol) {
        errores.push('La fecha de maduración debe ser posterior a la polinización');
      }
    }
    
    if (data.condiciones_climaticas?.temperatura?.promedio) {
      const temp = data.condiciones_climaticas.temperatura.promedio;
      if (temp < -50 || temp > 60) {
        errores.push('La temperatura promedio debe estar entre -50°C y 60°C');
      }
    }
    
    if (data.condiciones_climaticas?.humedad) {
      const humedad = data.condiciones_climaticas.humedad;
      if (humedad < 0 || humedad > 100) {
        errores.push('La humedad debe estar entre 0% y 100%');
      }
    }
    
    return errores;
  }

  /**
   * Formatea fechas para mostrar en la UI
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
      const objetivo = new Date(fechaObjetivo);
      const diferencia = objetivo.getTime() - hoy.getTime();
      return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Determina el color para mostrar la confianza
   */
  obtenerColorConfianza(confianza: number): string {
    if (confianza >= 90) return '#4CAF50'; // Verde
    if (confianza >= 75) return '#8BC34A'; // Verde claro
    if (confianza >= 60) return '#FFC107'; // Amarillo
    if (confianza >= 40) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  }

  /**
   * Determina el color para mostrar la precisión
   */
  obtenerColorPrecision(precision: number): string {
    if (precision >= 90) return '#4CAF50'; // Verde - Excelente
    if (precision >= 75) return '#8BC34A'; // Verde claro - Buena
    if (precision >= 60) return '#FFC107'; // Amarillo - Aceptable
    if (precision >= 40) return '#FF9800'; // Naranja - Regular
    return '#F44336'; // Rojo - Pobre
  }
}

// Exportar instancia única del servicio
export const polinizacionPrediccionService = new PolinizacionPrediccionService();