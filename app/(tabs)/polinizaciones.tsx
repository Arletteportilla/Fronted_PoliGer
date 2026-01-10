import { useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, Modal, View, Text, Pressable, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { ResponsiveLayout } from '@/components/layout';
import { PolinizacionForm } from '@/components/forms/PolinizacionForm';
import { PolinizacionesHeader, PolinizacionesContent } from '@/components/polinizaciones';
import { usePolinizacionesWithFilters } from '@/hooks/usePolinizacionesWithFilters';
import { usePolinizaciones } from '@/hooks/usePolinizaciones';
import { getInitialFormState } from '@/utils/polinizacionConstants';
import PolinizacionFilters from '@/components/filters/PolinizacionFilters';
import { DateFilterModal } from '@/components/filters/DateFilterModal';
import Pagination from '@/components/filters/Pagination';
import type { PolinizacionFilterParams } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';
import { CONFIG } from '@/services/config';
import * as SecureStore from '@/services/secureStore';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/services/logger';

export default function PolinizacionesScreen() {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();

  // Usar el hook personalizado para polinizaciones con filtros
  const {
    polinizaciones,
    loading,
    refreshing,
    currentPage,
    totalPages,
    totalCount,
    filters,
    setFilters,
    activeFiltersCount,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  } = usePolinizacionesWithFilters();

  // Hook original solo para funciones de formulario
  const {
    getUserFullName,
    saving,
    prediccion,
    isPredicting,
    setPrediccion,
    handlePrediccion: hookHandlePrediccion,
    handleSave: hookHandleSave,
  } = usePolinizaciones();

  // Estado para exportación
  const [isExporting, setIsExporting] = useState(false);

  // Función de exportación usando el mismo endpoint que perfil
  const handleExport = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    setIsExporting(true);
    try {
      logger.start(' Iniciando descarga de PDF de polinizaciones...');

      // Obtener token de autenticación
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL usando el endpoint para TODAS las polinizaciones del sistema
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);

      const url = `${CONFIG.API_BASE_URL}/polinizaciones/polinizaciones-pdf/?${params.toString()}`;
      logger.debug(` URL completa: ${url}`);

      // Crear nombre de archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      const searchSuffix = filters.search ? `_${filters.search.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const fileName = `polinizaciones_todas${searchSuffix}_${timestamp}.pdf`;

      if (Platform.OS === 'web') {
        // Descarga para web
        logger.info('🌐 Descargando en web...');
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        // Crear enlace de descarga
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        logger.success(' PDF de polinizaciones descargado exitosamente en web');
        Alert.alert('Éxito', 'PDF de polinizaciones descargado correctamente');
      } else {
        // Descarga para móvil
        logger.info('📱 Descargando en móvil...');
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf'
          }
        });

        if (downloadResult.status === 200) {
          logger.success(' PDF descargado exitosamente:', downloadResult.uri);
          Alert.alert('Éxito', `PDF descargado en: ${downloadResult.uri}`);
        } else {
          throw new Error('Error al descargar el archivo');
        }
      }
    } catch (error) {
      logger.error('❌ Error exportando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la exportación';
      Alert.alert('Error', `Error al exportar: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  }, [user, filters.search]);

  // Estados locales del componente
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => getInitialFormState(getUserFullName));
  const [detalle, setDetalle] = useState(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Funciones para manejar el formulario
  const handleSave = async () => {
    const success = await hookHandleSave(form, isEditMode);
    if (success) {
      setShowForm(false);
      setForm(getInitialFormState(getUserFullName));
      setPrediccion(null);
      setIsEditMode(false);
      refresh(); // Refrescar la lista después de guardar
    }
  };

  const handleEdit = (item: any) => {
    // Mapear los datos de la polinización al formato del formulario
    setForm({
      ...getInitialFormState(getUserFullName),
      id: item.id || item.numero,
      fecha_polinizacion: item.fechapol,
      fecha_maduracion: item.fechamad || '',
      tipo_polinizacion: item.tipo_polinizacion || item.Tipo || 'SELF',
      madre_codigo: item.madre_codigo || '',
      madre_genero: item.madre_genero || item.genero || '',
      madre_especie: item.madre_especie || item.especie || '',
      madre_clima: item.madre_clima || 'I',
      padre_codigo: item.padre_codigo || '',
      padre_genero: item.padre_genero || '',
      padre_especie: item.padre_especie || '',
      padre_clima: item.padre_clima || 'I',
      nueva_codigo: item.nueva_codigo || '',
      nueva_genero: item.nueva_genero || '',
      nueva_especie: item.nueva_especie || '',
      nueva_clima: item.nueva_clima || 'I',
      vivero: item.vivero || '',
      mesa: item.mesa || '',
      pared: item.pared || '',
      ubicacion_tipo: item.ubicacion_tipo || 'vivero',
      ubicacion_nombre: item.ubicacion_nombre || '',
      cantidad_capsulas: item.cantidad_capsulas || 1,
      cantidad: item.cantidad || 1,
      responsable: item.responsable || getUserFullName(),
      observaciones: item.observaciones || '',
      estado: item.estado || 'INGRESADO',
    });
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleNew = () => {
    setForm(getInitialFormState(getUserFullName));
    setIsEditMode(false);
    setShowForm(true);
  };

  const handlePrediccionLocal = async () => {
    await hookHandlePrediccion(form);
  };

  const handleSearchChange = (text: string) => {
    setFilters({ ...filters, search: text });
  };

  const handleApplyFilters = (newFilters: PolinizacionFilterParams) => {
    setFilters(newFilters);
    setShowFiltersModal(false);
  };

  const handleApplyDateFilter = (fechaDesde?: string, fechaHasta?: string) => {
    setFilters({
      ...filters,
      fechapol_desde: fechaDesde,
      fechapol_hasta: fechaHasta,
    });
  };

  // Funciones auxiliares para el modal
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getTipoColor = (tipo: string) => {
    const tipoLower = tipo?.toUpperCase() || '';
    if (tipoLower === 'SELF') return '#10B981';
    if (tipoLower === 'SIBBLING') return '#3B82F6';
    if (tipoLower === 'HYBRID') return '#F59E0B';
    if (tipoLower === 'REPLANTE') return '#3b82f6';
    return '#6B7280';
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = estado?.toUpperCase() || '';
    if (estadoLower === 'INGRESADO' || estadoLower === 'PENDIENTE') return '#E5E7EB';
    if (estadoLower === 'EN_PROCESO') return '#DBEAFE';
    if (estadoLower === 'LISTO' || estadoLower === 'COMPLETADO') return '#D1FAE5';
    return '#F3F4F6';
  };

  const getEstadoTextColor = (estado: string) => {
    const estadoLower = estado?.toUpperCase() || '';
    // Colores oscuros para texto en fondos claros
    if (estadoLower === 'INGRESADO' || estadoLower === 'PENDIENTE') return '#374151';
    if (estadoLower === 'EN_PROCESO') return '#1E40AF';
    if (estadoLower === 'LISTO' || estadoLower === 'COMPLETADO') return '#065F46';
    return '#374151';
  };

  const styles = createStyles(themeColors);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando polinizaciones...</Text>
      </View>
    );
  }

  return (
    <ResponsiveLayout currentTab="polinizaciones" style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <PolinizacionesHeader
            totalPolinizaciones={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onShowForm={handleNew}
          />

          {/* Content con métricas y búsqueda */}
          <PolinizacionesContent
          totalPolinizaciones={124}
          tasaExito={85}
          cosechasRealizadas={32}
          search={filters.search || ''}
          activeFiltersCount={activeFiltersCount}
          isExporting={isExporting}
          onSearchChange={handleSearchChange}
          onClearSearch={() => setFilters({ ...filters, search: '' })}
          onShowFilters={() => setShowFiltersModal(true)}
          onShowDateFilter={() => setShowDateFilterModal(true)}
          onShowExportModal={() => handleExport()}
        />

          {/* Tabla de polinizaciones */}
          {polinizaciones.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="flower-outline" size={64} color={themeColors.border.default} />
              <Text style={styles.emptyTitle}>No hay polinizaciones</Text>
              <Text style={styles.emptySubtitle}>
                {filters.search || activeFiltersCount > 0 ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera polinización'}
              </Text>
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
                <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                  <Text style={styles.headerText}>Fecha Est.</Text>
                </View>
                <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                  <Text style={styles.headerText}>Estado</Text>
                </View>
              </View>

              {/* Filas de datos */}
              {polinizaciones.map((item, index) => {
                const especieCompleta = item.nueva_planta_especie || item.especie || item.madre_especie || 'Sin especie';
                const generoCompleto = item.nueva_planta_genero || item.genero || item.madre_genero || 'Sin género';
                const codigoCompleto = item.codigo || item.nombre || item.nueva_codigo || item.madre_codigo || 'Sin código';
                const fechaFormateada = item.fechapol
                  ? new Date(item.fechapol).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : 'Sin fecha';
                const estadoActual = item.fechamad ? 'Completado' :
                  (item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) <= new Date()) ? 'En Proceso' :
                  item.estado || 'Ingresado';

                const tipo = item.tipo_polinizacion || item.tipo || item.Tipo || 'SELF';
                const tipoColor = getTipoColor(tipo);
                const estadoTextColor = getEstadoTextColor(estadoActual);
                const isLastRow = index === polinizaciones.length - 1;

                return (
                  <View
                    key={item.id?.toString() || item.numero?.toString() || `pol-${index}`}
                    style={[
                      styles.tableRowContainer,
                      isLastRow && styles.tableRowContainerLast
                    ]}
                  >
                    <View style={styles.tableRow}>
                      <View style={[styles.tableCell, { flex: 0.8, alignItems: 'center' }]}>
                        <View style={[styles.tipoBadgeTable, { backgroundColor: tipoColor }]}>
                          <Text style={styles.tipoBadgeTableText}>{tipo}</Text>
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
                        <Text style={styles.fechaTextTable}>{fechaFormateada}</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        {item.fecha_maduracion_predicha ? (
                          <View>
                            <Text style={[styles.fechaTextTable, { fontSize: 11 }]}>
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
                          <Text style={[styles.fechaTextTable, { fontSize: 10, color: '#9CA3AF' }]}>
                            Sin predicción
                          </Text>
                        )}
                      </View>
                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                        <View style={[styles.estadoBadgeTable, { backgroundColor: getEstadoColor(estadoActual) }]}>
                          <Text style={[styles.estadoBadgeTableText, { color: estadoTextColor }]}>{estadoActual}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Barra de progreso por etapas */}
                    {item.estado_polinizacion && (
                      <View style={{
                        marginTop: 8,
                        marginHorizontal: 8,
                        marginBottom: 8,
                        backgroundColor: '#f9fafb',
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
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
              nextPage={nextPage}
              prevPage={prevPage}
            />
          )}
        </View>
      </ScrollView>

        {/* Modal de detalle */}
        <Modal
          visible={!!detalle}
          transparent
          animationType="fade"
          onRequestClose={() => setDetalle(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.detalleTitle}>Detalle de Polinización</Text>
                <Pressable onPress={() => setDetalle(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={themeColors.text.secondary} />
                </Pressable>
              </View>
              {detalle && (
                <ScrollView style={styles.detalleContent} showsVerticalScrollIndicator={false}>
                  {/* Información Básica */}
                  <View style={styles.detalleSection}>
                    <Text style={styles.sectionTitle}>Información Básica</Text>
                    <View style={styles.sectionContent}>
                      {detalle.codigo && (
                        <View style={styles.detalleRow}>
                          <Text style={styles.detalleLabel}>Código:</Text>
                          <Text style={styles.detalleValue}>{detalle.codigo}</Text>
                        </View>
                      )}
                      {detalle.numero && (
                        <View style={styles.detalleRow}>
                          <Text style={styles.detalleLabel}>Número:</Text>
                          <Text style={styles.detalleValue}>{detalle.numero}</Text>
                        </View>
                      )}
                      {detalle.tipo_polinizacion && (
                        <View style={styles.detalleRow}>
                          <Text style={styles.detalleLabel}>Tipo:</Text>
                          <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(detalle.tipo_polinizacion) }]}>
                            <Text style={styles.tipoBadgeText}>{detalle.tipo_polinizacion}</Text>
                          </View>
                        </View>
                      )}
                      {detalle.estado && (
                        <View style={styles.detalleRow}>
                          <Text style={styles.detalleLabel}>Estado:</Text>
                          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(detalle.estado) }]}>
                            <Text style={styles.estadoBadgeText}>{detalle.estado}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Fechas */}
                  <View style={styles.detalleSection}>
                    <Text style={styles.sectionTitle}>Fechas</Text>
                    <View style={styles.sectionContent}>
                      {detalle.fechapol && (
                        <View style={styles.detalleRow}>
                          <Ionicons name="calendar-outline" size={16} color={themeColors.text.tertiary} />
                          <Text style={styles.detalleLabel}>Fecha Polinización:</Text>
                          <Text style={styles.detalleValue}>{formatDate(detalle.fechapol)}</Text>
                        </View>
                      )}
                      {detalle.fechamad && (
                        <View style={styles.detalleRow}>
                          <Ionicons name="calendar-outline" size={16} color={themeColors.text.tertiary} />
                          <Text style={styles.detalleLabel}>Fecha Maduración:</Text>
                          <Text style={styles.detalleValue}>{formatDate(detalle.fechamad)}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Plantas Involucradas */}
                  {(detalle.madre_codigo || detalle.padre_codigo || detalle.nueva_codigo) && (
                    <View style={styles.detalleSection}>
                      <Text style={styles.sectionTitle}>Plantas Involucradas</Text>
                      <View style={styles.sectionContent}>
                        {detalle.madre_codigo && (
                          <View style={styles.plantaGroup}>
                            <Text style={styles.plantaTitle}>Planta Madre</Text>
                            <View style={styles.plantaDetails}>
                              {detalle.madre_codigo && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Código:</Text>
                                  <Text style={styles.detalleValue}>{detalle.madre_codigo}</Text>
                                </View>
                              )}
                              {detalle.madre_genero && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Género:</Text>
                                  <Text style={styles.detalleValue}>{detalle.madre_genero}</Text>
                                </View>
                              )}
                              {detalle.madre_especie && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Especie:</Text>
                                  <Text style={styles.detalleValue}>{detalle.madre_especie}</Text>
                                </View>
                              )}
                              {detalle.madre_clima && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Clima:</Text>
                                  <Text style={styles.detalleValue}>{detalle.madre_clima}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        )}
                        {detalle.padre_codigo && (
                          <View style={styles.plantaGroup}>
                            <Text style={styles.plantaTitle}>Planta Padre</Text>
                            <View style={styles.plantaDetails}>
                              {detalle.padre_codigo && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Código:</Text>
                                  <Text style={styles.detalleValue}>{detalle.padre_codigo}</Text>
                                </View>
                              )}
                              {detalle.padre_genero && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Género:</Text>
                                  <Text style={styles.detalleValue}>{detalle.padre_genero}</Text>
                                </View>
                              )}
                              {detalle.padre_especie && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Especie:</Text>
                                  <Text style={styles.detalleValue}>{detalle.padre_especie}</Text>
                                </View>
                              )}
                              {detalle.padre_clima && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Clima:</Text>
                                  <Text style={styles.detalleValue}>{detalle.padre_clima}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        )}
                        {detalle.nueva_codigo && (
                          <View style={styles.plantaGroup}>
                            <Text style={styles.plantaTitle}>Nueva Planta</Text>
                            <View style={styles.plantaDetails}>
                              {detalle.nueva_codigo && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Código:</Text>
                                  <Text style={styles.detalleValue}>{detalle.nueva_codigo}</Text>
                                </View>
                              )}
                              {detalle.nueva_genero && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Género:</Text>
                                  <Text style={styles.detalleValue}>{detalle.nueva_genero}</Text>
                                </View>
                              )}
                              {detalle.nueva_especie && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Especie:</Text>
                                  <Text style={styles.detalleValue}>{detalle.nueva_especie}</Text>
                                </View>
                              )}
                              {detalle.nueva_clima && (
                                <View style={styles.detalleRow}>
                                  <Text style={styles.detalleLabel}>Clima:</Text>
                                  <Text style={styles.detalleValue}>{detalle.nueva_clima}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Ubicación */}
                  {(detalle.vivero || detalle.mesa || detalle.pared || detalle.ubicacion) && (
                    <View style={styles.detalleSection}>
                      <Text style={styles.sectionTitle}>Ubicación</Text>
                      <View style={styles.sectionContent}>
                        {detalle.vivero && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="home-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Vivero:</Text>
                            <Text style={styles.detalleValue}>{detalle.vivero}</Text>
                          </View>
                        )}
                        {detalle.mesa && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="grid-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Mesa:</Text>
                            <Text style={styles.detalleValue}>{detalle.mesa}</Text>
                          </View>
                        )}
                        {detalle.pared && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="layers-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Pared:</Text>
                            <Text style={styles.detalleValue}>{detalle.pared}</Text>
                          </View>
                        )}
                        {detalle.ubicacion && !detalle.vivero && !detalle.mesa && !detalle.pared && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="location-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Ubicación:</Text>
                            <Text style={styles.detalleValue}>{detalle.ubicacion}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Cantidades */}
                  {(detalle.cantidad || detalle.cantidad_capsulas || detalle.cantidad_disponible !== undefined) && (
                    <View style={styles.detalleSection}>
                      <Text style={styles.sectionTitle}>Cantidades</Text>
                      <View style={styles.sectionContent}>
                        {detalle.cantidad && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="cube-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Cantidad:</Text>
                            <Text style={styles.detalleValue}>{detalle.cantidad}</Text>
                          </View>
                        )}
                        {detalle.cantidad_capsulas && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="ellipse-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Cápsulas:</Text>
                            <Text style={styles.detalleValue}>{detalle.cantidad_capsulas}</Text>
                          </View>
                        )}
                        {detalle.cantidad_disponible !== undefined && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="checkmark-circle-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Disponible:</Text>
                            <Text style={styles.detalleValue}>{detalle.cantidad_disponible}</Text>
                          </View>
                        )}
                        {detalle.disponible !== undefined && (
                          <View style={styles.detalleRow}>
                            <Ionicons name={detalle.disponible ? "checkmark-circle" : "close-circle"} size={16} color={detalle.disponible ? themeColors.status.success : themeColors.status.error} />
                            <Text style={styles.detalleLabel}>Estado Disponibilidad:</Text>
                            <Text style={[styles.detalleValue, { color: detalle.disponible ? themeColors.status.success : themeColors.status.error }]}>
                              {detalle.disponible ? 'Disponible' : 'No Disponible'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Responsable y Observaciones */}
                  {(detalle.responsable || detalle.observaciones) && (
                    <View style={styles.detalleSection}>
                      <Text style={styles.sectionTitle}>Información Adicional</Text>
                      <View style={styles.sectionContent}>
                        {detalle.responsable && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="person-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Responsable:</Text>
                            <Text style={styles.detalleValue}>
                              {typeof detalle.responsable === 'object' && detalle.responsable.first_name
                                ? `${detalle.responsable.first_name} ${detalle.responsable.last_name || ''}`.trim() || detalle.responsable.username
                                : detalle.responsable}
                            </Text>
                          </View>
                        )}
                        {detalle.observaciones && (
                          <View style={styles.detalleRowFull}>
                            <Ionicons name="document-text-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Observaciones:</Text>
                            <Text style={styles.detalleValue}>{detalle.observaciones}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Información del Sistema */}
                  {(detalle.fecha_creacion || detalle.fecha_actualizacion) && (
                    <View style={styles.detalleSection}>
                      <Text style={styles.sectionTitle}>Información del Sistema</Text>
                      <View style={styles.sectionContent}>
                        {detalle.fecha_creacion && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="time-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Fecha Creación:</Text>
                            <Text style={styles.detalleValue}>{formatDate(detalle.fecha_creacion)}</Text>
                          </View>
                        )}
                        {detalle.fecha_actualizacion && (
                          <View style={styles.detalleRow}>
                            <Ionicons name="time-outline" size={16} color={themeColors.text.tertiary} />
                            <Text style={styles.detalleLabel}>Última Actualización:</Text>
                            <Text style={styles.detalleValue}>{formatDate(detalle.fecha_actualizacion)}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </ScrollView>
              )}
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalButton} onPress={() => setDetalle(null)}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Filtros */}
        <Modal
          visible={showFiltersModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowFiltersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filtersModalContent}>
              <PolinizacionFilters
                filters={filters}
                onFiltersChange={handleApplyFilters}
                onClose={() => setShowFiltersModal(false)}
              />
            </View>
          </View>
        </Modal>

        {/* Modal de Filtro por Fecha */}
        <DateFilterModal
          visible={showDateFilterModal}
          onClose={() => setShowDateFilterModal(false)}
          onApply={handleApplyDateFilter}
          tipo="polinizacion"
          fechaDesde={filters.fechapol_desde}
          fechaHasta={filters.fechapol_hasta}
        />

        {/* Formulario de polinización */}
        <PolinizacionForm
          visible={showForm}
          onClose={() => setShowForm(false)}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onPrediccion={handlePrediccionLocal}
          saving={saving}
          isPredicting={isPredicting}
          prediccion={prediccion}
        />
    </ResponsiveLayout>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.background.secondary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  filtersModalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    width: '90%',
    maxWidth: 600,
    maxHeight: '85%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: 4,
  },
  detalleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  detalleContent: {
    maxHeight: 500,
  },
  detalleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  sectionContent: {
    gap: 8,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  detalleRowFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 8,
  },
  detalleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    minWidth: 120,
  },
  detalleValue: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  tipoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tipoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  estadoBadgeText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  plantaGroup: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  plantaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  plantaDetails: {
    gap: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
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
  tipoBadgeTable: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'center',
  },
  tipoBadgeTableText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
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
});