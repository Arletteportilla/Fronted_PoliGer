import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { CONFIG } from '@/services/config';
import { Logger } from './logger';

/**
 * Hook para debounce de funciones
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay) as ReturnType<typeof setTimeout>;
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook para throttle de funciones
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }
        lastCallTimer.current = setTimeout(() => {
          callback(...args);
          lastCall.current = Date.now();
        }, delay - (now - lastCall.current)) as ReturnType<typeof setTimeout>;
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook para memoización de objetos costosos
 */
export const useMemoizedObject = <T extends object>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

/**
 * Hook para memoización de funciones costosas
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

/**
 * Hook para lazy loading de componentes
 */
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    importFn()
      .then((module) => {
        setComponent(() => module.default);
      })
      .catch((error) => {
        Logger.error('Error loading lazy component:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [importFn]);

  if (loading) {
    return fallback || null;
  }

  return Component;
};

/**
 * Hook para performance monitoring
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (CONFIG.DEBUG_MODE && renderCount.current > 1) {
      Logger.debug(`${componentName} rendered ${renderCount.current} times, time since last render: ${timeSinceLastRender}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    timeSinceLastRender: Date.now() - lastRenderTime.current,
  };
};

/**
 * Hook para optimizar listas grandes
 */
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollOffset, setScrollOffset] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      offset: (startIndex + index) * itemHeight,
    }));
  }, [items, scrollOffset, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    setScrollOffset,
  };
};

/**
 * Hook para optimizar imágenes
 */
export const useImageOptimization = (uri: string, _size: number = 300) => {
  const [optimizedUri, setOptimizedUri] = React.useState(uri);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!uri) return;

    setLoading(true);
    // Aquí podrías implementar lógica de optimización de imágenes
    // Por ejemplo, usando un servicio como Cloudinary o similar
    setOptimizedUri(uri);
    setLoading(false);
  }, [uri]);

  return { optimizedUri, loading };
};

/**
 * Hook para cache de datos
 */
export const useDataCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos por defecto
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchData = useCallback(async () => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheRef.current.set(key, { data: result, timestamp: now });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  return { data, loading, error, refetch: fetchData, invalidateCache };
};
