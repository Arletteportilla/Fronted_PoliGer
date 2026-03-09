import { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** 'danger' muestra botón rojo, 'warning' amarillo, 'info' azul oscuro, 'download' verde */
  variant?: 'danger' | 'warning' | 'info' | 'download';
}

interface ConfirmationContextType {
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

export const ConfirmationProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions>({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger',
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showConfirmation = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOptions({
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        variant: 'danger',
        ...opts,
      });
      setVisible(true);
      // Animate in
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [scaleAnim, opacityAnim]);

  const handleResponse = useCallback((result: boolean) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      resolveRef.current?.(result);
      resolveRef.current = null;
    });
  }, [scaleAnim, opacityAnim]);

  // Colores del botón de confirmación según variante (desde colors.ts)
  const variant = options.variant ?? 'danger';
  const vc = colors.confirmationVariants[variant];

  const styles = createStyles(colors);

  return (
    <ConfirmationContext.Provider value={{ showConfirmation }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => handleResponse(false)}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.card,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            {/* Icono */}
            <View style={[styles.iconContainer, { backgroundColor: vc.iconBg }]}>
              <Ionicons name={vc.icon} size={32} color={vc.iconColor} />
            </View>

            {/* Título */}
            <Text style={styles.title}>{options.title}</Text>

            {/* Mensaje */}
            <Text style={styles.message}>{options.message}</Text>

            {/* Botones */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleResponse(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelText}>{options.cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: vc.bg }]}
                onPress={() => handleResponse(true)}
                activeOpacity={0.8}
              >
                <Ionicons name={vc.icon} size={16} color="#fff" style={styles.confirmIcon} />
                <Text style={styles.confirmText}>{options.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ConfirmationContext.Provider>
  );
};

export const useConfirmationContext = () => {
  const ctx = useContext(ConfirmationContext);
  if (!ctx) throw new Error('useConfirmationContext must be used within ConfirmationProvider');
  return ctx;
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.background.modal,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.background.primary,
      borderRadius: 20,
      paddingHorizontal: 28,
      paddingTop: 32,
      paddingBottom: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: 0.2,
    },
    message: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 28,
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    cancelBtn: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border.default,
      backgroundColor: colors.background.secondary,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    confirmBtn: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    confirmIcon: {
      marginRight: 6,
    },
    confirmText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },
  });
