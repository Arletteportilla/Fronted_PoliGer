import { useState, useCallback } from 'react';

/**
 * Estado de paginación
 */
export interface PaginationState {
  page: number;
  search: string;
  totalPages: number;
  totalCount: number;
}

/**
 * Resultado de la búsqueda paginada
 */
export interface PaginatedResult<T> {
  results: T[];
  count: number;
  totalPages: number;
  page: number;
}

/**
 * Parámetros para el fetcher
 */
export interface FetcherParams {
  page: number;
  page_size: number;
  search?: string;
  dias_recientes?: number;
}

/**
 * Controles de paginación
 */
export interface PaginationControls {
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  handleSearch: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => Promise<void>;
}

/**
 * Hook para manejar búsqueda paginada de forma genérica
 *
 * Centraliza el patrón repetitivo de:
 * - Estado de página actual
 * - Estado de término de búsqueda
 * - Total de páginas y registros
 * - Navegación entre páginas
 * - Búsqueda con reset a página 1
 *
 * @param fetcher - Función que obtiene los datos paginados
 * @param pageSize - Tamaño de página (default: 20)
 * @param diasRecientes - Filtro de días recientes (default: 0 = todos)
 * @returns [state, controls] - Estado y controles de paginación
 *
 * @example
 * ```tsx
 * const [pagination, paginationControls] = usePaginatedSearch(
 *   async (params) => await polinizacionService.getMisPolinizacionesPaginated(params),
 *   20,
 *   0
 * );
 *
 * // Cambiar búsqueda
 * paginationControls.setSearch('PHE');
 * await paginationControls.handleSearch();
 *
 * // Navegar páginas
 * paginationControls.nextPage();
 * paginationControls.prevPage();
 * paginationControls.goToPage(3);
 * ```
 */
export const usePaginatedSearch = (
  fetcher: (params: FetcherParams) => Promise<PaginatedResult<any>>,
  pageSize: number = 20,
  diasRecientes: number = 0
): [PaginationState, PaginationControls] => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Ejecuta la búsqueda y actualiza el estado
   */
  const handleSearch = useCallback(async () => {
    try {
      const result = await fetcher({
        page: 1, // Reset a página 1 al buscar
        page_size: pageSize,
        search: search || undefined,
        dias_recientes: diasRecientes
      });

      setTotalPages(result.totalPages || 1);
      setTotalCount(result.count || 0);
      setPage(1);
    } catch (error) {
      console.error('Error en búsqueda paginada:', error);
      setTotalPages(1);
      setTotalCount(0);
      setPage(1);
    }
  }, [fetcher, pageSize, search, diasRecientes]);

  /**
   * Refresca los datos con los parámetros actuales
   */
  const refresh = useCallback(async () => {
    try {
      const result = await fetcher({
        page,
        page_size: pageSize,
        search: search || undefined,
        dias_recientes: diasRecientes
      });

      setTotalPages(result.totalPages || 1);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Error al refrescar datos paginados:', error);
    }
  }, [fetcher, page, pageSize, search, diasRecientes]);

  /**
   * Navega a la siguiente página
   */
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  /**
   * Navega a la página anterior
   */
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  /**
   * Navega a una página específica
   */
  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return [
    {
      page,
      search,
      totalPages,
      totalCount,
    },
    {
      setPage,
      setSearch,
      handleSearch,
      nextPage,
      prevPage,
      goToPage,
      refresh,
    }
  ];
};
