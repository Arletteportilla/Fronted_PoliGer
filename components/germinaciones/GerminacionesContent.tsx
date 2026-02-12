import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pagination from '@/components/filters/Pagination';
import { useTheme } from '@/contexts/ThemeContext';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';

interface GerminacionesContentProps {
  germinaciones: any[];
  loading: boolean;
  refreshing: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  activeFiltersCount: number;
  tipoRegistro?: 'historicos' | 'nuevos' | 'todos';
  responsive: any;
  onRefresh: () => void;
  onShowFilters: () => void;
  onShowForm: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onItemPress?: (item: any) => void;
  onTipoRegistroChange?: (tipo: 'historicos' | 'nuevos' | 'todos') => void;
  onChangeEstado?: (id: number, nuevoEstado: string) => void;
}

export const GerminacionesContent: React.FC<GerminacionesContentProps> = ({
  germinaciones,
  loading,
  refreshing,
  totalCount,
  currentPage,
  totalPages,
  activeFiltersCount,
  tipoRegistro = 'todos',
  responsive,
  onRefresh,
  onShowFilters,
  onShowForm,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onItemPress,
  onTipoRegistroChange,
  onChangeEstado,
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  // Función para obtener color de fondo del estado (versión clara)
  const getEstadoBgColor = (estado: string) => {
    const estadoLower = estado?.toLowerCase() || '';
    if (estadoLower === 'completado' || estadoLower === 'finalizado' || estadoLower === 'lista' || estadoLower === 'listo') return '#D1FAE5';
    if (estadoLower === 'en proceso' || estadoLower === 'en_proceso' || estadoLower === 'pendiente' || estadoLower === 'en_proceso_temprano' || estadoLower === 'en_proceso_avanzado') return '#FEF3C7';
    if (estadoLower === 'en desarrollo') return '#FEF3C7';
    if (estadoLower === 'ingresado' || estadoLower === 'inicial') return '#E5E7EB';
    if (estadoLower === 'cerrada') return '#E5E7EB';
    return '#F3F4F6';
  };

  // Función para obtener color de texto del estado
  const getEstadoTextColor = (estado: string) => {
    const estadoUpper = estado?.toUpperCase() || '';
    if (estadoUpper === 'INGRESADO' || estadoUpper === 'PENDIENTE' || estadoUpper === 'EN DESARROLLO' || estadoUpper === 'CERRADA') return '#374151';
    if (estadoUpper === 'EN_PROCESO' || estadoUpper === 'EN PROCESO' || estadoUpper === 'EN_PROCESO_TEMPRANO' || estadoUpper === 'EN_PROCESO_AVANZADO') return '#92400E';
    if (estadoUpper === 'LISTA' || estadoUpper === 'LISTO' || estadoUpper === 'COMPLETADO' || estadoUpper === 'FINALIZADO') return '#065F46';
    return '#374151';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando germinaciones...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Tabla de germinaciones */}
      {germinaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="leaf-outline" size={64} color={themeColors.border.default} />
          <Text style={styles.emptyTitle}>No hay germinaciones</Text>
          <Text style={styles.emptySubtitle}>
            {activeFiltersCount > 0 ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera germinación'}
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
              <Text style={styles.headerText}>Código</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 2.5 }]}>
              <Text style={styles.headerText}>Especie/Variedad</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 1 }]}>
              <Text style={styles.headerText}>Género</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 1 }]}>
              <Text style={styles.headerText}>Fecha Siembra</Text>
            </View>
            {/* Fecha Estimada y Estado solo para registros nuevos */}
            {tipoRegistro !== 'historicos' && (
              <>
                <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                  <Text style={styles.headerText}>Fecha Estimada</Text>
                </View>
                <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                  <Text style={styles.headerText}>Estado</Text>
                </View>
              </>
            )}
            <View style={[styles.tableHeaderCell, { flex: 0.8 }]}>
              <Text style={styles.headerText}>Acciones</Text>
            </View>
          </View>

          {/* Filas de datos */}
          {germinaciones.map((item, index) => {
            const especieCompleta = item.especie_variedad || item.especie || 'Sin especie';
            const generoCompleto = item.genero || 'Sin género';
            const codigoCompleto = item.codigo || item.nombre || 'Sin código';
            const fechaSiembra = item.fecha_siembra
              ? new Date(item.fecha_siembra).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : 'Sin fecha';
            const fechaEstimadaValue = item.prediccion_fecha_estimada || item.fecha_germinacion_estimada;
            const fechaEstimada = fechaEstimadaValue
              ? new Date(fechaEstimadaValue).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : '-';
            const estadoActual = item.estado_germinacion || item.etapa_actual || item.estado_capsula || item.estado || 'En desarrollo';

            const itemKey = item.id?.toString() || `germ-${index}`;
            const estadoBgColor = getEstadoBgColor(estadoActual);
            const estadoTextColor = getEstadoTextColor(estadoActual);
            const isLastRow = index === germinaciones.length - 1;

            return (
              <View
                key={itemKey}
                style={[
                  styles.tableRowContainer,
                  isLastRow && styles.tableRowContainerLast
                ]}
              >
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 1.2 }]}>
                    <Text style={styles.codigoTextTable} numberOfLines={1} ellipsizeMode="tail">
                      {codigoCompleto}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 2.5 }]}>
                    <Text style={styles.especieTextTable} numberOfLines={2} ellipsizeMode="tail">
                      {especieCompleta}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.generoTextTable} numberOfLines={1} ellipsizeMode="tail">
                      {generoCompleto}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.fechaTextTable}>{fechaSiembra}</Text>
                  </View>
                  {/* Fecha Estimada y Estado solo para registros nuevos */}
                  {tipoRegistro !== 'historicos' && (
                    <>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        {fechaEstimadaValue ? (
                          <View>
                            <Text style={[styles.fechaTextTable, { fontSize: 11 }]}>
                              {fechaEstimada}
                            </Text>
                            {(() => {
                              const hoy = new Date();
                              hoy.setHours(0, 0, 0, 0);
                              const fechaEst = new Date(fechaEstimadaValue);
                              fechaEst.setHours(0, 0, 0, 0);
                              const diasFaltantes = Math.ceil((fechaEst.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                              return diasFaltantes > 0 ? (
                                <Text style={{ fontSize: 9, color: '#F59E0B', fontWeight: '600' }}>
                                  {diasFaltantes}d restantes
                                </Text>
                              ) : diasFaltantes === 0 ? (
                                <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '600' }}>
                                  Hoy
                                </Text>
                              ) : (
                                <Text style={{ fontSize: 9, color: '#EF4444', fontWeight: '600' }}>
                                  Vencido
                                </Text>
                              );
                            })()}
                          </View>
                        ) : (
                          <Text style={[styles.fechaTextTable, { fontSize: 10, color: '#9CA3AF' }]}>
                            Sin predicción
                          </Text>
                        )}
                      </View>
                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                        <View style={[styles.estadoBadgeTable, { backgroundColor: estadoBgColor }]}>
                          <Text style={[styles.estadoBadgeTableText, { color: estadoTextColor }]}>{estadoActual}</Text>
                        </View>
                      </View>
                    </>
                  )}
                  <View style={[styles.tableCell, { flex: 0.8 }]}>
                    <View style={styles.actionsCell}>
                      <TouchableOpacity
                        onPress={() => onItemPress?.(item)}
                        style={styles.actionIconButton}
                      >
                        <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Barra de progreso por etapas - Solo para registros nuevos */}
                {tipoRegistro !== 'historicos' && item.estado_germinacion && (
                  <View style={{
                    marginTop: 8,
                    marginHorizontal: 8,
                    marginBottom: 8,
                    borderRadius: 12,
                    paddingVertical: 4
                  }}>
                    <EstadoProgressBar
                      estadoActual={item.estado_germinacion as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
                      tipo="germinacion"
                      {...(onChangeEstado ? { onChangeEstado: (nuevoEstado: string) => onChangeEstado(item.id, nuevoEstado) } : {})}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Paginación */}
      {totalCount > 0 && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={20}
          goToPage={onGoToPage}
          nextPage={onNextPage}
          prevPage={onPrevPage}
        />
      )}
    </>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  // Estilos de tabla
  tableContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.default,
    paddingVertical: 12,
  },
  tableHeaderCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  tableRowContainerLast: {
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 60,
    paddingVertical: 8,
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    minHeight: 60,
  },
  codigoTextTable: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  especieTextTable: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  generoTextTable: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  fechaTextTable: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  estadoBadgeTable: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
  },
  estadoBadgeTableText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
});