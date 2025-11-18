import api from './api';
import { 
  polinizacionPrediccionService, 
  PrediccionPolinizacionRequest, 
  PrediccionPolinizacionResponse 
} from './polinizacion-prediccion.service';

export interface PrediccionRequest {
  nombre?: string;
  especie?: string;
  genero?: string;
  no_capsulas?: number;
  clima?: string;
  ubicacion?: string;
  responsable?: string;
  tipo_polinizacion?: string;
  f_siembra?: string;
  f_germi?: string;
  fecha_ingreso?: string;
  fecha_polinizacion?: string;
}

export interface PrediccionResponse {
  dias_estimados: number;
  dias_modelo_original: number;
  fecha_germinacion: string;
  fecha_base: string;
  tiempo_germinacion_calculado: number | null;
  especie_info: {
    especie: string;
    genero: string;
    dias_base_especie: number;
    factor_clima_especie: number;
    temperatura_preferida: string;
    prediccion_especifica: string;
  };
  parametros_usados: PrediccionRequest;
}

class PrediccionService {
  async predecirGerminacion(data: PrediccionRequest): Promise<PrediccionResponse> {
    try {
      const response = await api.post('predicciones/germinacion/', data);
      return response.data;
    } catch (error) {
      console.error('Error en predicción de germinación:', error);
      throw error;
    }
  }

  async predecirPolinizacion(data: Partial<PrediccionRequest>): Promise<any> {
    try {
      const response = await api.post('predicciones/polinizacion/', data);
      return response.data;
    } catch (error) {
      console.error('Error en predicción de polinización:', error);
      throw error;
    }
  }

  async prediccionCompleta(data: PrediccionRequest): Promise<any> {
    try {
      const response = await api.post('predicciones/completa/', data);
      return response.data;
    } catch (error) {
      console.error('Error en predicción completa:', error);
      throw error;
    }
  }

  async obtenerEstadisticasModelos(): Promise<any> {
    try {
      const response = await api.get('predicciones/estadisticas/');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de modelos:', error);
      throw error;
    }
  }

  // ============================================================================
  // NUEVOS MÉTODOS PARA PREDICCIONES DE POLINIZACIÓN CON MODELO .BIN
  // ============================================================================

  /**
   * Genera predicción inicial de polinización usando modelo .bin
   */
  async predecirPolinizacionInicial(data: {
    especie: string;
    clima?: string;
    ubicacion?: string;
    fecha_polinizacion?: string;
  }): Promise<PrediccionPolinizacionResponse> {
    return polinizacionPrediccionService.generarPrediccionInicial(data);
  }

  /**
   * Refina predicción de polinización con datos adicionales
   */
  async refinarPrediccionPolinizacion(data: PrediccionPolinizacionRequest): Promise<PrediccionPolinizacionResponse> {
    return polinizacionPrediccionService.refinarPrediccion(data);
  }

  /**
   * Valida predicción de polinización con fecha real
   */
  async validarPrediccionPolinizacion(
    prediccionOriginal: PrediccionPolinizacionResponse,
    fechaMaduracionReal: string
  ) {
    return polinizacionPrediccionService.validarPrediccion(prediccionOriginal, fechaMaduracionReal);
  }

  /**
   * Obtiene historial de predicciones de polinización
   */
  async obtenerHistorialPolinizacion(filtros?: {
    especie?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    limit?: number;
  }) {
    return polinizacionPrediccionService.obtenerHistorial(filtros);
  }

  /**
   * Predicción completa de polinización (flujo automático)
   */
  async prediccionPolinizacionCompleta(data: PrediccionPolinizacionRequest) {
    return polinizacionPrediccionService.prediccionCompleta(data);
  }

  /**
   * Obtiene estadísticas de predicciones de polinización
   */
  async obtenerEstadisticasPolinizacion() {
    return polinizacionPrediccionService.obtenerEstadisticas();
  }

  /**
   * Utilidades para predicciones de polinización
   */
  validarDatosPolinizacion(data: Partial<PrediccionPolinizacionRequest>): string[] {
    return polinizacionPrediccionService.validarDatosPrediccion(data);
  }

  formatearFecha(fecha: string): string {
    return polinizacionPrediccionService.formatearFecha(fecha);
  }

  calcularDiasRestantes(fechaObjetivo: string): number {
    return polinizacionPrediccionService.calcularDiasRestantes(fechaObjetivo);
  }

  obtenerColorConfianza(confianza: number): string {
    return polinizacionPrediccionService.obtenerColorConfianza(confianza);
  }

  obtenerColorPrecision(precision: number): string {
    return polinizacionPrediccionService.obtenerColorPrecision(precision);
  }
}

export const prediccionService = new PrediccionService();