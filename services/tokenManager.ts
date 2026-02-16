import * as SecureStore from '@/services/secureStore';
import { CONFIG } from './config';
import { logger } from '@/services/logger';

interface TokenData {
  access: string;
  refresh: string;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<TokenData> | null = null;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Guardar tokens
  async saveTokens(tokens: TokenData): Promise<void> {
    try {
      await Promise.all([
        SecureStore.secureStore.setItem('authToken', tokens.access),
        SecureStore.secureStore.setItem('refreshToken', tokens.refresh)
      ]);
    } catch (error) {
      throw error;
    }
  }

  // Alias para saveTokens para compatibilidad
  async setTokens(access: string, refresh: string): Promise<void> {
    return this.saveTokens({ access, refresh });
  }

  // Obtener token de acceso
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.secureStore.getItem('authToken');
    } catch (error) {
      return null;
    }
  }

  // Obtener refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.secureStore.getItem('refreshToken');
    } catch (error) {
      return null;
    }
  }

  // Limpiar todos los tokens
  async clearTokens(): Promise<void> {
    try {
      logger.info('🧹 TokenManager: Limpiando tokens almacenados...');
      await Promise.all([
        SecureStore.secureStore.removeItem('authToken'),
        SecureStore.secureStore.removeItem('refreshToken')
      ]);
      logger.success(' TokenManager: Tokens limpiados exitosamente');
    } catch (error) {
      logger.error('❌ TokenManager: Error al limpiar tokens:', error);
      // Error silencioso
    }
  }

  // Refrescar token de manera segura (evita múltiples llamadas simultáneas)
  async refreshAccessToken(): Promise<string> {
    // Si ya hay un refresh en progreso, esperar a que termine
    if (this.refreshPromise) {
      const result = await this.refreshPromise;
      return result.access;
    }

    // Crear nueva promesa de refresh
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result.access;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<TokenData> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      // Crear una nueva instancia de axios para evitar el interceptor
      const axios = require('axios');
      const refreshApi = axios.create({
        baseURL: CONFIG.API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: CONFIG.API_TIMEOUT,
      });

      const response = await refreshApi.post('token/refresh/', { 
        refresh: refreshToken 
      });

      const tokens: TokenData = {
        access: response.data.access,
        refresh: response.data.refresh || refreshToken
      };

      // Guardar los nuevos tokens
      await this.saveTokens(tokens);

      return tokens;
    } catch (error) {
      // Limpiar tokens en caso de error
      await this.clearTokens();
      throw error;
    }
  }

  // Parsear el payload de un JWT de forma segura
  private parseJwtPayload(token: string): { exp: number } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1];
      if (!base64) return null;
      const payload = JSON.parse(atob(base64));
      if (typeof payload?.exp !== 'number') return null;
      return payload;
    } catch {
      return null;
    }
  }

  // Verificar si el token está próximo a expirar
  async isTokenExpiringSoon(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) return true;

      const payload = this.parseJwtPayload(token);
      if (!payload) return true;

      const timeUntilExpiry = payload.exp * 1000 - Date.now();

      // Considerar que está próximo a expirar si quedan menos de 5 minutos
      return timeUntilExpiry < 5 * 60 * 1000;
    } catch (error) {
      return true;
    }
  }

  // Verificar si el token está expirado
  async isTokenExpired(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) return true;

      const payload = this.parseJwtPayload(token);
      if (!payload) return true;

      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  }
}

export const tokenManager = TokenManager.getInstance();
