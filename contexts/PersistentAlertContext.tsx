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
import { RecordatoriosModal } from '@/components/modals/RecordatoriosModal';
import { CambiarEstadoModal } from '@/components/modals/CambiarEstadoModal';
import { FinalizarModal } from '@/components/modals/FinalizarModal';

interface PersistentAlertContextType {
  alerts: Notification[];
  refreshAlerts: () => Promise<void>;
  dismissAlert: (id: string) => void;
  dismissAllAlerts: () => void;
  isLoading: boolean;
  openModal: () => void;
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
  const [modalVisible, setModalVisible] = useState(false);

  interface CambioEstadoItem {
    codigo?: string | null;
    especie_variedad?: string | null;
    nueva_especie?: string | null;
    genero?: string | null;
    estado_germinacion?: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO';
    estado_polinizacion?: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO';
    // Campos para FinalizarModal (date picker)
    fecha_siembra?: string;
    fechapol?: string;
    prediccion_fecha_estimada?: string;
    fecha_maduracion_predicha?: string;
    fecha_germinacion_estimada?: string;
  }
  interface CambioEstadoState {
    item: CambioEstadoItem;
    tipo: 'germinacion' | 'polinizacion';
    alertId: string;
    itemId: number;
  }
  const [cambiarEstadoData, setCambiarEstadoData] = useState<CambioEstadoState | null>(null);
  const [finalizarData, setFinalizarData] = useState<CambioEstadoState | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  // Timestamp del último auto-open (0 = nunca). Permite re-abrir cada hora.
  const lastAutoOpenTime = useRef<number>(0);
  // Ref con el número actual de alertas para usarlo dentro de intervalos sin closures stale
  const alertsLengthRef = useRef<number>(0);
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

  // Mantener alertsLengthRef sincronizado para usarlo dentro de intervalos
  useEffect(() => {
    alertsLengthRef.current = alerts.length;
  }, [alerts]);

  // Auto-abrir el modal la primera vez que llegan recordatorios
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (alerts.length > 0 && lastAutoOpenTime.current === 0) {
      timer = setTimeout(() => {
        setModalVisible(true);
        lastAutoOpenTime.current = Date.now();
      }, 1200);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [alerts.length]);

