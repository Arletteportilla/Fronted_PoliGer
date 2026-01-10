import { useState, useCallback } from 'react';
import { polinizacionMLService } from '@/services/polinizacion-ml.service';
import type { PrediccionMLRequest, PrediccionMLResponse } from '@/services/polinizacion-ml.service';

/**
 * Hook para manejar predicciones ML de polinización usando XGBoost
 */
export function usePolinizacionML() {
  const [prediccionML, setPrediccionML] = useState<PrediccionMLResponse | null>(null);
  const [isPredictingML, setIsPredictingML] = useState(false);
  const [errorML, setErrorML] = useState<string | null>(null);

  /**
   * Realiza predicción usando el modelo XGBoost
   */
  const predecirML = useCallback(async (formData: {
    fecha_polinizacion?: string;
    madre_genero?: string;
    madre_especie?: string;
    ubicacion_nombre?: string;
    responsable?: string;
    tipo_polinizacion?: string;
    cantidad_capsulas?: number;
    cantidad?: number;
    vivero?: string;
    mesa?: string;
    pared?: string;
  }) => {
    try {
      setIsPredictingML(true);
      setErrorML(null);

      // Validaciones básicas
      if (!formData.fecha_polinizacion) {
        throw new Error('Fecha de polinización es requerida');
      }
      if (!formData.madre_genero) {
        throw new Error('Género de la madre es requerido');
      }
      if (!formData.madre_especie) {
        throw new Error('Especie de la madre es requerida');
      }

      // Construir ubicación
      let ubicacion = formData.ubicacion_nombre || '';
      if (formData.vivero) {
        ubicacion = formData.vivero;
        if (formData.mesa) ubicacion += ` - ${formData.mesa}`;
        if (formData.pared) ubicacion += ` - ${formData.pared}`;
      }

      // Preparar request
      const requestData: PrediccionMLRequest = {
        fechapol: formData.fecha_polinizacion,
        genero: formData.madre_genero,
        especie: formData.madre_especie,
        ubicacion: ubicacion || 'No especificada',
        responsable: formData.responsable || 'Usuario',
        Tipo: formData.tipo_polinizacion || 'SELF',
        cantidad: formData.cantidad_capsulas || formData.cantidad || 1,
        disponible: 1
      };

      const resultado = await polinizacionMLService.predecir(requestData);

      setPrediccionML(resultado);
      return resultado;

    } catch (err: any) {
      logger.error('Error en predicción ML:', err);

      let mensajeError = 'Error al realizar la predicción ML';

      if (err.code === 'INVALID_INPUT') {
        mensajeError = err.message;
      } else if (err.code === 'UNAUTHORIZED') {
        mensajeError = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (err.code === 'FORBIDDEN') {
        mensajeError = 'No tienes permisos para realizar predicciones';
      } else if (err.code === 'MODEL_NOT_LOADED') {
        mensajeError = 'El modelo ML no está disponible temporalmente';
      } else if (err.code === 'NETWORK_ERROR') {
        mensajeError = 'Error de conexión. Verifica tu internet.';
      } else if (err.code === 'TIMEOUT') {
        mensajeError = 'La predicción tardó demasiado. Intenta de nuevo.';
      } else if (err.message) {
        mensajeError = err.message;
      }

      setErrorML(mensajeError);
      throw new Error(mensajeError);

    } finally {
      setIsPredictingML(false);
    }
  }, []);

  /**
   * Obtiene información del modelo ML
   */
  const obtenerInfoModelo = useCallback(async () => {
    try {
      const info = await polinizacionMLService.obtenerInfoModelo();
      return info;
    } catch (err: any) {
      logger.error('Error obteniendo info del modelo:', err);
      throw err;
    }
  }, []);

  /**
   * Limpia la predicción actual
   */
  const limpiarPrediccionML = useCallback(() => {
    setPrediccionML(null);
    setErrorML(null);
  }, []);

  /**
   * Aplica la predicción ML al formulario
   */
  const aplicarPrediccionMLAlFormulario = useCallback((
    prediccion: PrediccionMLResponse,
    setForm: (updater: (prev: any) => any) => void
  ) => {
    setForm((prev: any) => ({
      ...prev,
      fecha_maduracion: prediccion.fecha_estimada_maduracion,
    }));
  }, []);

  return {
    // Estado
    prediccionML,
    isPredictingML,
    errorML,

    // Funciones
    predecirML,
    obtenerInfoModelo,
    limpiarPrediccionML,
    aplicarPrediccionMLAlFormulario,

    // Utilidades del servicio (re-exportadas para conveniencia)
    formatearFecha: polinizacionMLService.formatearFecha,
    calcularDiasRestantes: polinizacionMLService.calcularDiasRestantes,
    obtenerColorConfianza: polinizacionMLService.obtenerColorConfianza,
    obtenerMensajeCategorias: polinizacionMLService.obtenerMensajeCategorias,
    obtenerExplicacionConfianza: polinizacionMLService.obtenerExplicacionConfianza,
  };
}
