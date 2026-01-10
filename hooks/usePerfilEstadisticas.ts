import { useState, useCallback } from 'react';
import { estadisticasService } from '@/services/estadisticas.service';
import type { EstadisticasUsuario } from '@/types/index';

export function usePerfilEstadisticas(username: string = 'Usuario') {
  const [estadisticas, setEstadisticas] = useState<EstadisticasUsuario>({
    total_polinizaciones: 0,
    total_germinaciones: 0,
    polinizaciones_actuales: 0,
    germinaciones_actuales: 0,
    usuario: username
  });
  const [loading, setLoading] = useState(false);

  const fetchEstadisticas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await estadisticasService.getEstadisticasUsuario();
      setEstadisticas(data);
    } catch (error) {
      logger.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    estadisticas,
    loading,
    fetchEstadisticas,
  };
}
