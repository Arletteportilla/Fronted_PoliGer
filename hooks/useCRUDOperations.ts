import { useState } from 'react';
import { useConfirmation } from './useConfirmation';
import { useToast } from '@/contexts/ToastContext';
import { logger } from '@/services/logger';

/**
 * Servicio genérico para operaciones CRUD
 */
export interface CRUDService<T> {
  delete: (id: number) => Promise<void>;
  update?: (id: number, data: Partial<T>) => Promise<T>;
  create?: (data: Partial<T>) => Promise<T>;
}

/**
 * Configuración para operaciones CRUD
 */
export interface CRUDConfig {
  entityName: string;
  entityNamePlural?: string;
  idField?: string;
  codigoField?: string;
}

/**
 * Hook para manejar operaciones CRUD genéricas
 *
 * Centraliza el patrón repetitivo de:
 * - Confirmación antes de eliminar
 * - Loading state durante operaciones
 * - Toast notifications de éxito/error
 * - Refresh de datos después de operaciones
 *
 * @param service - Servicio con métodos CRUD
 * @param config - Configuración del hook
 * @param onDataChange - Callback para refrescar datos
 * @returns { handleDelete, loading }
 *
 * @example
 * ```tsx
 * const { handleDelete, loading } = useCRUDOperations(
 *   polinizacionService,
 *   {
 *     entityName: 'polinización',
 *     entityNamePlural: 'polinizaciones',
 *     idField: 'numero',
 *     codigoField: 'codigo'
 *   },
 *   fetchData
 * );
 *
 * // Eliminar con confirmación
 * await handleDelete(polinizacion);
 * ```
 */
export const useCRUDOperations = <T extends Record<string, any>>(
  service: CRUDService<T>,
  config: CRUDConfig,
  onDataChange?: () => Promise<void>
) => {
  const { showConfirmation } = useConfirmation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    entityName,
    entityNamePlural = `${entityName}s`,
    idField = 'id',
    codigoField = 'codigo'
  } = config;

  /**
   * Elimina una entidad con confirmación
   */
  const handleDelete = async (item: T): Promise<boolean> => {
    // Obtener identificador legible del item
    const codigo = item[codigoField] || item['nombre'] || `este ${entityName}`;

    // Pedir confirmación
    const confirmed = await showConfirmation(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar ${codigo}?`,
      'Eliminar',
      'Cancelar'
    );

    if (!confirmed) {
      return false;
    }

    // Ejecutar eliminación
    try {
      setLoading(true);
      const id = item[idField];

      if (id === undefined || id === null) {
        throw new Error(`No se encontró el campo '${idField}' en el ítem`);
      }

      await service.delete(id);

      // Refrescar datos si se proporcionó callback
      if (onDataChange) {
        await onDataChange();
      }

      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} eliminada correctamente`);
      return true;

    } catch (error: any) {
      logger.error(`Error eliminando ${entityName}:`, error);
      const errorMessage = error.response?.data?.message
        || error.message
        || `No se pudo eliminar el ${entityName}`;

      toast.error(errorMessage);
      return false;

    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza una entidad
   */
  const handleUpdate = async (item: T, updates: Partial<T>): Promise<boolean> => {
    if (!service.update) {
      logger.error('El servicio no implementa el método update');
      return false;
    }

    try {
      setLoading(true);
      const id = item[idField];

      if (id === undefined || id === null) {
        throw new Error(`No se encontró el campo '${idField}' en el ítem`);
      }

      await service.update(id, updates);

      // Refrescar datos si se proporcionó callback
      if (onDataChange) {
        await onDataChange();
      }

      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} actualizada correctamente`);
      return true;

    } catch (error: any) {
      logger.error(`Error actualizando ${entityName}:`, error);
      const errorMessage = error.response?.data?.message
        || error.message
        || `No se pudo actualizar el ${entityName}`;

      toast.error(errorMessage);
      return false;

    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea una nueva entidad
   */
  const handleCreate = async (data: Partial<T>): Promise<T | null> => {
    if (!service.create) {
      logger.error('El servicio no implementa el método create');
      return null;
    }

    try {
      setLoading(true);
      const newItem = await service.create(data);

      // Refrescar datos si se proporcionó callback
      if (onDataChange) {
        await onDataChange();
      }

      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} creada correctamente`);
      return newItem;

    } catch (error: any) {
      logger.error(`Error creando ${entityName}:`, error);
      const errorMessage = error.response?.data?.message
        || error.message
        || `No se pudo crear el ${entityName}`;

      toast.error(errorMessage);
      return null;

    } finally {
      setLoading(false);
    }
  };

  return {
    handleDelete,
    handleUpdate,
    handleCreate,
    loading,
  };
};
