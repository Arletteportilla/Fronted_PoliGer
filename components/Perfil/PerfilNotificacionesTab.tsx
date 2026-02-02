import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/services/notification.service';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';

// Eliminado constantes estáticas para usar useWindowDimensions


export interface PerfilNotificacionesTabProps {
  polinizaciones?: any[];
  germinaciones?: any[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onViewPolinizacion?: (item: any) => void;
  onEditPolinizacion?: (item: any) => void;
  onDeletePolinizacion?: (item: any) => void;
  onChangeStatusGerminacion?: (item: any) => void;
  onViewGerminacion?: (item: any) => void;
  onEditGerminacion?: (item: any) => void;
  onDeleteGerminacion?: (item: any) => void;
  onChangeStatusPolinizacion?: (item: any) => void;
}

export function PerfilNotificacionesTab({
  onChangeStatusGerminacion,
  onChangeStatusPolinizacion,
  // Remaining props can be destructured if needed, or left in props
}: PerfilNotificacionesTabProps) {
  const { colors: themeColors } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const isVerySmallScreen = width < 400;

  const {
    notifications,
    loading,
    refreshing,
    stats,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationTypeLabel,
    getNotificationIcon,
    getNotificationColor,
  } = useNotifications();

  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [includeArchived] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'pendientes' | 'finalizado'>('todos');
  const [tipoFilter, setTipoFilter] = useState<'todas' | 'polinizaciones' | 'germinaciones' | 'sistema'>('todas');

  // Estados sincronizados desde el backend para filtrar correctamente
  const [syncedStates, setSyncedStates] = useState<Record<number, string>>({});

  const reloadNotifications = async () => {
    await fetchNotifications({
      solo_propias: true,
      solo_no_leidas: showOnlyUnread,
      incluir_archivadas: includeArchived
    });
  };

  const handleChangeStatusGerminacion = async (notificationData: any) => {
    if (onChangeStatusGerminacion) {
      const { germinacionService } = await import('@/services/germinacion.service');
      try {
        const germinacionActual = await germinacionService.getById(notificationData.id);
        await onChangeStatusGerminacion(germinacionActual);
        await reloadNotifications();
      } catch (error) {
        console.error('Error obteniendo germinación actual:', error);
        await onChangeStatusGerminacion(notificationData);
        await reloadNotifications();
      }
    }
  };

  const handleChangeStatusPolinizacion = async (notificationData: any) => {
    if (onChangeStatusPolinizacion) {
      const { polinizacionService } = await import('@/services/polinizacion.service');
      try {
        const polinizacionActual = await polinizacionService.getById(notificationData.numero);
        await onChangeStatusPolinizacion(polinizacionActual);
        await reloadNotifications();
      } catch (error) {
        console.error('Error obteniendo polinización actual:', error);
        await onChangeStatusPolinizacion(notificationData);
        await reloadNotifications();
      }
    }
  };

  useEffect(() => {
    fetchNotifications({
      solo_propias: true,
      solo_no_leidas: showOnlyUnread,
      incluir_archivadas: includeArchived
    });
  }, []);

  // Cargar estados sincronizados desde el backend para filtrar correctamente
  useEffect(() => {
    const cargarEstadosSincronizados = async () => {
      if (notifications.length === 0) return;

      const estados: Record<number, string> = {};

      try {
        const { germinacionService } = await import('@/services/germinacion.service');
        const { polinizacionService } = await import('@/services/polinizacion.service');

        await Promise.all(
          notifications.map(async (notification) => {
            try {
              if (notification.germinacion) {
                const germinacion = await germinacionService.getById(notification.germinacion);
                if (germinacion?.estado_germinacion) {
                  estados[notification.id] = germinacion.estado_germinacion;
                }
              } else if (notification.polinizacion) {
                const polinizacion = await polinizacionService.getById(notification.polinizacion);
                if (polinizacion?.estado_polinizacion) {
                  estados[notification.id] = polinizacion.estado_polinizacion;
                }
              }
            } catch (error) {
              // Si falla, usar el estado almacenado
              const estadoAlmacenado = notification.detalles_adicionales?.estado;
              if (estadoAlmacenado) {
                estados[notification.id] = estadoAlmacenado;
              }
            }
          })
        );

        setSyncedStates(estados);
      } catch (error) {
        console.error('Error cargando estados sincronizados:', error);
      }
    };

    cargarEstadosSincronizados();
  }, [notifications]);

  const handleRefresh = async () => {
    await refreshNotifications({
      solo_no_leidas: showOnlyUnread,
      incluir_archivadas: includeArchived,
      solo_propias: true
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      Alert.alert('Éxito', `${result.count} notificaciones marcadas como leídas`);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron marcar las notificaciones como leídas');
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.leida) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Error marcando como leída:', error);
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.leida) return false;

    // Filtrar por tipo de notificación
    if (tipoFilter !== 'todas') {
      if (tipoFilter === 'polinizaciones') {
        if (!notification.polinizacion) return false;
      } else if (tipoFilter === 'germinaciones') {
        if (!notification.germinacion) return false;
      } else if (tipoFilter === 'sistema') {
        // Sistema = notificaciones que no son de polinizaciones ni germinaciones
        if (notification.polinizacion || notification.germinacion) return false;
      }
    }

    // Filtrar por estado usando el estado sincronizado desde el backend
    if (estadoFilter !== 'todos') {
      // Usar primero el estado sincronizado, luego el almacenado como fallback
      const estado = syncedStates[notification.id] || notification.detalles_adicionales?.estado;
      if (estadoFilter === 'pendientes') {
        // Pendientes = INICIAL, EN_PROCESO_TEMPRANO, EN_PROCESO_AVANZADO
        if (estado === 'FINALIZADO') return false;
      } else if (estadoFilter === 'finalizado') {
        // Solo FINALIZADO
        if (estado !== 'FINALIZADO') return false;
      }
    }

    return true;
  });

