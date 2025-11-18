/**
 * Hook personalizado para germinaciones con paginación tradicional y filtros
 *
 * Características:
 * - Paginación tradicional con botones (1, 2, 3...)
 * - Filtros múltiples (estado, clima, responsable, etc.)
 * - Búsqueda en tiempo real con debounce
 * - Pull to refresh
 * - Estadísticas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { germinacionService } from '@/services/germinacion.service';
import type { GerminacionFilterParams } from '@/components/filters/GerminacionFilters';

export interface UseGerminacionesWithFiltersResult {
  // Datos
  germinaciones: any[];
  loading: boolean;
  refreshing: boolean;

  // Paginación
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;

  // Filtros
  filters: GerminacionFilterParams;
  setFilters: (filters: GerminacionFilterParams) => void;
  activeFiltersCount: number;

  // Estadísticas
  estadisticas: any;

  // Acciones
  loadGerminaciones: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  refresh: () => Promise<void>;
  resetFilters: () => void;
}

export const useGerminacionesWithFilters = (): UseGerminacionesWithFiltersResult => {
  const [germinaciones, setGerminaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFiltersState] = useState<GerminacionFilterParams>({});
  const [estadisticas, setEstadisticas] = useState<any>(null);

  // Ref para evitar llamadas duplicadas
  const loadingRef = useRef(false);

  // Cargar germinaciones para una página específica
  const loadGerminaciones = useCallback(async (page: number = 1) => {
    // Evitar llamadas duplicadas
    if (loadingRef.current) {
      console.log('⏸️ Ya hay una carga en progreso, ignorando...');
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      console.log('🔄 Cargando germinaciones - Página:', page, 'Filtros:', filters);

      const response = await germinacionService.getPaginated({
        page,
        page_size: 20,
        ...filters,
      });

      console.log('✅ Respuesta recibida:', {
        page,
        count: response.count,
        results: response.results.length,
        totalPages: response.totalPages,
      });

      // Reemplazar la lista completa
      setGerminaciones(response.results);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalCount(response.count);
      setHasMore(!!response.next);

    } catch (error) {
      console.error('❌ Error cargando germinaciones:', error);
      setGerminaciones([]);
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
    await loadGerminaciones(page);
  }, [totalPages, loadGerminaciones]);

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
    await loadGerminaciones(1);
  }, [loadGerminaciones]);

  // Actualizar filtros
  const setFilters = useCallback((newFilters: GerminacionFilterParams) => {
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
    (key) => filters[key as keyof GerminacionFilterParams]
  ).length;

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      const options = await germinacionService.getFilterOptions();
      setEstadisticas(options.estadisticas);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  }, []);

  // Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    loadGerminaciones(currentPage);
  }, [filters]);

  // Efecto para cargar estadísticas al inicio
  useEffect(() => {
    loadEstadisticas();
  }, [loadEstadisticas]);

  return {
    // Datos
    germinaciones,
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

    // Estadísticas
    estadisticas,

    // Acciones
    loadGerminaciones: () => loadGerminaciones(currentPage),
    goToPage,
    nextPage,
    prevPage,
    refresh,
    resetFilters,
  };
};
