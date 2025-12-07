import { Platform, Alert } from 'react-native';

/**
 * Hook para manejar confirmaciones de usuario multiplataforma
 * Usa confirm() en web y Alert.alert() en mobile
 */
export const useConfirmation = () => {
  /**
   * Muestra un diálogo de confirmación
   * @param title - Título del diálogo
   * @param message - Mensaje del diálogo
   * @param confirmText - Texto del botón de confirmación (default: 'Aceptar')
   * @param cancelText - Texto del botón de cancelación (default: 'Cancelar')
   * @returns Promise<boolean> - true si el usuario confirma, false si cancela
   */
  const showConfirmation = async (
    title: string,
    message: string,
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> => {
    if (Platform.OS === 'web') {
      // En web usamos el confirm nativo del navegador
      return confirm(`${title}\n\n${message}`);
    } else {
      // En mobile usamos Alert.alert de React Native
      return new Promise((resolve) => {
        Alert.alert(
          title,
          message,
          [
            {
              text: cancelText,
              onPress: () => resolve(false),
              style: 'cancel'
            },
            {
              text: confirmText,
              onPress: () => resolve(true),
              style: 'destructive'
            }
          ],
          { cancelable: false }
        );
      });
    }
  };

  return { showConfirmation };
};
