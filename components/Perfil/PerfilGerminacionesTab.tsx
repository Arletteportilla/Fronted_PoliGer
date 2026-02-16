import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createStyles } from '@/utils/Perfil/styles';
import { useTheme } from '@/contexts/ThemeContext';
import Pagination from '@/components/filters/Pagination';
import type { Germinacion } from '@/types/index';
import { getEstadoColor } from '@/utils/colorHelpers';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';
import { logger } from '@/services/logger';

export interface PerfilGerminacionesTabProps {
  loading: boolean;
  germinaciones: Germinacion[];
  searchGerminaciones: string;
  setSearchGerminaciones: (value: string) => void;
  setGerminacionesPage: (page: number) => void;
  fetchData: () => Promise<void>;
  handleBuscarGerminaciones: () => void;
  germinacionesTotalPages: number;
  germinacionesTotalCount: number;
  germinacionesPage: number;
  handleGerminacionesPageChange: (page: number) => void;
  handleGerminacionesNextPage: () => void;
  handleGerminacionesPrevPage: () => void;
  handleViewGerminacion: (item: Germinacion) => void;
  handleEditGerminacion: (item: Germinacion) => void;
  handleDeleteGerminacion: (item: Germinacion) => void;
  handleOpenChangeStatus: (item: Germinacion) => void;
  onDescargarPDF: () => void;
}

