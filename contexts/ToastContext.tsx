import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  animation: Animated.Value;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const { colors: themeColors } = useTheme();
  const fadeAnim = useRef(toast.animation).current;
  const slideAnim = useRef(new Animated.Value(100)).current; // Cambiar para animar desde la derecha

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Programar animación de salida
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onRemove(toast.id);
      });
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, fadeAnim, slideAnim, onRemove]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10B981',
          icon: 'checkmark-circle' as const,
          borderColor: '#059669',
          textColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: themeColors.status.error,
          icon: 'close-circle' as const,
          borderColor: '#DC2626',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: themeColors.status.warning,
          icon: 'warning' as const,
          borderColor: '#D97706',
          textColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          backgroundColor: themeColors.status.info,
          icon: 'information-circle' as const,
          borderColor: '#2563EB',
          textColor: '#FFFFFF',
        };
    }
  };

  const toastStyle = getToastStyles(toast.type);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: toastStyle.backgroundColor,
          borderLeftColor: toastStyle.borderColor,
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.toastIconContainer}>
        <Ionicons
          name={toastStyle.icon}
          size={20}
          color="#FFFFFF"
          style={styles.toastIcon}
        />
      </View>
      <View style={styles.toastContent}>
        <Text 
          style={[
            styles.toastText, 
            { 
              color: '#FFFFFF',
              backgroundColor: 'transparent',
            }
          ]} 
          numberOfLines={3}
          allowFontScaling={false}
        >
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      animation: new Animated.Value(0),
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration = 5000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration = 5000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration = 4000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration = 4500) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <View style={styles.toastContainer}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 16,
    left: 'auto',
    alignItems: 'flex-end',
    zIndex: 9999,
    pointerEvents: 'box-none',
    maxWidth: 400,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 3,
    minWidth: 200,
    maxWidth: 300,
  },
  toastIconContainer: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastIcon: {
    // Icon styles handled by component
  },
  toastContent: {
    flex: 1,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
