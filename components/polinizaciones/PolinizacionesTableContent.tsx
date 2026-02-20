import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pagination from '@/components/filters/Pagination';
import { useTheme } from '@/contexts/ThemeContext';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';

interface PolinizacionesTableContentProps {
  polinizaciones: any[];
  loading: boolean;
  refreshing: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  activeFiltersCount: number;
  tipoRegistro?: 'historicos' | 'nuevos' | 'todos';
  onRefresh: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onItemPress?: (item: any) => void;
  onEdit?: (item: any) => void;
}

export const PolinizacionesTableContent: React.FC<PolinizacionesTableContentProps> = ({
  polinizaciones,
  loading,
  refreshing,
  totalCount,
  currentPage,
  totalPages,
  activeFiltersCount,
  tipoRegistro = 'todos',
  onRefresh,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onItemPress,
  onEdit,
}) => {
  const { colors: themeColors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const styles = createStyles(themeColors);

  // Función para obtener color de tipo
  const getTipoColor = (tipo: string) => {
    const tipoUpper = tipo?.toUpperCase() || '';
    if (tipoUpper === 'SELF') return '#FEF3C7';
    if (tipoUpper === 'CROSS') return '#DBEAFE';
    return '#F3F4F6';
  };

  // Función para obtener color de texto del tipo
  const getTipoTextColor = (tipo: string) => {
    const tipoUpper = tipo?.toUpperCase() || '';
    if (tipoUpper === 'SELF') return '#92400E';
    if (tipoUpper === 'CROSS') return '#1E40AF';
    return '#374151';
  };

  // Función para obtener color de fondo del estado
  const getEstadoBgColor = (estado: string, fechamad: any, prediccionFecha: any) => {
    if (fechamad) return '#D1FAE5'; // Completado
    if (prediccionFecha && new Date(prediccionFecha) <= new Date()) return '#FEF3C7'; // En Proceso
    return '#F3F4F6'; // Pendiente/Ingresado
  };

  // Función para obtener color de texto del estado
  const getEstadoTextColor = (estado: string, fechamad: any, prediccionFecha: any) => {
    if (fechamad) return '#065F46'; // Completado
    if (prediccionFecha && new Date(prediccionFecha) <= new Date()) return '#92400E'; // En Proceso
    return '#374151'; // Pendiente
  };

  // Función para obtener etiqueta del estado
  const getEstadoLabel = (item: any) => {
    if (item.fechamad) return 'Completado';
    if (item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) <= new Date()) return 'En Proceso';
    return 'Ingresado';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando polinizaciones...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Tabla de polinizaciones */}
      {polinizaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flower-outline" size={64} color={themeColors.border.default} />
          <Text style={styles.emptyTitle}>No hay polinizaciones</Text>
          <Text style={styles.emptySubtitle}>
            {activeFiltersCount > 0 ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera polinización'}
          </Text>
        </View>
      ) : isMobile ? (
        /* Vista de tarjetas para móvil */
        <View style={styles.cardsContainer}>
          {polinizaciones.map((item, index) => {
            const especieCompleta = item.nueva_especie || item.especie || item.madre_especie || 'Sin especie';
            const generoCompleto = item.nueva_genero || item.genero || item.madre_genero || 'Sin género';
            const codigoCompleto = item.codigo || item.nueva_codigo || item.madre_codigo || `#POL-${item.numero}`;
            const fechaPolinizacion = item.fechapol
              ? new Date(item.fechapol).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : 'Sin fecha';
            const fechaEstimadaValue = item.fecha_maduracion_predicha || item.prediccion_fecha_estimada;
            const fechaEstimada = fechaEstimadaValue
              ? new Date(fechaEstimadaValue).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : null;
            const estadoActual = getEstadoLabel(item);
            const tipo = item.tipo_polinizacion || item.tipo || 'SELF';
            const itemKey = item.numero?.toString() || item.id?.toString() || `pol-${index}`;
            const estadoBgColor = getEstadoBgColor(estadoActual, item.fechamad, fechaEstimadaValue);
            const estadoTextColor = getEstadoTextColor(estadoActual, item.fechamad, fechaEstimadaValue);
            const tipoBgColor = getTipoColor(tipo);
            const tipoTextColor = getTipoTextColor(tipo);

            const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
            const diasFaltantes = fechaEstimadaValue
              ? Math.ceil((new Date(fechaEstimadaValue).setHours(0,0,0,0) - hoy.getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <TouchableOpacity
                key={itemKey}
                style={styles.mobileCard}
                onPress={() => onItemPress?.(item)}
                activeOpacity={0.8}
              >
                {/* Fila superior: código + tipo + estado */}
                <View style={styles.mobileCardHeader}>
                  <Text style={styles.mobileCardCodigo} numberOfLines={1}>{codigoCompleto}</Text>
                  <View style={styles.mobileCardBadges}>
                    <View style={[styles.mobileBadge, { backgroundColor: tipoBgColor }]}>
                      <Text style={[styles.mobileBadgeText, { color: tipoTextColor }]}>{tipo}</Text>
                    </View>
                    <View style={[styles.mobileBadge, { backgroundColor: estadoBgColor }]}>
                      <Text style={[styles.mobileBadgeText, { color: estadoTextColor }]}>{estadoActual}</Text>
                    </View>
                  </View>
                </View>

                {/* Especie */}
                <Text style={styles.mobileCardEspecie} numberOfLines={1}>{especieCompleta}</Text>
                <Text style={styles.mobileCardGenero} numberOfLines={1}>{generoCompleto}</Text>

                {/* Fechas */}
                <View style={styles.mobileCardFooter}>
                  <View style={styles.mobileCardDateRow}>
                    <Ionicons name="calendar-outline" size={12} color={themeColors.text.tertiary} />
                    <Text style={styles.mobileCardDate}>Pol: {fechaPolinizacion}</Text>
                  </View>
                  {fechaEstimada && (
                    <View style={styles.mobileCardDateRow}>
                      <Ionicons name="time-outline" size={12} color={themeColors.text.tertiary} />
                      <Text style={styles.mobileCardDate}>Est: {fechaEstimada}</Text>
                      {diasFaltantes !== null && (
                        <Text style={{
                          fontSize: 10, fontWeight: '700',
                          color: diasFaltantes > 0 ? '#F59E0B' : diasFaltantes === 0 ? '#10B981' : '#EF4444'
                        }}>
                          {diasFaltantes > 0 ? `${diasFaltantes}d` : diasFaltantes === 0 ? 'Hoy' : 'Venc.'}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                {/* Progress bar */}
                {tipoRegistro !== 'historicos' && item.estado_polinizacion && (
                  <View style={{ marginTop: 8 }}>
                    <EstadoProgressBar
                      estadoActual={item.estado_polinizacion as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
                      tipo="polinizacion"
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableHeaderCell, { flex: 0.8 }]}>
              <Text style={styles.headerText}>Tipo</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
              <Text style={styles.headerText}>Código</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 2 }]}>
              <Text style={styles.headerText}>Especie</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 1 }]}>
              <Text style={styles.headerText}>Género</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 1 }]}>
              <Text style={styles.headerText}>Fecha Pol.</Text>
            </View>
            {/* Fecha Est. y Estado solo para registros nuevos */}
            {tipoRegistro !== 'historicos' && (
              <>
                <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                  <Text style={styles.headerText}>Fecha Est.</Text>
                </View>
                <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                  <Text style={styles.headerText}>Estado</Text>
                </View>
              </>
            )}
            <View style={[styles.tableHeaderCell, { flex: 1 }]}>
              <Text style={styles.headerText}>Acciones</Text>
            </View>
          </View>

          {/* Filas de datos */}
          {polinizaciones.map((item, index) => {
            const especieCompleta = item.nueva_especie || item.especie || item.madre_especie || 'Sin especie';
            const generoCompleto = item.nueva_genero || item.genero || item.madre_genero || 'Sin género';
            const codigoCompleto = item.codigo || item.nueva_codigo || item.madre_codigo || `#POL-${item.numero}`;
            const fechaPolinizacion = item.fechapol
              ? new Date(item.fechapol).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : 'Sin fecha';
            const fechaEstimadaValue = item.fecha_maduracion_predicha || item.prediccion_fecha_estimada;
            const fechaEstimada = fechaEstimadaValue
              ? new Date(fechaEstimadaValue).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : '-';
            const estadoActual = getEstadoLabel(item);
            const tipo = item.tipo_polinizacion || item.tipo || 'SELF';

            const itemKey = item.numero?.toString() || item.id?.toString() || `pol-${index}`;
            const estadoBgColor = getEstadoBgColor(estadoActual, item.fechamad, fechaEstimadaValue);
            const estadoTextColor = getEstadoTextColor(estadoActual, item.fechamad, fechaEstimadaValue);
            const tipoBgColor = getTipoColor(tipo);
            const tipoTextColor = getTipoTextColor(tipo);
            const isLastRow = index === polinizaciones.length - 1;

            return (
              <View
                key={itemKey}
                style={[
                  styles.tableRowContainer,
                  isLastRow && styles.tableRowContainerLast
                ]}
              >
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 0.8, alignItems: 'center' }]}>
                    <View style={[styles.tipoBadgeTable, { backgroundColor: tipoBgColor }]}>
                      <Text style={[styles.tipoBadgeTableText, { color: tipoTextColor }]}>{tipo}</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { flex: 1.2 }]}>
                    <Text style={styles.codigoTextTable} numberOfLines={1} ellipsizeMode="tail">
                      {codigoCompleto}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 2 }]}>
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
                    <Text style={styles.fechaTextTable}>{fechaPolinizacion}</Text>
                  </View>
                  {/* Fecha Est. y Estado solo para registros nuevos */}
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
                  <View style={[styles.tableCell, { flex: 1 }]}>
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
                {tipoRegistro !== 'historicos' && item.estado_polinizacion && (
                  <View style={{
                    marginTop: 8,
                    marginHorizontal: 8,
                    marginBottom: 8,
                    borderRadius: 12,
                    paddingVertical: 4
                  }}>
                    <EstadoProgressBar
                      estadoActual={item.estado_polinizacion as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
                      tipo="polinizacion"
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
  tipoBadgeTable: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
  },
  tipoBadgeTableText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  // Estilos móvil - tarjetas
  cardsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  mobileCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mobileCardCodigo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  mobileCardBadges: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  mobileBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mobileBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mobileCardEspecie: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  mobileCardGenero: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  mobileCardFooter: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  mobileCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mobileCardDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});