export function PerfilGerminacionesTab({
  loading,
  germinaciones,
  searchGerminaciones,
  setSearchGerminaciones,
  setGerminacionesPage,
  fetchData,
  handleBuscarGerminaciones,
  germinacionesTotalPages,
  germinacionesTotalCount,
  germinacionesPage,
  handleGerminacionesPageChange,
  handleGerminacionesNextPage,
  handleGerminacionesPrevPage,
  handleViewGerminacion,
  handleEditGerminacion,
  handleDeleteGerminacion,
  handleOpenChangeStatus,
  onDescargarPDF
}: PerfilGerminacionesTabProps) {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const styles = createStyles(themeColors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando germinaciones...</Text>
      </View>
    );
  }

  const germinacionesArray = Array.isArray(germinaciones) ? germinaciones : [];

  // Ya no necesitamos filtrar localmente porque la búsqueda se hace en el backend
  const filteredGerminaciones = germinacionesArray;

  return (
    <View style={styles.professionalTableContainer}>
      {/* Encabezado */}
      <View style={styles.tableHeaderSection}>
        <View style={styles.tableTitleContainer}>
          <Text style={styles.professionalTableTitle}>Mis Germinaciones</Text>
          <Text style={styles.professionalTableSubtitle}>
            Registro y seguimiento de germinaciones
          </Text>
        </View>
        <View style={styles.tableActionsContainer}>
          <TouchableOpacity
            style={styles.newItemButton}
            onPress={() => router.push('/(tabs)/addGerminacion')}
          >
            <Ionicons name="add-circle" size={20} color={themeColors.background.primary} />
            <Text style={styles.newItemButtonText}>Nueva Germinación</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => {
              logger.info('🔔 Botón Descargar PDF clickeado - Germinaciones');
              onDescargarPDF();
            }}
          >
            <Ionicons name="download-outline" size={20} color={themeColors.primary.main} />
            <Text style={styles.exportButtonText}>Descargar PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchAndFiltersContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={themeColors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código, género, especie..."
            value={searchGerminaciones}
            onChangeText={setSearchGerminaciones}
            onSubmitEditing={handleBuscarGerminaciones}
          />
          {searchGerminaciones.length > 0 && (
            <>
              <TouchableOpacity onPress={handleBuscarGerminaciones} style={{ marginRight: 8 }}>
                <Ionicons name="search" size={20} color={themeColors.primary.main} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setSearchGerminaciones('');
                setGerminacionesPage(1);
                fetchData();
              }}>
                <Ionicons name="close-circle" size={20} color={themeColors.text.tertiary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Tabla de germinaciones */}
      {filteredGerminaciones.length === 0 ? (
        <View style={styles.listEmptyContainer}>
          <Ionicons name="leaf-outline" size={48} color={themeColors.text.tertiary} />
          <Text style={styles.listEmptyText}>
            {searchGerminaciones ? 'No se encontraron germinaciones' : 'No hay germinaciones registradas'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchGerminaciones ? 'Intenta con otros términos de búsqueda' : 'Las germinaciones que registres aparecerán aquí'}
          </Text>
        </View>
      ) : (
        <View style={[styles.tableContainer, { marginHorizontal: 0, marginBottom: 0 }]}>
          {/* Header de la tabla - Solo Desktop */}
          {!isMobile && (
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
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Fecha Estimada</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Estado</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Acciones</Text>
              </View>
            </View>
          )}

          {/* Filas de datos */}
          <ScrollView style={{ maxHeight: 500 }}>
            {filteredGerminaciones.map((item, index) => {
              // Construir datos de la germinación
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
              const estadoActual = item.etapa_actual || item.estado_capsula || 'En desarrollo';

              const itemKey = item.id?.toString() || `germ-${index}`;
              const estadoColor = getEstadoColor(estadoActual);
              const isLastRow = index === filteredGerminaciones.length - 1;

              // Renderizado de Carta para Móvil
              if (isMobile) {
                return (
                  <View key={itemKey} style={styles.mobileCard}>
                    <View style={styles.mobileCardHeader}>
                      <Text style={styles.mobileCardTitle}>{codigoCompleto}</Text>
                      <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
                        <Text style={styles.estadoBadgeText}>{estadoActual}</Text>
                      </View>
                    </View>

                    <View style={styles.mobileCardRow}>
                      <Text style={styles.mobileCardLabel}>Especie:</Text>
                      <Text style={styles.mobileCardValue}>{especieCompleta}</Text>
                    </View>

                    <View style={styles.mobileCardRow}>
                      <Text style={styles.mobileCardLabel}>Género:</Text>
                      <Text style={styles.mobileCardValue}>{generoCompleto}</Text>
                    </View>

                    <View style={styles.mobileCardRow}>
                      <Text style={styles.mobileCardLabel}>F. Siembra:</Text>
                      <Text style={styles.mobileCardValue}>{fechaSiembra}</Text>
                    </View>

                    <View style={styles.mobileCardRow}>
                      <Text style={styles.mobileCardLabel}>Predicción:</Text>
                      <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                        {fechaEstimadaValue ? (
                          <View>
                            <Text style={[styles.fechaText, { fontSize: 13, textAlign: 'right' }]}>
                              {fechaEstimada}
                            </Text>
                            {(() => {
                              const hoy = new Date();
                              hoy.setHours(0, 0, 0, 0);
                              const fechaEst = new Date(fechaEstimadaValue);
                              fechaEst.setHours(0, 0, 0, 0);
                              const diasFaltantes = Math.ceil((fechaEst.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                              return diasFaltantes > 0 ? (
                                <Text style={{ fontSize: 11, color: '#F59E0B', fontWeight: '600', textAlign: 'right' }}>
                                  {diasFaltantes}d restantes
                                </Text>
                              ) : diasFaltantes === 0 ? (
                                <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600', textAlign: 'right' }}>
                                  Hoy
                                </Text>
                              ) : (
                                <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '600', textAlign: 'right' }}>
                                  Vencido
                                </Text>
                              );
                            })()}
                          </View>
                        ) : (
                          <Text style={[styles.fechaText, { fontSize: 12, color: themeColors.text.tertiary, textAlign: 'right' }]}>
                            Sin predicción
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.mobileCardActions}>
                      <TouchableOpacity
                        onPress={() => handleViewGerminacion(item)}
                        style={styles.actionIconButton}
                      >
                        <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEditGerminacion(item)}
                        style={styles.actionIconButton}
                      >
                        <Ionicons name="create-outline" size={20} color="#F59E0B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteGerminacion(item)}
                        style={styles.actionIconButton}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Barra de progreso por etapas */}
                    {item.estado_germinacion && (
                      <View style={{
                        marginTop: 8,
                        borderRadius: 12,
                        paddingVertical: 4
                      }}>
                        <EstadoProgressBar
                          estadoActual={item.estado_germinacion as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
                          tipo="germinacion"
                        />
                      </View>
                    )}

                  </View>
                );
              }

              // Renderizado de Tabla para Desktop
              return (
                <View
                  key={itemKey}
                  style={[
                    styles.tableRowContainer,
                    isLastRow && styles.tableRowContainerLast
                  ]}
                >
                  {/* Fila principal con datos */}
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 1.2 }]}>
                      <Text style={styles.codigoText} numberOfLines={1} ellipsizeMode="tail">
                        {codigoCompleto}
                      </Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 2.5 }]}>
                      <Text style={styles.especieText} numberOfLines={2} ellipsizeMode="tail">
                        {especieCompleta}
                      </Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.generoText} numberOfLines={1} ellipsizeMode="tail">
                        {generoCompleto}
                      </Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.fechaText}>{fechaSiembra}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1.2 }]}>
                      {fechaEstimadaValue ? (
                        <View>
                          <Text style={[styles.fechaText, { fontSize: 11 }]}>
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
                        <Text style={[styles.fechaText, { fontSize: 10, color: themeColors.text.tertiary }]}>
                          Sin predicción
                        </Text>
                      )}
                    </View>
                    <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                      <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
                        <Text style={styles.estadoBadgeText}>{estadoActual}</Text>
                      </View>
                    </View>
                    <View style={[styles.tableCell, { flex: 1.2 }]}>
                      <View style={styles.actionsCell}>
                        <TouchableOpacity
                          onPress={() => handleViewGerminacion(item)}
                          style={styles.actionIconButton}
                        >
                          <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEditGerminacion(item)}
                          style={styles.actionIconButton}
                        >
                          <Ionicons name="create-outline" size={20} color="#F59E0B" />
                        </TouchableOpacity>
                        {item.etapa_actual !== 'FINALIZADO' && (
                          <TouchableOpacity
                            onPress={() => handleOpenChangeStatus(item)}
                            style={styles.actionIconButton}
                          >
                            <Ionicons name="swap-horizontal-outline" size={20} color="#8B5CF6" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => handleDeleteGerminacion(item)}
                          style={styles.actionIconButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Barra de progreso por etapas */}
                  {item.estado_germinacion && (
                    <View style={{
                      marginTop: 8,
                      borderRadius: 12,
                      paddingVertical: 4
                    }}>
                      <EstadoProgressBar
                        estadoActual={item.estado_germinacion as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
                        tipo="germinacion"
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Paginación */}
      {germinacionesTotalCount > 0 && germinacionesTotalPages > 1 && (
        <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
          <Text style={{ marginBottom: 8, textAlign: 'center', color: themeColors.text.tertiary }}>
            Mostrando {germinaciones.length} de {germinacionesTotalCount} germinaciones
          </Text>
          <Pagination
            currentPage={germinacionesPage}
            totalPages={germinacionesTotalPages}
            totalCount={germinacionesTotalCount}
            pageSize={20}
            goToPage={handleGerminacionesPageChange}
            nextPage={handleGerminacionesNextPage}
            prevPage={handleGerminacionesPrevPage}
          />
        </View>
      )}
    </View>
  );
}
