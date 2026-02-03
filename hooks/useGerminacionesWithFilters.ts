import { logger } from '@/services/logger';

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
import type { GerminacionFilterParams } from '@/types';

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

  // Ref para evitar llamadas duplicadas
  const loadingRef = useRef(false);

  // Cargar germinaciones para una página específica
  const loadGerminaciones = useCallback(async (page: number = 1) => {
    // Evitar llamadas duplicadas
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      // Usar getPaginated para obtener TODOS los registros del sistema
      const response = await germinacionService.getPaginated({
        page,
        page_size: 20,
        ...filters,
      });

      // Reemplazar la lista completa
      setGerminaciones(response.results);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalCount(response.count);
      setHasMore(!!response.next);

    } catch (error) {
      logger.error('❌ Error cargando germinaciones:', error);
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
    setFiltersState(newFilters);
    setCurrentPage(1); // Resetear a página 1
    setTotalPages(0); // Resetear total de páginas
    setTotalCount(0); // Resetear total de registros
  }, []);

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof GerminacionFilterParams]
  ).length;

  // Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    loadGerminaciones(1); // Siempre cargar página 1 cuando cambian los filtros
  }, [filters, loadGerminaciones]);

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

    // Acciones
    loadGerminaciones: () => loadGerminaciones(currentPage),
    goToPage,
    nextPage,
    prevPage,
    refresh,
    resetFilters,
  };
};