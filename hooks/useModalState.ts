import { useState } from 'react';

/**
 * Estado del modal
 */
interface ModalState<T> {
  visible: boolean;
  selectedItem: T | null;
}

/**
 * Controles del modal
 */
interface ModalControls<T> {
  open: (item?: T | null) => void;
  close: () => void;
  setVisible: (visible: boolean) => void;
  setSelectedItem: (item: T | null) => void;
}

/**
 * Hook para manejar el estado de modales con ítem seleccionado
 *
 * Centraliza el patrón repetitivo de:
 * - Estado de visibilidad del modal
 * - Estado del ítem seleccionado
 * - Funciones open/close que manejan ambos estados
 *
 * @param initialItem - Ítem inicial seleccionado (opcional)
 * @returns [state, controls] - Estado y controles del modal
 *
 * @example
 * ```tsx
 * const [modalState, modalControls] = useModalState<Polinizacion>();
 *
 * // Abrir modal con un ítem
 * modalControls.open(polinizacion);
 *
 * // Cerrar modal (limpia el ítem seleccionado)
 * modalControls.close();
 *
 * // Usar en el componente
 * <Modal visible={modalState.visible}>
 *   {modalState.selectedItem && (
 *     <View>
 *       <Text>{modalState.selectedItem.codigo}</Text>
 *     </View>
 *   )}
 * </Modal>
 * ```
 */
export const useModalState = <T = any>(
  initialItem: T | null = null
): [ModalState<T>, ModalControls<T>] => {
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(initialItem);

  const open = (item?: T | null) => {
    if (item !== undefined) {
      setSelectedItem(item);
    }
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    setSelectedItem(null);
  };

  return [
    { visible, selectedItem },
    {
      open,
      close,
      setVisible,
      setSelectedItem,
    }
  ];
};
