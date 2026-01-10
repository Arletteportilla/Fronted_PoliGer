import * as SecureStore from '@/services/secureStore';
import { logger } from '@/services/logger';

export const debugAuth = {
  async checkToken() {
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      const user = await SecureStore.secureStore.getItem('user');

      logger.debug(' DEBUG AUTH:');
      logger.info('Token exists:', !!token);
      logger.info('Token length:', token?.length || 0);
      logger.info('Token preview:', token?.substring(0, 20) + '...' || 'No token');
      logger.info('User data:', user ? JSON.parse(user) : 'No user');

      return { token, user: user ? JSON.parse(user) : null };
    } catch (error) {
      console.error('❌ Error checking auth:', error);
      return { token: null, user: null };
    }
  },

  async clearAuth() {
    try {
      await SecureStore.secureStore.removeItem('authToken');
      await SecureStore.secureStore.removeItem('user');
      logger.success(' Auth cleared');
    } catch (error) {
      console.error('❌ Error clearing auth:', error);
    }
  },

  async testAPI() {
    try {
      const { token } = await this.checkToken();

      if (!token) {
        logger.error(' No token available');
        return;
      }

      // Test polinizaciones
      const polResponse = await fetch('http://127.0.0.1:8000/api/polinizaciones/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      logger.info('🌸 Polinizaciones API Status:', polResponse.status);

      if (polResponse.ok) {
        const polData = await polResponse.json();
        logger.success(' Polinizaciones count:', polData.length);
      } else {
        logger.error(' Polinizaciones error:', await polResponse.text());
      }

      // Test germinaciones
      const gerResponse = await fetch('http://127.0.0.1:8000/api/germinaciones/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      logger.info('🌱 Germinaciones API Status:', gerResponse.status);

      if (gerResponse.ok) {
        const gerData = await gerResponse.json();
        logger.success(' Germinaciones count:', gerData.length);
      } else {
        logger.error(' Germinaciones error:', await gerResponse.text());
      }

    } catch (error) {
      console.error('❌ API test error:', error);
    }
  }
};

// Hacer disponible globalmente para debug
(global as any).debugAuth = debugAuth;