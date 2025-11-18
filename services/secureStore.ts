import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const secureStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from secure store:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in secure store:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from secure store:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        return;
      }
      // Note: SecureStore doesn't have a clear all method
      // You would need to track keys and remove them individually
      console.warn('SecureStore clear not implemented - use removeItem for specific keys');
    } catch (error) {
      console.error('Error clearing secure store:', error);
      throw error;
    }
  }
};

export default secureStore;