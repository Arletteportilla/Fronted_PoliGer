import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import Pagination from '@/components/filters/Pagination';
import type { Germinacion } from '@/types/index';
import { getEstadoColor } from '@/utils/colorHelpers';

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
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
            <Ionicons name="add-circle" size={20} color={Colors.light.background} />
            <Text style={styles.newItemButtonText}>Nueva Germinación</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => {
              console.log('🔔 Botón Descargar PDF clickeado - Germinaciones');
              onDescargarPDF();
            }}
          >
            <Ionicons name="download-outline" size={20} color={Colors.light.tint} />
            <Text style={styles.exportButtonText}>Descargar PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchAndFiltersContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
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
                <Ionicons name="search" size={20} color={Colors.light.tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setSearchGerminaciones('');
                setGerminacionesPage(1);
                fetchData();
              }}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Tabla de germinaciones */}
      {filteredGerminaciones.length === 0 ? (
        <View style={styles.listEmptyContainer}>
          <Ionicons name="leaf-outline" size={48} color="#6b7280" />
          <Text style={styles.listEmptyText}>
            {searchGerminaciones ? 'No se encontraron germinaciones' : 'No hay germinaciones registradas'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchGerminaciones ? 'Intenta con otros términos de búsqueda' : 'Las germinaciones que registres aparecerán aquí'}
          </Text>
        </View>
      ) : (
        <View style={[styles.tableContainer, { marginHorizontal: 0, marginBottom: 0 }]}>
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

              // Calcular progreso de la germinación basado en días transcurridos
              const calculateProgress = () => {
                // Si está marcada como completada, 100%
                const etapa = item.etapa_actual || item.estado || 'INGRESADO';
                if (etapa === 'LISTA' || etapa === 'LISTO') return 100;
                if (etapa === 'CANCELADO') return 0;

                // Si no hay fecha de siembra, usar progreso basado en estado
                if (!item.fecha_siembra) {
                  return etapa === 'EN_PROCESO' ? 65 : 30;
                }

                // Calcular días transcurridos desde la siembra
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaSiembra = new Date(item.fecha_siembra);
                fechaSiembra.setHours(0, 0, 0, 0);
                const diasTranscurridos = Math.ceil((hoy.getTime() - fechaSiembra.getTime()) / (1000 * 60 * 60 * 24));

                // Obtener días totales estimados (de la predicción o por defecto 30)
                const diasTotales = item.prediccion_dias_estimados || 30;

                // Calcular progreso (mínimo 0%, máximo 100%)
                const progreso = Math.min(Math.max((diasTranscurridos / diasTotales) * 100, 0), 100);

                return Math.round(progreso);
              };
              const progress = calculateProgress();

              const itemKey = item.id?.toString() || `germ-${index}`;
              const estadoColor = getEstadoColor(estadoActual);
              const isLastRow = index === filteredGerminaciones.length - 1;

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
                        <Text style={[styles.fechaText, { fontSize: 10, color: '#9CA3AF' }]}>
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

                  {/* Barra de progreso */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressInfo}>
                      <Ionicons
                        name="stats-chart-outline"
                        size={12}
                        color={estadoColor}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.progressLabel}>Progreso:</Text>
                      <Text style={[styles.progressPercentage, { color: estadoColor }]}>{progress}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${progress}%`,
                            backgroundColor: estadoColor
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Paginación */}
      {germinacionesTotalPages > 1 && (
        <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
          <Text style={{ marginBottom: 8, textAlign: 'center', color: '#6b7280' }}>
            Mostrando {germinaciones.length} de {germinacionesTotalCount} germinaciones
          </Text>
          <Pagination
            currentPage={germinacionesPage}
            totalPages={germinacionesTotalPages}
            goToPage={handleGerminacionesPageChange}
            nextPage={handleGerminacionesNextPage}
            prevPage={handleGerminacionesPrevPage}
          />
        </View>
      )}
    </View>
  );
}
