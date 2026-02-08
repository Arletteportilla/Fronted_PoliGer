import { useState, useCallback } from 'react';
import { germinacionService } from '@/services/germinacion.service';
import type { Germinacion } from '@/types/index';
import { logger } from '@/services/logger';

export function usePerfilGerminaciones() {
  const [germinaciones, setGerminaciones] = useState<Germinacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Germinacion | null>(null);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [itemToChangeStatus, setItemToChangeStatus] = useState<Germinacion | null>(null);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [itemToFinalizar, setItemToFinalizar] = useState<Germinacion | null>(null);

  const fetchGerminaciones = useCallback(async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const response = await germinacionService.getMisGerminacionesPaginated({
        page,
        page_size: 10,
        search,
        dias_recientes: 0, // 0 = todas las germinaciones del usuario, no solo las recientes
        excluir_importadas: true // Excluir germinaciones importadas desde CSV/Excel
      });

      setGerminaciones(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      setTotalCount(response.count || 0);
    } catch (error) {
      logger.error('Error al cargar germinaciones:', error);
      setGerminaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    setCurrentPage(1);
    await fetchGerminaciones(1, searchText);
  }, [searchText, fetchGerminaciones]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchGerminaciones(page, searchText);
  }, [searchText, fetchGerminaciones]);

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

  const handleView = useCallback(async (item: Germinacion) => {
    try {
      const itemId = item.id;
      if (!itemId) throw new Error('ID no disponible');

      const detalles = await germinacionService.getById(itemId);
      setSelectedItem(detalles);
      setShowDetailsModal(true);
    } catch (error) {
      logger.error('Error al cargar detalles:', error);
      throw error;
    }
  }, []);

  const handleEdit = useCallback((item: Germinacion) => {
    setSelectedItem(item);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (item: Germinacion, onSuccess?: () => void) => {
    try {
      const itemId = item.id;
      if (!itemId) {
        throw new Error('No se pudo obtener el ID de la germinación');
      }

      await germinacionService.delete(itemId);
      await fetchGerminaciones(currentPage, searchText);
      onSuccess?.();
    } catch (error) {
      logger.error('Error al eliminar germinación:', error);
      throw error;
    }
  }, [currentPage, searchText, fetchGerminaciones]);

  const handleOpenChangeStatus = useCallback((item: Germinacion) => {
    setItemToChangeStatus(item);
    setShowChangeStatusModal(true);
  }, []);

  const handleOpenFinalizar = useCallback((item: Germinacion) => {
    setItemToFinalizar(item);
    setShowFinalizarModal(true);
  }, []);

  const handleChangeStatus = useCallback(async (
    itemId: number,
    newStatus: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO',
    fechaGerminacion?: string,
    onSuccess?: () => void
  ) => {
    try {
      await germinacionService.cambiarEstadoGerminacion(itemId, newStatus, fechaGerminacion);
      await fetchGerminaciones(currentPage, searchText);
      onSuccess?.();
    } catch (error) {
      logger.error('Error al cambiar estado:', error);
      throw error;
    }
  }, [currentPage, searchText, fetchGerminaciones]);

  const clearSearch = useCallback(() => {
    setSearchText('');
    setCurrentPage(1);
    fetchGerminaciones(1, '');
  }, [fetchGerminaciones]);

  return {
    // Estados
    germinaciones,
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
    fetchGerminaciones,
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
