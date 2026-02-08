import { useState, useEffect } from 'react';
import { especiesService } from '@/services/especies.service';
import { logger } from '@/services/logger';

interface UseEspeciesGenerosResult {
  especies: string[];
  generos: string[];
  cargandoEspecies: boolean;
  cargandoGeneros: boolean;
  buscarEspecies: (texto: string) => string[];
  buscarGeneros: (texto: string) => string[];
  obtenerEspeciesPorGenero: (genero: string) => string[];
}

export const useEspeciesGeneros = (): UseEspeciesGenerosResult => {
  const [especies, setEspecies] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [cargandoEspecies, setCargandoEspecies] = useState(true);
  const [cargandoGeneros, setCargandoGeneros] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar especies y géneros en paralelo
      const [especiesData, generosData] = await Promise.all([
        especiesService.obtenerEspecies(),
        especiesService.obtenerGeneros()
      ]);

      setEspecies(especiesData);
      setGeneros(generosData);
    } catch (error) {
      logger.error('Error cargando especies y géneros:', error);
    } finally {
      setCargandoEspecies(false);
      setCargandoGeneros(false);
    }
  };

  const buscarEspecies = (texto: string): string[] => {
    return especiesService.buscarEspecies(especies, texto);
  };

  const buscarGeneros = (texto: string): string[] => {
    return especiesService.buscarGeneros(generos, texto);
  };

  const obtenerEspeciesPorGenero = (genero: string): string[] => {
    return especiesService.obtenerEspeciesPorGenero(especies, genero);
  };

  return {
    especies,
    generos,
    cargandoEspecies,
    cargandoGeneros,
    buscarEspecies,
    buscarGeneros,
    obtenerEspeciesPorGenero
  };
};