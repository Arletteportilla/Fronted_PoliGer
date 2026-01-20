import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { notificacionesService } from '@/services/notificaciones.service';
import { Notification } from '@/types';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';

interface PersistentAlertContextType {
  alerts: Notification[];
  refreshAlerts: () => Promise<void>;
  dismissAlert: (id: string) => void;
  dismissAllAlerts: () => void;
  isLoading: boolean;
}

const PersistentAlertContext = createContext<PersistentAlertContextType | null>(null);

export const usePersistentAlerts = () => {
  const context = useContext(PersistentAlertContext);
  if (!context) {
    throw new Error('usePersistentAlerts must be used within PersistentAlertProvider');
  }
  return context;
};

export const PersistentAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const { token } = useAuth();
  const router = useRouter();

  const refreshAlerts = useCallback(async () => {
    if (!token) {
      setAlerts([]);
      return;
    }

    try {
      setIsLoading(true);
      const recordatorios = await notificacionesService.getRecordatorios5Dias();
      setAlerts(recordatorios);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAlerts([]);
      return;
    }

    refreshAlerts();
    const interval = setInterval(refreshAlerts, 15000);
    return () => clearInterval(interval);
  }, [token, refreshAlerts]);

  // Animate banner visibility
  useEffect(() => {
    const shouldShow = alerts.length > 0;
    Animated.spring(slideAnim, {
      toValue: shouldShow ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [alerts.length, slideAnim]);

  const dismissAlert = useCallback(async (id: string) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error dismissing alert:', error);
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  }, []);

  const dismissAllAlerts = useCallback(async () => {
    try {
      for (const alert of alerts) {
        await notificacionesService.marcarComoLeida(alert.id);
      }
      setAlerts([]);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error dismissing all alerts:', error);
      setAlerts([]);
    }
  }, [alerts]);

  // Navegar a notificaciones con filtro de alertas pendientes
  const handleAlertPress = useCallback(() => {
    router.push('/(tabs)/notificaciones' as any);
    setIsExpanded(false);
  }, [router]);

  const goToNotifications = useCallback(() => {
    router.push('/(tabs)/notificaciones' as any);
    setIsExpanded(false);
  }, [router]);

  const recentAlerts = alerts.slice(0, 3);

  return (
    <PersistentAlertContext.Provider value={{
      alerts,
      refreshAlerts,
      dismissAlert,
      dismissAllAlerts,
      isLoading
    }}>
      {children}

      {/* Mini banner en esquina inferior derecha */}
      {alerts.length > 0 && (
        <Animated.View
          style={[
            styles.miniBanner,
            {
              backgroundColor: colors.background.primary,
              borderColor: colors.border.default,
              opacity: slideAnim,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header compacto */}
          <TouchableOpacity
            style={styles.miniHeader}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.8}
          >
            <View style={styles.miniHeaderLeft}>
              <View style={styles.miniIconBadge}>
                <Ionicons name="alarm" size={16} color="#fff" />
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{alerts.length}</Text>
                </View>
              </View>
              <Text style={[styles.miniTitle, { color: colors.text.primary }]}>
                Recordatorios
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-down" : "chevron-up"}
              size={18}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Lista expandible */}
          {isExpanded && (
            <Animated.View style={styles.expandedContent}>
              {recentAlerts.map((alert, index) => {
                const isGerminacion = alert.detalles?.germinacion_id;
                const codigo = alert.detalles?.codigo || '';

                return (
                  <TouchableOpacity
                    key={alert.id}
                    style={[
                      styles.miniAlertItem,
                      { borderBottomColor: colors.border.light },
                      index === recentAlerts.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={handleAlertPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.miniAlertContent}>
                      <Ionicons
                        name={isGerminacion ? "leaf" : "flower"}
                        size={14}
                        color={isGerminacion ? "#10B981" : "#3B82F6"}
                      />
                      <Text
                        style={[styles.miniAlertText, { color: colors.text.primary }]}
                        numberOfLines={1}
                      >
                        {codigo || (isGerminacion ? 'Germinacion' : 'Polinizacion')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => dismissAlert(alert.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={16} color={colors.text.tertiary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}

              {/* Footer con acciones */}
              <View style={styles.miniFooter}>
                {alerts.length > 3 && (
                  <TouchableOpacity onPress={goToNotifications}>
                    <Text style={[styles.viewAllText, { color: colors.primary.main }]}>
                      +{alerts.length - 3} mas
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={dismissAllAlerts}>
                  <Text style={styles.dismissAllMiniText}>Limpiar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </PersistentAlertContext.Provider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  miniBanner: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: Math.min(280, width - 32),
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9998,
    overflow: 'hidden',
  },
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  miniHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  miniAlertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  miniAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  miniAlertText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  miniFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dismissAllMiniText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#EF4444',
  },
});
