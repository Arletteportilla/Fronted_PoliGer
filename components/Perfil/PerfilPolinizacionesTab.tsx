import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import Pagination from '@/components/filters/Pagination';
import type { Polinizacion } from '@/types/index';

export interface PerfilPolinizacionesTabProps {
  loading: boolean;
  polinizaciones: Polinizacion[];
  searchPolinizaciones: string;
  setSearchPolinizaciones: (value: string) => void;
  setPolinizacionesPage: (page: number) => void;
  fetchData: () => Promise<void>;
  handleBuscarPolinizaciones: () => void;
  polinizacionesTotalPages: number;
  polinizacionesTotalCount: number;
  polinizacionesPage: number;
  handlePolinizacionesPageChange: (page: number) => void;
  handlePolinizacionesNextPage: () => void;
  handlePolinizacionesPrevPage: () => void;
  handleViewPolinizacion: (item: Polinizacion) => void;
  handleEditPolinizacion: (item: Polinizacion) => void;
  handleDeletePolinizacion: (item: Polinizacion) => void;
  onDescargarPDF: () => void;
}

// Funciones auxiliares para colores
const getTipoColor = (tipo: string): string => {
  const tipoLower = tipo?.toLowerCase() || '';
  if (tipoLower === 'self') return '#3B82F6';
  if (tipoLower === 'sibling') return '#8B5CF6';
  if (tipoLower === 'híbrida' || tipoLower === 'hibrida') return '#F59E0B';
  if (tipoLower === 'replante') return '#3b82f6';
  return '#3B82F6';
};

const getEstadoColor = (estado: string): string => {
  const estadoLower = estado?.toLowerCase() || '';
  if (estadoLower === 'completado') return '#10B981';
  if (estadoLower === 'en proceso') return '#F59E0B';
  if (estadoLower === 'ingresado') return '#6B7280';
  if (estadoLower === 'en desarrollo') return '#fbbf24';
  if (estadoLower === 'maduro') return '#60a5fa';
  if (estadoLower === 'pendiente') return '#f59e0b';
  return '#6B7280';
};

