import { useState, useCallback } from 'react';
import { germinacionService } from '@/services/germinacion.service';
import { PrediccionMejoradaResponse } from '@/types';
import { logger } from '@/services/logger';

interface UsePrediccionMejoradaProps {
  onSuccess?: (prediccion: PrediccionMejoradaResponse) => void;
  onError?: (error: string) => void;
}

export const usePrediccionMejorada = ({ onSuccess, onError }: UsePrediccionMejoradaProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [prediccion, setPrediccion] = useState<PrediccionMejoradaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcularPrediccion = useCallback(async (formData: {
    especie: string;
    genero: string;
    fecha_siembra: string;
    clima: 'I' | 'IW' | 'IC' | 'W' | 'C';
  }) => {
    try {
      setLoading(true);
      setError(null);

      logger.info('🔮 usePrediccionMejorada - Calculando predicción con:', formData);

      const resultado = await germinacionService.calcularPrediccionMejorada(formData);

      setPrediccion(resultado);
      
      if (onSuccess) {
        onSuccess(resultado);
      }

      logger.success(' usePrediccionMejorada - Predicción calculada exitosamente');
      return resultado;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      logger.error('❌ usePrediccionMejorada - Error:', errorMessage);
      
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const limpiarPrediccion = useCallback(() => {
    setPrediccion(null);
    setError(null);
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    prediccion,
    error,
    calcularPrediccion,
    limpiarPrediccion,
    limpiarError
  };
};

// Hook para manejar alertas de germinación
export const useAlertasGerminacion = () => {
  const [loading, setLoading] = useState(false);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const obtenerAlertas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('🔔 useAlertasGerminacion - Obteniendo alertas...');

      const resultado = await germinacionService.obtenerAlertasGerminacion();
      
      setAlertas(resultado.alertas || []);
      
      logger.success(' useAlertasGerminacion - Alertas obtenidas:', resultado.alertas?.length || 0);
      return resultado;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo alertas';
      logger.error('❌ useAlertasGerminacion - Error:', errorMessage);
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarAlertaRevisada = useCallback(async (germinacionId: number, estado: string) => {
    try {
      logger.start(` useAlertasGerminacion - Marcando alerta ${germinacionId} como ${estado}...`);

      await germinacionService.marcarAlertaRevisada(germinacionId, estado);
      
      // Actualizar la alerta en el estado local
      setAlertas(prev => prev.map(alerta => 
        alerta.id === germinacionId 
          ? { ...alerta, estado }
          : alerta
      ));

      logger.success(' useAlertasGerminacion - Alerta actualizada');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando alerta';
      logger.error('❌ useAlertasGerminacion - Error:', errorMessage);
      
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    loading,
    alertas,
    error,
    obtenerAlertas,
    marcarAlertaRevisada,
    setError
  };
};

// Hook para estadísticas de precisión del modelo
export const useEstadisticasPrecision = () => {
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const obtenerEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('📊 useEstadisticasPrecision - Obteniendo estadísticas...');

      const resultado = await germinacionService.obtenerEstadisticasPrecision();
      
      setEstadisticas(resultado);
      
      logger.success(' useEstadisticasPrecision - Estadísticas obtenidas');
      return resultado;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estadísticas';
      logger.error('❌ useEstadisticasPrecision - Error:', errorMessage);
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reentrenarModelo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('🤖 useEstadisticasPrecision - Reentrenando modelo...');

      const resultado = await germinacionService.reentrenarModelo();
      
      logger.success(' useEstadisticasPrecision - Modelo reentrenado');
      
      // Actualizar estadísticas después del reentrenamiento
      if (resultado.success) {
        await obtenerEstadisticas();
      }
      
      return resultado;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error reentrenando modelo';
      logger.error('❌ useEstadisticasPrecision - Error:', errorMessage);
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [obtenerEstadisticas]);

  return {
    loading,
    estadisticas,
    error,
    obtenerEstadisticas,
    reentrenarModelo,
    setError
  };
};