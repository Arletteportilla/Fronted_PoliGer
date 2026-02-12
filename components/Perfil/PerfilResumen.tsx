import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { createStyles } from '@/utils/Perfil/styles';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import type { EstadisticasUsuario, Polinizacion, Germinacion } from '@/types/index';
import type { Notification } from '@/services/notification.service';
import { getEstadoColor } from '@/utils/colorHelpers';
import { notificationService } from '@/services/notification.service';

interface PerfilResumenProps {
  estadisticas: EstadisticasUsuario;
  loading: boolean;
  polinizaciones?: Polinizacion[];
  germinaciones?: Germinacion[];
  onViewPolinizacion?: (polinizacion: Polinizacion) => void;
  onViewGerminacion?: (germinacion: Germinacion) => void;
  onViewAllPolinizaciones?: () => void;
  onViewAllGerminaciones?: () => void;
  onDownloadPolinizacionesPDF?: () => void;
  onDownloadGerminacionesPDF?: () => void;
  notifications?: Notification[];
  onViewAllNotifications?: () => void;
  canViewPolinizaciones?: boolean;
  canViewGerminaciones?: boolean;
}

export function PerfilResumen({
  estadisticas,
  loading,
  polinizaciones = [],
  germinaciones = [],
  onViewPolinizacion,
  onViewGerminacion,
  onViewAllPolinizaciones,
  onViewAllGerminaciones,
  onDownloadPolinizacionesPDF,
  onDownloadGerminacionesPDF,
  notifications = [],
  onViewAllNotifications,
  canViewPolinizaciones = true,
  canViewGerminaciones = true
}: PerfilResumenProps) {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  // Ordenar por fecha de creación (más recientes primero) y limitar a 5
  const polinizacionesRecientes = [...polinizaciones]
    .sort((a, b) => {
      const fechaA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
      const fechaB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
      return fechaB - fechaA;
    })
    .slice(0, 5);

  const germinacionesRecientes = [...germinaciones]
    .sort((a, b) => {
      const fechaA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
      const fechaB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
      return fechaB - fechaA;
    })
    .slice(0, 5);

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
    .slice(0, 3);



  const getDaysActive = (dateString?: string) => {
    if (!dateString) return 0;
    const diff = new Date().getTime() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Calcular polinizaciones en proceso (excluyendo completadas)
  const estadosCompletadosPol = ['COMPLETADA', 'FINALIZADA', 'MADURO', 'LISTO', 'FINALIZADO'];
  const polinizacionesCompletadas = (estadisticas as any).polinizaciones_completadas ??
    polinizaciones.filter(p =>
      estadosCompletadosPol.includes(p.estado as string)
    ).length;
  const polinizacionesEnProceso = estadisticas.total_polinizaciones - polinizacionesCompletadas;

  // Calcular germinaciones en proceso (excluyendo completadas)
  const estadosCompletadosGerm = ['FINALIZADO', 'LISTA', 'FINALIZADA'];
  const germinacionesCompletadas = (estadisticas as any).germinaciones_completadas ??
    germinaciones.filter(g =>
      estadosCompletadosGerm.includes(g.estado_germinacion as string)
    ).length;
  const germinacionesEnProceso = estadisticas.total_germinaciones - germinacionesCompletadas;

  // Calcular éxito promedio combinado (polinizaciones + germinaciones completadas vs total)
  const totalCompletadas = polinizacionesCompletadas + germinacionesCompletadas;
  const totalRegistros = estadisticas.total_polinizaciones + estadisticas.total_germinaciones;

  const exitoPromedio = totalRegistros > 0
    ? Math.round((totalCompletadas / totalRegistros) * 100)
    : 0;

  return (
    <ScrollView style={styles.resumenContainer} showsVerticalScrollIndicator={false}>
      {/* Tarjetas de Estadísticas */}
      <View style={styles.statsGrid}>
        {/* Tarjeta de Polinizaciones - Solo si tiene permiso */}
        {canViewPolinizaciones && (
          <View style={[styles.statCard, { backgroundColor: themeColors.background.secondary }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="flower" size={24} color="#F57C00" />
            </View>
            <Text style={styles.statLabel}>Polinizaciones</Text>
            <Text style={styles.statValue}>{estadisticas.total_polinizaciones}</Text>
            <Text style={styles.statSubtext}>
              {polinizacionesEnProceso} en proceso
            </Text>
            {onDownloadPolinizacionesPDF && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: 'rgba(245, 124, 0, 0.1)',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#F57C00',
                }}
                onPress={onDownloadPolinizacionesPDF}
              >
                <Ionicons name="document-text" size={16} color="#F57C00" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#F57C00', marginLeft: 6 }}>
                  Descargar PDF
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tarjeta de Germinaciones - Solo si tiene permiso */}
        {canViewGerminaciones && (
          <View style={[styles.statCard, { backgroundColor: themeColors.background.secondary }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>Germinaciones</Text>
            <Text style={styles.statValue}>{estadisticas.total_germinaciones}</Text>
            <Text style={styles.statSubtext}>
              {germinacionesEnProceso} en proceso
            </Text>
            {onDownloadGerminacionesPDF && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#4CAF50',
                }}
                onPress={onDownloadGerminacionesPDF}
              >
                <Ionicons name="document-text" size={16} color="#4CAF50" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#4CAF50', marginLeft: 6 }}>
                  Descargar PDF
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tarjeta de Éxito Promedio - Solo si tiene permiso de polinizaciones */}
        {canViewPolinizaciones && (
          <View style={[styles.statCard, { backgroundColor: themeColors.background.secondary }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="trending-up" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statLabel}>Éxito Promedio</Text>
            <Text style={styles.statValue}>{exitoPromedio}%</Text>
            <Text style={styles.statSubtext}>
              {totalCompletadas} completadas de {totalRegistros}
            </Text>
          </View>
        )}
      </View>

      {/* Nueva Sección: Listas Activas (Side-by-Side) */}
      {(canViewPolinizaciones || canViewGerminaciones) && (
        <View style={styles.activeListSection}>
          <View style={[styles.activeListContainer, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
            {/* Polinizaciones Activas - Solo si tiene permiso */}
            {canViewPolinizaciones && (
              <View style={styles.activeListCard}>
                <View style={styles.activeListHeader}>
                  <View style={styles.activeListTitleContainer}>
                    <View style={[styles.activeListIcon, { backgroundColor: 'rgba(245, 124, 0, 0.1)' }]}>
                      <Ionicons name="flower" size={20} color="#F57C00" />
                    </View>
                    <Text style={styles.activeListTitle}>Polinizaciones Activas</Text>
                  </View>
                  <View style={styles.activeListEfficiency}>
                    <View style={styles.efficiencyBar}>
                      <View style={[styles.efficiencyFill, { width: `${exitoPromedio}%`, backgroundColor: '#F57C00' }]} />
                    </View>
                    <Text style={styles.efficiencyText}>{exitoPromedio}% Eficiencia</Text>
                  </View>
                </View>

                {polinizacionesRecientes.length > 0 ? (
                  polinizacionesRecientes.map((pol, index) => (
                    <TouchableOpacity
                      key={pol.id || index}
                      style={styles.activeListItem}
                      onPress={() => onViewPolinizacion?.(pol)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.activeListItemIcon, { backgroundColor: 'rgba(245, 124, 0, 0.1)' }]}>
                        <Ionicons name="flower-outline" size={18} color="#F57C00" />
                      </View>

                      <View style={styles.activeListItemContent}>
                        <Text style={styles.activeListItemCode}>{pol.codigo || `POL-${pol.numero}`}</Text>

                        <View style={styles.activeListItemMeta}>
                          <View style={styles.activeListItemDays}>
                            <Ionicons name="pulse" size={14} color="#6B7280" />
                            <Text style={styles.activeListItemDaysText}>DÍA {getDaysActive(pol.fecha_creacion as string)}</Text>
                          </View>

                          <View style={[styles.activeListBadge, { backgroundColor: 'rgba(30, 58, 138, 0.3)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
                            <Text style={[styles.activeListBadgeText, { color: getEstadoColor(pol.estado) }]}>
                              {pol.estado || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>No hay polinizaciones recientes</Text>
                )}

                <TouchableOpacity
                  style={styles.viewHistoryButton}
                  onPress={onViewAllPolinizaciones}
                >
                  <Text style={styles.viewHistoryText}>Ver Historial Completo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Germinaciones Activas - Solo si tiene permiso */}
            {canViewGerminaciones && (
              <View style={styles.activeListCard}>
                <View style={styles.activeListHeader}>
                  <View style={styles.activeListTitleContainer}>
                    <View style={[styles.activeListIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                      <Ionicons name="leaf" size={20} color="#10B981" />
                    </View>
                    <Text style={styles.activeListTitle}>Germinaciones Activas</Text>
                  </View>
                </View>

                {germinacionesRecientes.length > 0 ? (
                  germinacionesRecientes.map((germ, index) => (
                    <TouchableOpacity
                      key={germ.id || index}
                      style={styles.activeListItem}
                      onPress={() => onViewGerminacion?.(germ)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.activeListItemIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Ionicons name="leaf-outline" size={18} color="#10B981" />
                      </View>

                      <View style={styles.activeListItemContent}>
                        <Text style={styles.activeListItemCode}>{germ.codigo || `GER-${germ.id}`}</Text>

                        <View style={styles.activeListItemMeta}>
                          <View style={styles.activeListItemDays}>
                            <Ionicons name="pulse" size={14} color="#6B7280" />
                            <Text style={styles.activeListItemDaysText}>DÍA {getDaysActive(germ.fecha_creacion as string)}</Text>
                          </View>

                          <View style={[styles.activeListBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                            <Text style={[styles.activeListBadgeText, { color: getEstadoColor(germ.estado_germinacion) }]}>
                              {germ.estado_germinacion || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>No hay germinaciones recientes</Text>
                )}

                <TouchableOpacity
                  style={styles.viewHistoryButton}
                  onPress={onViewAllGerminaciones}
                >
                  <Text style={styles.viewHistoryText}>Ver Historial Completo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}


      {/* Sección: Últimas Alertas */}
      {
        recentNotifications.length > 0 && (
          <View style={styles.activeListSection}>
            <View style={styles.activeListCard}>
              <View style={styles.activeListHeader}>
                <View style={styles.activeListTitleContainer}>
                  <View style={[styles.activeListIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="notifications" size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.activeListTitle}>Últimas Alertas</Text>
                </View>
              </View>

              {recentNotifications.map((notif, index) => {
                const iconName = notificationService.getNotificationIcon(notif.tipo);
                const color = notificationService.getNotificationColor(notif.tipo);

                return (
                  <TouchableOpacity
                    key={notif.id || index}
                    style={styles.activeListItem}
                    activeOpacity={0.7}
                  // No action defined yet for clicking a notification in summary
                  >
                    <View style={[styles.activeListItemIcon, { backgroundColor: `${color}20` }]}>
                      <Ionicons name={iconName as any} size={18} color={color} />
                    </View>

                    <View style={styles.activeListItemContent}>
                      <Text style={styles.activeListItemCode} numberOfLines={1}>
                        {notif.titulo}
                      </Text>

                      <Text style={[styles.activeListItemDaysText, { marginTop: 2 }]} numberOfLines={2}>
                        {notif.mensaje}
                      </Text>

                      <View style={styles.activeListItemMeta}>
                        <View style={styles.activeListItemDays}>
                          <Ionicons name="time-outline" size={12} color="#6B7280" />
                          <Text style={styles.activeListItemDaysText}>
                            {new Date(notif.fecha_creacion).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.viewHistoryButton}
                onPress={onViewAllNotifications}
              >
                <Text style={styles.viewHistoryText}>Ver Todas las Notificaciones</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      }

      {/* Mensaje si no hay datos */}
      {
        (canViewPolinizaciones ? polinizacionesRecientes.length === 0 : true) &&
        (canViewGerminaciones ? germinacionesRecientes.length === 0 : true) &&
        (canViewPolinizaciones || canViewGerminaciones) && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={themeColors.text.disabled} />
            <Text style={styles.emptyStateText}>No hay registros recientes</Text>
            <Text style={styles.emptyStateSubtext}>
              {canViewPolinizaciones && canViewGerminaciones
                ? 'Las polinizaciones y germinaciones que agregues aparecerán aquí'
                : canViewGerminaciones
                  ? 'Las germinaciones que agregues aparecerán aquí'
                  : 'Las polinizaciones que agregues aparecerán aquí'}
            </Text>
          </View>
        )
      }
    </ScrollView >
  );
}
