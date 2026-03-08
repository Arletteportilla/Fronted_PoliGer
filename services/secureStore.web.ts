// Web implementation of SecureStore using sessionStorage.
//
// SECURITY NOTE: sessionStorage is scoped to the browser tab and is cleared
// automatically when the tab is closed, significantly reducing the XSS attack
// window compared to localStorage (which persists indefinitely).
//
// Remaining risk: sessionStorage is still readable by JavaScript running in the
// same origin (e.g. via an XSS vulnerability). The definitive fix is to store
// tokens in httpOnly + SameSite=Strict cookies managed server-side so that JS
// can never access them directly.
import { logger } from '@/services/logger';

export const secureStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      return sessionStorage.getItem(key);
    } catch (error) {
      logger.error('Error getting item from sessionStorage:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      sessionStorage.setItem(key, value);
    } catch (error) {
      logger.error('Error setting item in sessionStorage:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      sessionStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing item from sessionStorage:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      sessionStorage.clear();
    } catch (error) {
      logger.error('Error clearing sessionStorage:', error);
      throw error;
    }
  }
};

export default secureStore;