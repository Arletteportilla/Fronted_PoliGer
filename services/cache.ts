import AsyncStorage from '@react-native-async-storage/async-storage';



class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.cache.get(key);
    if (memoryItem && Date.now() - memoryItem.timestamp < memoryItem.ttl) {
      return memoryItem.data as T;
    }

    // Check persistent storage
    try {
      const stored = await AsyncStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          // Update memory cache
          this.cache.set(key, parsed);
          return parsed.data as T;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const item = { data, timestamp: Date.now(), ttl };
    
    // Update memory cache
    this.cache.set(key, item);
    
    // Update persistent storage (async, no await to avoid blocking)
    AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item)).catch(error => {
      console.warn('Cache write error:', error);
    });
  }

  async clear(key?: string): Promise<void> {
    if (key) {
      this.cache.delete(key);
      AsyncStorage.removeItem(`cache_${key}`).catch(() => {});
    } else {
      this.cache.clear();
      // Clear all cache items from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache_'));
      AsyncStorage.multiRemove(cacheKeys).catch(() => {});
    }
  }

  async preload(key: string, loader: () => Promise<any>, ttl?: number): Promise<void> {
    const existing = await this.get(key);
    if (!existing) {
      try {
        const data = await loader();
        await this.set(key, data, ttl);
      } catch (error) {
        console.warn('Preload failed for key:', key, error);
      }
    }
  }
}

export const cache = CacheManager.getInstance();

// Common cache configurations
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  PERMISSIONS: 'user_permissions',
  DASHBOARD_DATA: 'dashboard_data',
  GERMINACIONES: 'germinaciones_list',
  POLINIZACIONES: 'polinizaciones_list',
  ESPECIES: 'especies_list',
  GENEROS: 'generos_list',
} as const;

export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 10 * 60 * 1000,    // 10 minutes  
  LONG: 60 * 60 * 1000,      // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;