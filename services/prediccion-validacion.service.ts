import api from './api';
import { logger } from '@/services/logger';

/**
 * Servicio para validar predicciones con fechas reales
 * Permite entrenar el modelo ML con feedback real
 */

export interface ValidacionPrediccionRequest {
  fecha_maduracion_real: string; // Formato: "YYYY-MM-DD"
}

export interface ValidacionPrediccionResponse {
  success: boolean;
  mensaje: string;
  validacion: {
    fecha_predicha: string;
    fecha_real: string;
    diferencia_dias: number;
    precision: number;
    calidad: string; // "Excelente" | "Buena" | "Aceptable" | "Pobre"
    dias_estimados: number;
    dias_reales: number;
    desviacion_porcentual: number;
  };
}

export interface PrediccionValidada {
  id: number;
  codigo: string;
  especie: string;
  genero: string;
  fecha_polinizacion: string;
  fecha_predicha: string;
  fecha_real: string;
  dias_estimados: number;
  dias_reales: number;
  diferencia_dias: number;
  precision: number;
  calidad: string;
  modelo_usado: string;
  confianza_prediccion: number;
  validado_en: string;
  validado_por: string;
}

class PrediccionValidacionService {
  /**
   * Valida una predicción de polinización con la fecha real
   *
   * @param polinizacionId ID de la polinización
   * @param fechaMaduracionReal Fecha real de maduración
   * @returns Información de la validación
   */
  async validarPrediccionPolinizacion(
    polinizacionId: number,
    fechaMaduracionReal: string
  ): Promise<ValidacionPrediccionResponse> {
    try {
      logger.info(` Validando predicción de polinización ${polinizacionId}`);
      logger.info(`   Fecha real: ${fechaMaduracionReal}`);

      const response = await api.post<ValidacionPrediccionResponse>(
        `polinizaciones/${polinizacionId}/validar-prediccion/`,
        {
          fecha_maduracion_real: fechaMaduracionReal
        }
      );

      logger.success(' Predicción validada:', response.data);

      return response.data;
    } catch (error: any) {
      logger.error(' Error validando predicción:', error);
      throw this.procesarError(error);
    }
  }

  /**
   * Obtiene todas las predicciones validadas
   *
   * @param limite Cantidad máxima de resultados (default: 100)
   * @param precisionMinima Precisión mínima en porcentaje (default: 0)
   * @returns Lista de predicciones validadas
   */
  async obtenerPrediccionesValidadas(
    limite: number = 100,
    precisionMinima: number = 0
  ): Promise<{ total: number; predicciones: PrediccionValidada[] }> {
    try {
      logger.info(' Obteniendo predicciones validadas');

      const response = await api.get<{ total: number; predicciones: PrediccionValidada[] }>(
        'predicciones/validadas/',
        {
          params: {
            limite,
            precision_minima: precisionMinima
          }
        }
      );

      logger.success(` Predicciones validadas obtenidas: ${response.data.total}`);

      return response.data;
    } catch (error: any) {
      logger.error(' Error obteniendo predicciones validadas:', error);
      throw this.procesarError(error);
    }
  }

  /**
   * Exporta datos validados para reentrenamiento del modelo
   *
   * @returns URL de descarga del CSV
   */
  async exportarDatosReentrenamiento(): Promise<Blob> {
    try {
      logger.info(' Exportando datos para reentrenamiento');

      const response = await api.post(
        'predicciones/exportar-reentrenamiento/',
        {},
        {
          responseType: 'blob'
        }
      );

      logger.success(' Datos exportados');

      return response.data;
    } catch (error: any) {
      logger.error(' Error exportando datos:', error);
      throw this.procesarError(error);
    }
  }

  /**
   * Procesa errores del backend
   */
  private procesarError(error: any): Error {
    if (error.response?.status === 400) {
      return new Error(error.response.data.error || 'Datos inválidos');
    }

    if (error.response?.status === 403) {
      return new Error('No tienes permisos para validar esta predicción');
    }

    if (error.response?.status === 404) {
      return new Error('Polinización no encontrada');
    }

    if (error.response?.status === 500) {
      return new Error('Error del servidor al validar predicción');
    }

    return new Error(error.response?.data?.error || error.message || 'Error desconocido');
  }

  /**
   * Determina el color según la calidad de la predicción
   */
  obtenerColorCalidad(calidad: string): string {
    switch (calidad) {
      case 'Excelente':
        return '#10B981'; // Verde
      case 'Buena':
        return '#3B82F6'; // Azul
      case 'Aceptable':
        return '#F59E0B'; // Amarillo
      case 'Pobre':
        return '#EF4444'; // Rojo
      default:
        return '#6B7280'; // Gris
    }
  }

  /**
   * Formatea la precisión con ícono
   */
  formatearPrecision(precision: number): string {
    if (precision >= 90) {
      return `${precision.toFixed(1)}% 🎯`;
    } else if (precision >= 75) {
      return `${precision.toFixed(1)}% ✅`;
    } else if (precision >= 60) {
      return `${precision.toFixed(1)}% ⚠️`;
    } else {
      return `${precision.toFixed(1)}% ❌`;
    }
  }
}

export const prediccionValidacionService = new PrediccionValidacionService();