export function PerfilPolinizacionesTab({
  loading,
  polinizaciones,
  searchPolinizaciones,
  setSearchPolinizaciones,
  setPolinizacionesPage,
  fetchData,
  handleBuscarPolinizaciones,
  polinizacionesTotalPages,
  polinizacionesTotalCount,
  polinizacionesPage,
  handlePolinizacionesPageChange,
  handlePolinizacionesNextPage,
  handlePolinizacionesPrevPage,
  handleViewPolinizacion,
  handleEditPolinizacion,
  handleDeletePolinizacion,
  onDescargarPDF
}: PerfilPolinizacionesTabProps) {
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Cargando polinizaciones...</Text>
      </View>
    );
  }

  const polinizacionesArray = Array.isArray(polinizaciones) ? polinizaciones : [];

  // Ya no necesitamos filtrar localmente porque la búsqueda se hace en el backend
  const filteredPolinizaciones = polinizacionesArray;

  return (
    <View style={styles.professionalTableContainer}>
      {/* Encabezado */}
      <View style={styles.tableHeaderSection}>
        <View style={styles.tableTitleContainer}>
          <Text style={styles.professionalTableTitle}>Mis Polinizaciones</Text>
          <Text style={styles.professionalTableSubtitle}>
            Registro y seguimiento de polinizaciones
          </Text>
        </View>
        <View style={styles.tableActionsContainer}>
          <TouchableOpacity
            style={styles.newItemButton}
            onPress={() => router.push('/(tabs)/addPolinizacion')}
          >
            <Ionicons name="add-circle" size={20} color={Colors.light.background} />
            <Text style={styles.newItemButtonText}>Nueva Polinización</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => {
              console.log('🔔 Botón Descargar PDF clickeado - Polinizaciones');
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
            value={searchPolinizaciones}
            onChangeText={setSearchPolinizaciones}
            onSubmitEditing={handleBuscarPolinizaciones}
          />
          {searchPolinizaciones.length > 0 && (
            <>
              <TouchableOpacity onPress={handleBuscarPolinizaciones} style={{ marginRight: 8 }}>
                <Ionicons name="search" size={20} color={Colors.light.tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setSearchPolinizaciones('');
                setPolinizacionesPage(1);
                fetchData();
              }}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Tabla de polinizaciones */}
      {filteredPolinizaciones.length === 0 ? (
        <View style={styles.listEmptyContainer}>
          <Ionicons name="leaf-outline" size={48} color="#6b7280" />
          <Text style={styles.listEmptyText}>
            {searchPolinizaciones ? 'No se encontraron polinizaciones' : 'No hay polinizaciones registradas'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchPolinizaciones ? 'Intenta con otros términos de búsqueda' : 'Las polinizaciones que registres aparecerán aquí'}
          </Text>
        </View>
      ) : (
        <View style={[styles.tableContainer, { marginHorizontal: 0, marginBottom: 0 }]}>
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
            <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
              <Text style={styles.headerText}>Fecha Est.</Text>
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
            {filteredPolinizaciones.map((item, index) => {
              // Construir especie completa
              const especieCompleta = item.nueva_planta_especie || item.especie || item.madre_especie || 'Sin especie';
              const generoCompleto = item.nueva_planta_genero || item.genero || item.madre_genero || 'Sin género';
              const codigoCompleto = item.codigo || item.nombre || item.nueva_codigo || item.madre_codigo || 'Sin código';
              const fechaFormateada = item.fechapol
                ? new Date(item.fechapol).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'Sin fecha';
              const estadoActual = item.fechamad ? 'Completado' :
                             (item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) <= new Date()) ? 'En Proceso' :
                             'Ingresado';

              // Calcular progreso de la polinización
              const calculateProgress = () => {
                if (item.fechamad) return 100; // Completado
                if (item.fechapol) return 70; // En proceso
                return 30; // Ingresado
              };
              const progress = calculateProgress();

              const tipo = item.tipo_polinizacion || item.tipo || 'SELF';
              const itemKey = item.numero?.toString() || item.id?.toString() || `pol-${index}`;
              const tipoColor = getTipoColor(tipo);
              const estadoColor = getEstadoColor(estadoActual);
              const isLastRow = index === filteredPolinizaciones.length - 1;

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
                    <View style={[styles.tableCell, { flex: 0.8, alignItems: 'center' }]}>
                      <View style={[styles.tipoBadge, { backgroundColor: tipoColor }]}>
                        <Text style={styles.tipoBadgeText}>{tipo}</Text>
                      </View>
                    </View>
                    <View style={[styles.tableCell, { flex: 1.2 }]}>
                      <Text style={styles.codigoText} numberOfLines={1} ellipsizeMode="tail">
                        {codigoCompleto}
                      </Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 2 }]}>
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
                      <Text style={styles.fechaText}>{fechaFormateada}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1.2 }]}>
                      {item.fecha_maduracion_predicha ? (
                        <View>
                          <Text style={[styles.fechaText, { fontSize: 11 }]}>
                            {new Date(item.fecha_maduracion_predicha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </Text>
                          {(() => {
                            const hoy = new Date();
                            hoy.setHours(0, 0, 0, 0);
                            const fechaEst = new Date(item.fecha_maduracion_predicha);
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
                          onPress={() => handleViewPolinizacion(item)}
                          style={styles.actionIconButton}
                        >
                          <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEditPolinizacion(item)}
                          style={styles.actionIconButton}
                        >
                          <Ionicons name="create-outline" size={20} color="#F59E0B" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeletePolinizacion(item)}
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
      {polinizacionesTotalPages > 1 && (
        <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
          <Text style={{ marginBottom: 8, textAlign: 'center', color: '#6b7280' }}>
            Mostrando {polinizaciones.length} de {polinizacionesTotalCount} polinizaciones
          </Text>
          <Pagination
            currentPage={polinizacionesPage}
            totalPages={polinizacionesTotalPages}
            goToPage={handlePolinizacionesPageChange}
            nextPage={handlePolinizacionesNextPage}
            prevPage={handlePolinizacionesPrevPage}
          />
        </View>
      )}
    </View>
  );
}
