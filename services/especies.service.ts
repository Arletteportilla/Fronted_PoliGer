import api from './api';
import { logger } from '@/services/logger';

export interface EspeciesResponse {
  especies: string[];
  total: number;
}

export interface GenerosResponse {
  generos: string[];
  total: number;
}

class EspeciesService {
  /**
   * Obtiene todas las especies disponibles en la base de datos
   */
  async obtenerEspecies(): Promise<string[]> {
    try {
      const response = await api.get('polinizaciones/especies_disponibles/');
      return response.data.especies || [];
    } catch (error) {
      logger.error('Error obteniendo especies:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los géneros disponibles en la base de datos
   */
  async obtenerGeneros(): Promise<string[]> {
    try {
      const response = await api.get('polinizaciones/generos_disponibles/');
      return response.data.generos || [];
    } catch (error) {
      logger.error('Error obteniendo géneros:', error);
      return [];
    }
  }

  /**
   * Busca especies que contengan el texto especificado
   */
  buscarEspecies(especies: string[], texto: string): string[] {
    if (!texto || texto.length < 2) return especies.slice(0, 50); // Limitar a 50 para performance

    const textoLower = texto.toLowerCase();
    return especies
      .filter(especie => especie.toLowerCase().includes(textoLower))
      .slice(0, 50); // Limitar resultados
  }

  /**
   * Busca géneros que contengan el texto especificado
   */
  buscarGeneros(generos: string[], texto: string): string[] {
    if (!texto || texto.length < 2) return generos.slice(0, 50);

    const textoLower = texto.toLowerCase();
    return generos
      .filter(genero => genero.toLowerCase().includes(textoLower))
      .slice(0, 50);
  }

  /**
   * Obtiene especies relacionadas con un género específico
   */
  obtenerEspeciesPorGenero(especies: string[], genero: string): string[] {
    if (!genero) return [];

    const generoLower = genero.toLowerCase();
    return especies
      .filter(especie => especie.toLowerCase().includes(generoLower))
      .slice(0, 20);
  }
}

export const especiesService = new EspeciesService();