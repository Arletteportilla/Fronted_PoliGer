import { Platform, Alert } from 'react-native';
import { useConfirmationContext } from '@/contexts/ConfirmationContext';

/**
 * Hook para manejar confirmaciones de usuario multiplataforma.
 * - Web: usa el modal personalizado del sistema (ConfirmationContext)
 * - Mobile: usa Alert.alert nativo de React Native
 */
export const useConfirmation = () => {
  const { showConfirmation: showModal } = useConfirmationContext();

  const showConfirmation = async (
    title: string,
    message: string,
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar',
    variant: 'danger' | 'warning' | 'info' | 'download' = 'danger'
  ): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return showModal({ title, message, confirmText, cancelText, variant });
    } else {
      return new Promise((resolve) => {
        Alert.alert(
          title,
          message,
          [
            { text: cancelText, onPress: () => resolve(false), style: 'cancel' },
            { text: confirmText, onPress: () => resolve(true), style: 'destructive' },
          ],
          { cancelable: false }
        );
      });
    }
  };

  return { showConfirmation };
};
