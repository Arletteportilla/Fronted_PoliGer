import * as SecureStore from '@/services/secureStore';

export const debugAuth = {
  async checkToken() {
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      const user = await SecureStore.secureStore.getItem('user');

      console.log('🔍 DEBUG AUTH:');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length || 0);
      console.log('Token preview:', token?.substring(0, 20) + '...' || 'No token');
      console.log('User data:', user ? JSON.parse(user) : 'No user');

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
      console.log('✅ Auth cleared');
    } catch (error) {
      console.error('❌ Error clearing auth:', error);
    }
  },

  async testAPI() {
    try {
      const { token } = await this.checkToken();

      if (!token) {
        console.log('❌ No token available');
        return;
      }

      // Test polinizaciones
      const polResponse = await fetch('http://127.0.0.1:8000/api/polinizaciones/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('🌸 Polinizaciones API Status:', polResponse.status);

      if (polResponse.ok) {
        const polData = await polResponse.json();
        console.log('✅ Polinizaciones count:', polData.length);
      } else {
        console.log('❌ Polinizaciones error:', await polResponse.text());
      }

      // Test germinaciones
      const gerResponse = await fetch('http://127.0.0.1:8000/api/germinaciones/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('🌱 Germinaciones API Status:', gerResponse.status);

      if (gerResponse.ok) {
        const gerData = await gerResponse.json();
        console.log('✅ Germinaciones count:', gerData.length);
      } else {
        console.log('❌ Germinaciones error:', await gerResponse.text());
      }

    } catch (error) {
      console.error('❌ API test error:', error);
    }
  }
};

// Hacer disponible globalmente para debug
(global as any).debugAuth = debugAuth;