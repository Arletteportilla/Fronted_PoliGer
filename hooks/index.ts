/**
 * Barrel export para hooks personalizados de la aplicación
 * Centraliza las exportaciones para facilitar las importaciones
 */

export { useConfirmation } from './useConfirmation';
export { useModalState } from './useModalState';
export { usePaginatedSearch } from './usePaginatedSearch';
export { useCRUDOperations } from './useCRUDOperations';

// Re-exportar tipos útiles
export type { PaginationState, PaginatedResult, FetcherParams, PaginationControls } from './usePaginatedSearch';