  // Re-abrir el modal cada hora si siguen habiendo recordatorios sin atender
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      if (
        alertsLengthRef.current > 0 &&
        lastAutoOpenTime.current > 0 &&
        Date.now() - lastAutoOpenTime.current >= 3_600_000
      ) {
        setModalVisible(true);
        lastAutoOpenTime.current = Date.now();
      }
    }, 60_000); // Verificar cada minuto
    return () => clearInterval(interval);
  }, [token]);

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
    } catch (error) {
      console.error('Error dismissing all alerts:', error);
      setAlerts([]);
    }
  }, [alerts]);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleVerTodas = useCallback(() => {
    setModalVisible(false);
    router.push({ pathname: '/(tabs)/perfil', params: { tab: 'notificaciones' } } as any);
  }, [router]);

  const handleCambiarEstado = useCallback(async (alert: Notification) => {
    setModalVisible(false);
    const isGerminacion = !!(alert.germinacion_id || alert.detalles?.germinacion_id);
    const id = (alert.germinacion_id || alert.detalles?.germinacion_id
      || alert.polinizacion_id || alert.detalles?.polinizacion_id) as number | undefined;
    if (!id) return;

    try {
      if (isGerminacion) {
        const { germinacionService } = await import('@/services/germinacion.service');
        const g = await germinacionService.getById(id);
        setCambiarEstadoData({
          item: {
            codigo: g.codigo ?? null,
            especie_variedad: g.especie_variedad ?? null,
            genero: g.genero ?? null,
            estado_germinacion: g.estado_germinacion ?? 'INICIAL',
            fecha_siembra: (g as any).fecha_siembra ?? undefined,
            prediccion_fecha_estimada: (g as any).prediccion_fecha_estimada ?? (g as any).fecha_germinacion_estimada ?? undefined,
            fecha_germinacion_estimada: (g as any).fecha_germinacion_estimada ?? undefined,
          },
          tipo: 'germinacion',
          alertId: alert.id,
          itemId: id,
        });
      } else {
        const { polinizacionService } = await import('@/services/polinizacion.service');
        const p = await polinizacionService.getById(id);
        setCambiarEstadoData({
          item: {
            codigo: p.codigo ?? p.nueva_codigo ?? null,
            nueva_especie: p.nueva_especie ?? null,
            especie_variedad: p.especie_variedad ?? null,
            estado_polinizacion: p.estado_polinizacion ?? 'INICIAL',
            fechapol: (p as any).fechapol ?? undefined,
            fecha_maduracion_predicha: (p as any).fecha_maduracion_predicha ?? undefined,
            prediccion_fecha_estimada: (p as any).prediccion_fecha_estimada ?? undefined,
          },
          tipo: 'polinizacion',
          alertId: alert.id,
          itemId: id,
        });
      }
    } catch (error) {
      console.error('Error fetching item for estado change:', error);
    }
  }, []);

  const handleConfirmarCambioEstado = useCallback(async (
    estado: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'
  ) => {
    if (!cambiarEstadoData) return;

    // Interceptar FINALIZADO: mostrar date picker antes de guardar
    if (estado === 'FINALIZADO') {
      setFinalizarData(cambiarEstadoData);
      setCambiarEstadoData(null);
      return;
    }

    const { tipo, alertId, itemId } = cambiarEstadoData;
    setCambiarEstadoData(null);
    try {
      if (tipo === 'germinacion') {
        const { germinacionService } = await import('@/services/germinacion.service');
        await germinacionService.cambiarEstadoGerminacion(itemId, estado);
      } else {
        const { polinizacionService } = await import('@/services/polinizacion.service');
        await polinizacionService.cambiarEstadoPolinizacion(itemId, estado);
      }
    } catch (error) {
      console.error('Error saving estado:', error);
    } finally {
      // Siempre dismissar el alert y re-sincronizar con el backend,
      // independientemente de si el cambio de estado tuvo éxito o falló
      await dismissAlert(alertId);
      refreshAlerts();
    }
  }, [cambiarEstadoData, dismissAlert, refreshAlerts]);

  const handleCerrarCambioEstado = useCallback(() => {
    setCambiarEstadoData(null);
  }, []);

  const handleConfirmarFinalizar = useCallback(async (fecha: string) => {
    if (!finalizarData) return;
    const { tipo, alertId, itemId } = finalizarData;
    setFinalizarData(null);
    try {
      if (tipo === 'germinacion') {
        const { germinacionService } = await import('@/services/germinacion.service');
        await germinacionService.cambiarEstadoGerminacion(itemId, 'FINALIZADO', fecha);
      } else {
        const { polinizacionService } = await import('@/services/polinizacion.service');
        await polinizacionService.cambiarEstadoPolinizacion(itemId, 'FINALIZADO', fecha);
      }
    } catch (error) {
      console.error('Error finalizando:', error);
    } finally {
      await dismissAlert(alertId);
      refreshAlerts();
    }
  }, [finalizarData, dismissAlert, refreshAlerts]);

  const handleCerrarFinalizar = useCallback(() => {
    setFinalizarData(null);
  }, []);

  return (
    <PersistentAlertContext.Provider value={{
      alerts,
      refreshAlerts,
      dismissAlert,
      dismissAllAlerts,
      isLoading,
      openModal,
    }}>
      {children}

      <RecordatoriosModal
        visible={modalVisible}
        onClose={closeModal}
        alerts={alerts}
        onDismiss={dismissAlert}
        onDismissAll={dismissAllAlerts}
        onVerTodas={handleVerTodas}
        onCambiarEstado={handleCambiarEstado}
      />

      <CambiarEstadoModal
        visible={cambiarEstadoData !== null}
        onClose={handleCerrarCambioEstado}
        onCambiarEstado={handleConfirmarCambioEstado}
        item={cambiarEstadoData?.item ?? null}
        tipo={cambiarEstadoData?.tipo ?? 'germinacion'}
      />

      <FinalizarModal
        visible={finalizarData !== null}
        onClose={handleCerrarFinalizar}
        onConfirm={handleConfirmarFinalizar}
        item={finalizarData?.item ?? null}
        tipo={finalizarData?.tipo ?? 'germinacion'}
      />

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
            onPress={openModal}
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
            <Ionicons name="chevron-up" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
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
});