  const styles = useMemo(() => createLocalStyles(themeColors, isSmallScreen, isVerySmallScreen), [themeColors, isSmallScreen, isVerySmallScreen]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Principal */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle} numberOfLines={isVerySmallScreen ? 1 : 2}>
            {isVerySmallScreen ? 'Notificaciones' : 'Mis Notificaciones'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {stats.total} total{isSmallScreen ? '' : ' notificaciones'} · <Text style={styles.unreadCount}>{stats.noLeidas} sin leer</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          {!isVerySmallScreen && (
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={22} color={themeColors.text.secondary} />
            </TouchableOpacity>
          )}
          {stats.noLeidas > 0 && (
            <TouchableOpacity style={styles.markAllReadButton} onPress={handleMarkAllAsRead}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              {!isSmallScreen && <Text style={styles.markAllReadText}>Marcar todas leídas</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros por tipo */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, tipoFilter === 'todas' && styles.filterChipActive]}
            onPress={() => setTipoFilter('todas')}
          >
            <Ionicons
              name="apps-outline"
              size={14}
              color={tipoFilter === 'todas' ? themeColors.accent.secondary : themeColors.text.secondary}
            />
            <Text style={[styles.filterChipText, tipoFilter === 'todas' && styles.filterChipTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, tipoFilter === 'polinizaciones' && styles.filterChipActivePolinizacion]}
            onPress={() => setTipoFilter(tipoFilter === 'polinizaciones' ? 'todas' : 'polinizaciones')}
          >
            <Ionicons
              name="flower-outline"
              size={14}
              color={tipoFilter === 'polinizaciones' ? "#ec4899" : themeColors.text.secondary}
            />
            <Text style={[styles.filterChipText, tipoFilter === 'polinizaciones' && styles.filterChipTextActivePolinizacion]}>
              Polinizaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, tipoFilter === 'germinaciones' && styles.filterChipActiveGerminacion]}
            onPress={() => setTipoFilter(tipoFilter === 'germinaciones' ? 'todas' : 'germinaciones')}
          >
            <Ionicons
              name="leaf-outline"
              size={14}
              color={tipoFilter === 'germinaciones' ? "#22c55e" : themeColors.text.secondary}
            />
            <Text style={[styles.filterChipText, tipoFilter === 'germinaciones' && styles.filterChipTextActiveGerminacion]}>
              Germinaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, tipoFilter === 'sistema' && styles.filterChipActiveSistema]}
            onPress={() => setTipoFilter(tipoFilter === 'sistema' ? 'todas' : 'sistema')}
          >
            <Ionicons
              name="settings-outline"
              size={14}
              color={tipoFilter === 'sistema' ? "#6366f1" : themeColors.text.secondary}
            />
            <Text style={[styles.filterChipText, tipoFilter === 'sistema' && styles.filterChipTextActiveSistema]}>
              Sistema
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[styles.filterChip, showOnlyUnread && styles.filterChipActive]}
            onPress={() => {
              setShowOnlyUnread(!showOnlyUnread);
              refreshNotifications({
                solo_no_leidas: !showOnlyUnread,
                incluir_archivadas: includeArchived,
                solo_propias: true
              });
            }}
          >
            <Ionicons
              name="funnel-outline"
              size={14}
              color={showOnlyUnread ? themeColors.accent.secondary : themeColors.text.secondary}
            />
            <Text style={[styles.filterChipText, showOnlyUnread && styles.filterChipTextActive]}>
              {isVerySmallScreen ? 'No leídas' : 'Solo no leídas'}
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[
              styles.filterChip,
              estadoFilter === 'pendientes' && styles.filterChipActivePendiente
            ]}
            onPress={() => setEstadoFilter(estadoFilter === 'pendientes' ? 'todos' : 'pendientes')}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={estadoFilter === 'pendientes' ? "#f59e0b" : themeColors.text.secondary}
            />
            <Text style={[
              styles.filterChipText,
              estadoFilter === 'pendientes' && styles.filterChipTextActivePendiente
            ]}>
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              estadoFilter === 'finalizado' && styles.filterChipActiveFinalizado
            ]}
            onPress={() => setEstadoFilter(estadoFilter === 'finalizado' ? 'todos' : 'finalizado')}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={estadoFilter === 'finalizado' ? "#10b981" : themeColors.text.secondary}
            />
            <Text style={[
              styles.filterChipText,
              estadoFilter === 'finalizado' && styles.filterChipTextActiveFinalizado
            ]}>
              Finalizados
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de Notificaciones */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={themeColors.text.disabled} />
          <Text style={styles.emptyTitle}>
            {showOnlyUnread ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {showOnlyUnread
              ? 'Todas las notificaciones han sido leídas'
              : 'Las notificaciones aparecerán aquí cuando se generen'
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[themeColors.primary.main]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
              onChangeStatusGerminacion={handleChangeStatusGerminacion}
              onChangeStatusPolinizacion={handleChangeStatusPolinizacion}
              getNotificationTypeLabel={getNotificationTypeLabel}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// Componente NotificationCard rediseñado
interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onChangeStatusGerminacion?: (item: any) => void;
  onChangeStatusPolinizacion?: (item: any) => void;
  getNotificationTypeLabel: (tipo: string) => string;
  getNotificationIcon: (tipo: string) => string;
  getNotificationColor: (tipo: string) => string;
}

function NotificationCard({
  notification,
  onPress,
  onChangeStatusGerminacion,
  onChangeStatusPolinizacion,
  getNotificationTypeLabel,
  getNotificationIcon,
  getNotificationColor,
}: NotificationCardProps) {
  const { colors: themeColors } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const isVerySmallScreen = width < 400;
  const styles = useMemo(() => createLocalStyles(themeColors, isSmallScreen, isVerySmallScreen), [themeColors, isSmallScreen, isVerySmallScreen]);

  // Estado actual sincronizado desde el backend
  const [estadoActual, setEstadoActual] = useState<string | null>(
    notification.detalles_adicionales?.estado || null
  );
  const [fechaMaduracion, setFechaMaduracion] = useState<string | null>(null);

  // Cargar estado actual de la germinación/polinización
  useEffect(() => {
    const cargarEstadoActual = async () => {
      try {
        if (notification.germinacion) {
          const { germinacionService } = await import('@/services/germinacion.service');
          const germinacion = await germinacionService.getById(notification.germinacion);
          if (germinacion?.estado_germinacion) {
            setEstadoActual(germinacion.estado_germinacion);
          }
          // Obtener fecha de maduración/germinación
          if (germinacion?.fecha_germinacion) {
            setFechaMaduracion(germinacion.fecha_germinacion);
          }
        } else if (notification.polinizacion) {
          const { polinizacionService } = await import('@/services/polinizacion.service');
          const polinizacion = await polinizacionService.getById(notification.polinizacion);
          if (polinizacion?.estado_polinizacion) {
            setEstadoActual(polinizacion.estado_polinizacion);
          }
          // Obtener fecha de maduración
          if (polinizacion?.fechamad) {
            setFechaMaduracion(polinizacion.fechamad);
          }
        }
      } catch (error) {
        console.error('Error cargando estado actual:', error);
      }
    };

    cargarEstadoActual();
  }, [notification.germinacion, notification.polinizacion]);

  const iconName = getNotificationIcon(notification.tipo);
  const color = getNotificationColor(notification.tipo);
  const typeLabel = getNotificationTypeLabel(notification.tipo);

  // Usar el estado actual sincronizado
  const estado = estadoActual ||
    notification.detalles_adicionales?.estado ||
    notification.detalles_adicionales?.estado_germinacion ||
    notification.detalles_adicionales?.estado_polinizacion ||
    (notification.germinacion ? 'INICIAL' : null) ||
    (notification.polinizacion ? 'INICIAL' : null);

  // Verificar si está finalizado
  const estaFinalizado = estado === 'FINALIZADO';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Determinar tipo de notificación para mostrar categoría
  const getCategoryInfo = () => {
    if ((notification.tipo as string) === 'ESTADO_GERMINACION_ACTUALIZADO' || (notification.tipo as string) === 'ESTADO_POLINIZACION_ACTUALIZADO') {
      return { label: 'ESTADO ACTUALIZADO', color: '#10b981', bgColor: '#d1fae5' };
    } else if ((notification.tipo as string) === 'REVISION_GERMINACION' || (notification.tipo as string) === 'REVISION_POLINIZACION') {
      return { label: 'ACTUALIZACIÓN GENERAL', color: '#f59e0b', bgColor: '#fef3c7' };
    } else if ((notification.tipo as string) === 'ALERTA_IMPORTADA') {
      return { label: 'HISTORIAL', color: '#6366f1', bgColor: '#e0e7ff' };
    }
    return { label: typeLabel.toUpperCase(), color: color, bgColor: `${color}20` };
  };

  const categoryInfo = getCategoryInfo();
  const codigo = notification.germinacion_codigo || notification.polinizacion_codigo || '';
  const ubicacion = notification.detalles_adicionales?.ubicacion || notification.detalles_adicionales?.sector || '';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Indicador lateral de no leída */}
      {!notification.leida && <View style={styles.cardUnreadIndicator} />}

      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.cardIcon, { backgroundColor: categoryInfo.bgColor }]}>
            <Ionicons name={iconName as any} size={18} color={categoryInfo.color} />
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.bgColor }]}>
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.label}
            </Text>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          {!notification.leida && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NUEVO</Text>
            </View>
          )}
          <Text style={styles.cardTime}>{formatDate(notification.fecha_creacion)}</Text>
        </View>
      </View>

      {/* Título principal */}
      <Text style={[styles.cardTitle, !notification.leida && styles.cardTitleUnread]}>
        {notification.titulo}
      </Text>

      {/* Descripción */}
      <Text style={styles.cardDescription} numberOfLines={2}>
        {notification.mensaje}
      </Text>

      {/* Barra de progreso */}
      {estado && (
        <View style={styles.progressContainer}>
          <EstadoProgressBar
            estadoActual={estado as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
            tipo={notification.germinacion ? 'germinacion' : 'polinizacion'}
          />
        </View>
      )}

      {/* Info de ID y ubicación */}
      <View style={styles.cardInfoRow}>
        {codigo && (
          <View style={styles.cardInfoItem}>
            <Ionicons name="barcode-outline" size={14} color={themeColors.text.tertiary} />
            <Text style={styles.cardInfoText}>ID: {codigo}</Text>
          </View>
        )}
        {ubicacion && (
          <View style={styles.cardInfoItem}>
            <Ionicons name="location-outline" size={14} color={themeColors.text.tertiary} />
            <Text style={styles.cardInfoText}>{ubicacion}</Text>
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.cardActions}>
        {notification.germinacion && (
          <>
            {onChangeStatusGerminacion && !estaFinalizado && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onChangeStatusGerminacion({ id: notification.germinacion })}
              >
                <Text style={styles.actionButtonText}>Cambiar Estado</Text>
              </TouchableOpacity>
            )}
            {estaFinalizado && (
              <View style={styles.finalizadoContainer}>
                <View style={styles.finalizadoBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.finalizadoText}>Finalizado</Text>
                </View>
                {fechaMaduracion && (
                  <View style={styles.fechaMaduracionBadge}>
                    <Ionicons name="calendar" size={12} color="#6366f1" />
                    <Text style={styles.fechaMaduracionText}>
                      {new Date(fechaMaduracion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
        {notification.polinizacion && (
          <>
            {onChangeStatusPolinizacion && !estaFinalizado && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onChangeStatusPolinizacion({ numero: notification.polinizacion })}
              >
                <Text style={styles.actionButtonText}>Cambiar Estado</Text>
              </TouchableOpacity>
            )}
            {estaFinalizado && (
              <View style={styles.finalizadoContainer}>
                <View style={styles.finalizadoBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.finalizadoText}>Finalizado</Text>
                </View>
                {fechaMaduracion && (
                  <View style={styles.fechaMaduracionBadge}>
                    <Ionicons name="calendar" size={12} color="#6366f1" />
                    <Text style={styles.fechaMaduracionText}>
                      {new Date(fechaMaduracion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
        {!notification.germinacion && !notification.polinizacion && (
          <TouchableOpacity style={styles.actionLink}>
            <Text style={styles.actionLinkText}>Ver Detalles</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* REF al final */}
      {codigo && (
        <View style={styles.cardRef}>
          <Text style={styles.cardRefLabel}>REF:</Text>
          <Text style={styles.cardRefValue}>{codigo}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createLocalStyles = (colors: any, isSmallScreen: boolean, isVerySmallScreen: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.tertiary,
  },

  // Header
  header: {
    flexDirection: isVerySmallScreen ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isVerySmallScreen ? 'stretch' : 'flex-start',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 12 : 20,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: isVerySmallScreen ? 12 : 0,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0, // Permite que el texto se trunce
  },
  headerTitle: {
    fontSize: isVerySmallScreen ? 18 : isSmallScreen ? 20 : 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 12 : 14,
    color: colors.text.secondary,
    flexShrink: 1,
  },
  unreadCount: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 8 : 12,
    flexShrink: 0,
  },
  settingsButton: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 4 : 6,
    paddingHorizontal: isSmallScreen ? 10 : 16,
    paddingVertical: isSmallScreen ? 8 : 10,
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    minWidth: isVerySmallScreen ? 36 : 'auto',
  },
  markAllReadText: {
    color: colors.background.primary,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
  },

  // Filtros
  filtersContainer: {
    paddingHorizontal: isSmallScreen ? 8 : 20,
    paddingVertical: isSmallScreen ? 12 : 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  filtersScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 8 : 10,
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 4 : 6,
    paddingHorizontal: isSmallScreen ? 10 : 14,
    paddingVertical: isSmallScreen ? 6 : 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.accent.secondary + '20',
    borderColor: colors.accent.secondary,
  },
  filterChipText: {
    fontSize: isSmallScreen ? 11 : 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.accent.secondary,
  },
  filterChipActivePendiente: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  filterChipTextActivePendiente: {
    color: '#f59e0b',
  },
  filterChipActiveFinalizado: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  filterChipTextActiveFinalizado: {
    color: '#10b981',
  },
  filterChipActivePolinizacion: {
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
  },
  filterChipTextActivePolinizacion: {
    color: '#ec4899',
  },
  filterChipActiveGerminacion: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  filterChipTextActiveGerminacion: {
    color: '#22c55e',
  },
  filterChipActiveSistema: {
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
  },
  filterChipTextActiveSistema: {
    color: '#6366f1',
  },
  filterDivider: {
    width: 1,
    height: isSmallScreen ? 20 : 24,
    backgroundColor: colors.border.default,
    alignSelf: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isSmallScreen ? 12 : 20,
    gap: isSmallScreen ? 12 : 16,
  },

  // Card
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: isSmallScreen ? 12 : 16,
    padding: isSmallScreen ? 16 : 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.default,
    position: 'relative',
    overflow: 'hidden',
  },
  cardUnreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accent.secondary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardHeader: {
    flexDirection: isVerySmallScreen ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isVerySmallScreen ? 'flex-start' : 'center',
    marginBottom: isSmallScreen ? 8 : 12,
    gap: isVerySmallScreen ? 8 : 0,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 8 : 10,
    flex: 1,
    minWidth: 0,
  },
  cardIcon: {
    width: isSmallScreen ? 32 : 36,
    height: isSmallScreen ? 32 : 36,
    borderRadius: isSmallScreen ? 8 : 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  categoryBadge: {
    paddingHorizontal: isSmallScreen ? 8 : 10,
    paddingVertical: isSmallScreen ? 3 : 4,
    borderRadius: 6,
    flexShrink: 1,
  },
  categoryText: {
    fontSize: isSmallScreen ? 9 : 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeaderRight: {
    flexDirection: isVerySmallScreen ? 'column' : 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 4 : 8,
    flexShrink: 0,
  },
  newBadge: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newBadgeText: {
    color: colors.background.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTime: {
    fontSize: isSmallScreen ? 10 : 12,
    color: colors.text.tertiary,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 15 : 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: isSmallScreen ? 4 : 6,
    lineHeight: isSmallScreen ? 20 : 24,
  },
  cardTitleUnread: {
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: isSmallScreen ? 13 : 14,
    color: colors.text.secondary,
    lineHeight: isSmallScreen ? 18 : 20,
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardInfoText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  actionLink: {
    paddingVertical: 6,
  },
  actionLinkText: {
    fontSize: 13,
    color: colors.accent.secondary,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.background.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  cardRef: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cardRefLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  cardRefValue: {
    fontSize: 11,
    color: colors.accent.secondary,
    fontWeight: '500',
  },
  finalizadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  finalizadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
  },
  finalizadoText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  fechaMaduracionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.accent.secondary + '20',
    borderRadius: 6,
  },
  fechaMaduracionText: {
    fontSize: 12,
    color: colors.accent.secondary,
    fontWeight: '500',
  },
});
