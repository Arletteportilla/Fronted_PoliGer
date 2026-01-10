// Web implementation of SecureStore using localStorage as fallback
export const secureStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      logger.error('Error getting item from localStorage:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.setItem(key, value);
    } catch (error) {
      logger.error('Error setting item in localStorage:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing item from localStorage:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.clear();
    } catch (error) {
      logger.error('Error clearing localStorage:', error);
      throw error;
    }
  }
};

export default secureStore;