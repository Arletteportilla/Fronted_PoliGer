import { useState, useCallback } from 'react';
import { polinizacionService } from '@/services/polinizacion.service';
import type { Polinizacion } from '@/types/index';

export function usePerfilPolinizaciones() {
  const [polinizaciones, setPolinizaciones] = useState<Polinizacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Polinizacion | null>(null);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [itemToChangeStatus, setItemToChangeStatus] = useState<Polinizacion | null>(null);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [itemToFinalizar, setItemToFinalizar] = useState<Polinizacion | null>(null);

  const fetchPolinizaciones = useCallback(async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const response = await polinizacionService.getMisPolinizacionesPaginated({
        page,
        page_size: 10,
        search,
        dias_recientes: 0, // 0 = todas las polinizaciones del usuario, no solo las recientes
      });

      setPolinizaciones(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      setTotalCount(response.count || 0);
    } catch (error) {
      logger.error('Error al cargar polinizaciones:', error);
      setPolinizaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    setCurrentPage(1);
    await fetchPolinizaciones(1, searchText);
  }, [searchText, fetchPolinizaciones]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchPolinizaciones(page, searchText);
  }, [searchText, fetchPolinizaciones]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleView = useCallback((item: Polinizacion) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  }, []);

  const handleEdit = useCallback((item: Polinizacion) => {
    setSelectedItem(item);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (item: Polinizacion, onSuccess?: () => void) => {
    try {
      const itemId = item.numero || item.id;
      if (!itemId) {
        throw new Error('No se pudo obtener el ID de la polinización');
      }

      await polinizacionService.delete(itemId);
      await fetchPolinizaciones(currentPage, searchText);
      onSuccess?.();
    } catch (error) {
      logger.error('Error al eliminar polinización:', error);
      throw error;
    }
  }, [currentPage, searchText, fetchPolinizaciones]);

  const handleOpenChangeStatus = useCallback((item: Polinizacion) => {
    setItemToChangeStatus(item);
    setShowChangeStatusModal(true);
  }, []);

  const handleOpenFinalizar = useCallback((item: Polinizacion) => {
    setItemToFinalizar(item);
    setShowFinalizarModal(true);
  }, []);

  const handleChangeStatus = useCallback(async (
    itemId: number,
    newStatus: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO',
    fechaMaduracion?: string,
    onSuccess?: () => void
  ) => {
    try {
      await polinizacionService.cambiarEstadoPolinizacion(itemId, newStatus, fechaMaduracion);
      await fetchPolinizaciones(currentPage, searchText);
      onSuccess?.();
    } catch (error) {
      logger.error('Error al cambiar estado:', error);
      throw error;
    }
  }, [currentPage, searchText, fetchPolinizaciones]);

  const clearSearch = useCallback(() => {
    setSearchText('');
    setCurrentPage(1);
    fetchPolinizaciones(1, '');
  }, [fetchPolinizaciones]);

  return {
    // Estados
    polinizaciones,
    loading,
    searchText,
    currentPage,
    totalPages,
    totalCount,
    showDetailsModal,
    showEditModal,
    selectedItem,
    showChangeStatusModal,
    itemToChangeStatus,
    showFinalizarModal,
    itemToFinalizar,

    // Setters
    setSearchText,
    setShowDetailsModal,
    setShowEditModal,
    setShowChangeStatusModal,
    setShowFinalizarModal,

    // Funciones
    fetchPolinizaciones,
    handleSearch,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handleView,
    handleEdit,
    handleDelete,
    handleOpenChangeStatus,
    handleOpenFinalizar,
    handleChangeStatus,
    clearSearch,
  };
}
