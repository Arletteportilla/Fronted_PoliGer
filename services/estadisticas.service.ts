import api from './api';

import type { EstadisticasUsuario } from '@/types/index';
import { logger } from '@/services/logger';

// Datos de fallback para cuando el backend falle
const FALLBACK_STATS: EstadisticasUsuario = {
  total_polinizaciones: 0,
  total_germinaciones: 0,
  polinizaciones_actuales: 0,
  germinaciones_actuales: 0,
  usuario: 'Usuario'
};

class EstadisticasService {
  // Cache para evitar llamadas repetidas
  private cache: EstadisticasUsuario | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 segundos

  async getEstadisticasUsuario(): Promise<EstadisticasUsuario> {
    try {
      // Verificar cache primero
      if (this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
        return this.cache;
      }

      const response = await api.get('estadisticas/usuario/');
      
      // Guardar en cache
      this.cache = response.data;
      this.cacheTimestamp = Date.now();
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo estadísticas del usuario:', error);
      
      // Si es un error 500 (servidor), usar datos de fallback
      if (error.response?.status === 500) {
        return FALLBACK_STATS;
      }
      
      // Para otros errores, también usar fallback para no bloquear la app
      return FALLBACK_STATS;
    }
  }

  // Método para obtener estadísticas con timeout ultra-corto
  async getEstadisticasUsuarioWithTimeout(timeoutMs: number = 2000): Promise<EstadisticasUsuario> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await api.get('estadisticas/usuario/', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Guardar en cache
      this.cache = response.data;
      this.cacheTimestamp = Date.now();
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo estadísticas del usuario:', error);
      
      // Si es timeout o cualquier otro error, usar fallback
      if (error.name === 'AbortError') {
      } else if (error.response?.status === 500) {
      } else {
      }
      
      return FALLBACK_STATS;
    }
  }

  // Método para obtener estadísticas con reintentos mínimos
  async getEstadisticasUsuarioWithRetry(maxRetries: number = 1): Promise<EstadisticasUsuario> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.get('estadisticas/usuario/');
        
        // Guardar en cache
        this.cache = response.data;
        this.cacheTimestamp = Date.now();
        
        return response.data;
      } catch (error: any) {
        logger.error(`❌ Intento ${attempt} falló:`, error);
        
        if (attempt === maxRetries) {
          return FALLBACK_STATS;
        }
        
        // Esperar antes del siguiente intento (tiempo muy corto)
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return FALLBACK_STATS;
  }

  // Método para limpiar cache
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  // Método para obtener estadísticas rápidas (con cache)
  async getEstadisticasRapidas(): Promise<EstadisticasUsuario> {
    // Si hay cache válido, usarlo inmediatamente
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }
    
    // Si no hay cache, intentar obtener datos con timeout muy corto
    return this.getEstadisticasUsuarioWithTimeout(1500);
  }
}

export const estadisticasService = new EstadisticasService();