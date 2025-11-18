/**
 * Hook personalizado para polinizaciones con paginación tradicional y filtros
 *
 * Características:
 * - Paginación tradicional con botones (1, 2, 3...)
 * - Filtros múltiples (estado, clima, responsable, etc.)
 * - Búsqueda en tiempo real con debounce
 * - Pull to refresh
 * - Estadísticas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { polinizacionService } from '@/services/polinizacion.service';
import type { PolinizacionFilterParams } from '@/types';

export interface UsePolinizacionesWithFiltersResult {
  // Datos
  polinizaciones: any[];
  loading: boolean;
  refreshing: boolean;

  // Paginación
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;

  // Filtros
  filters: PolinizacionFilterParams;
  setFilters: (filters: PolinizacionFilterParams) => void;
  activeFiltersCount: number;

  // Acciones
  loadPolinizaciones: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  refresh: () => Promise<void>;
  resetFilters: () => void;
}

export const usePolinizacionesWithFilters = (): UsePolinizacionesWithFiltersResult => {
  const [polinizaciones, setPolinizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFiltersState] = useState<PolinizacionFilterParams>({});

  // Ref para evitar llamadas duplicadas
  const loadingRef = useRef(false);

  // Cargar polinizaciones para una página específica
  const loadPolinizaciones = useCallback(async (page: number = 1) => {
    // Evitar llamadas duplicadas
    if (loadingRef.current) {
      console.log('⏸️ Ya hay una carga en progreso, ignorando...');
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      console.log('🔄 Cargando polinizaciones - Página:', page, 'Filtros:', filters);

      const response = await polinizacionService.getPaginated({
        page,
        page_size: 20,
        ...filters,
      });

      console.log('✅ Respuesta recibida:', {
        page,
        count: response.totalCount,
        results: response.results.length,
        totalPages: response.totalPages,
      });

      // Reemplazar la lista completa
      setPolinizaciones(response.results);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      setHasMore(response.hasNext);

    } catch (error) {
      console.error('❌ Error cargando polinizaciones:', error);
      setPolinizaciones([]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  // Ir a una página específica
  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > totalPages) {
      console.log('⚠️ Página fuera de rango:', page);
      return;
    }
    setCurrentPage(page);
    await loadPolinizaciones(page);
  }, [totalPages, loadPolinizaciones]);

  // Página siguiente
  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  // Página anterior
  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      await goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Refresh (pull to refresh)
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadPolinizaciones(1);
  }, [loadPolinizaciones]);

  // Actualizar filtros
  const setFilters = useCallback((newFilters: PolinizacionFilterParams) => {
    console.log('🔍 Actualizando filtros:', newFilters);
    setFiltersState(newFilters);
    setCurrentPage(1);
  }, []);

  // Resetear filtros
  const resetFilters = useCallback(() => {
    console.log('🔄 Reseteando filtros');
    setFilters({});
  }, [setFilters]);

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof PolinizacionFilterParams]
  ).length;

  // Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    loadPolinizaciones(currentPage);
  }, [filters]);

  return {
    // Datos
    polinizaciones,
    loading,
    refreshing,

    // Paginación
    currentPage,
    totalPages,
    totalCount,
    hasMore,

    // Filtros
    filters,
    setFilters,
    activeFiltersCount,

    // Acciones
    loadPolinizaciones: () => loadPolinizaciones(currentPage),
    goToPage,
    nextPage,
    prevPage,
    refresh,
    resetFilters,
  };
};
