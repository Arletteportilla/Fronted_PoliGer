import { useEffect, useState, useCallback } from 'react';
import { View, Modal, StyleSheet, Alert, ScrollView, Text, Pressable, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/navigation';
import { ResponsiveLayout } from '@/components/layout';
import { PrediccionMejoradaModal } from '@/components/modals';
import { germinacionService } from '@/services/germinacion.service';
import { useTheme } from '@/contexts/ThemeContext';
import { CONFIG } from '@/services/config';
import * as SecureStore from '@/services/secureStore';

// Extracted components and hooks
import { useResponsive } from '@/hooks/useResponsive';
import { useGerminaciones } from '@/hooks/useGerminaciones';
import { useGerminacionesWithFilters } from '@/hooks/useGerminacionesWithFilters';
import { GerminacionForm } from '@/components/forms/GerminacionForm';
import { GerminacionesHeader, GerminacionesContent } from '@/components/germinaciones';
import GerminacionFilters from '@/components/filters/GerminacionFilters';
import { DateFilterModal } from '@/components/filters/DateFilterModal';
import { logger } from '@/services/logger';

export default function GerminacionesScreen() {
  const { user } = useAuth();
  const responsive = useResponsive();
  const { colors: themeColors } = useTheme();

  // Use hook with pagination and filters
  const {
    germinaciones,
    loading,
    refreshing,
    filters,
    setFilters,
    activeFiltersCount,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    totalCount,
    currentPage,
    totalPages,
  } = useGerminacionesWithFilters();

  // Use old hook only for form management
  const germinacionesHook = useGerminaciones(user);

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
      logger.start(' Iniciando descarga de PDF de germinaciones...');

      // Obtener token de autenticación
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL usando el endpoint para TODAS las germinaciones del sistema
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);

      const url = `${CONFIG.API_BASE_URL}/germinaciones/germinaciones-pdf/?${params.toString()}`;
      logger.debug(` URL completa: ${url}`);

      // Crear nombre de archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      const searchSuffix = filters.search ? `_${filters.search.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const fileName = `germinaciones_todas${searchSuffix}_${timestamp}.pdf`;

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

        logger.success(' PDF de germinaciones descargado exitosamente en web');
        Alert.alert('Éxito', 'PDF de germinaciones descargado correctamente');
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
      console.error('❌ Error exportando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la exportación';
      Alert.alert('Error', `Error al exportar: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  }, [user, filters.search]);

  // Local state for UI
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detalle, setDetalle] = useState(null);

  // Prediction states (solo para mantener compatibilidad con el modal antiguo)
  const [showPrediccionModal, setShowPrediccionModal] = useState(false);
  const [prediccionData, setPrediccionData] = useState<any>(null);
  const [loadingPrediccion, setLoadingPrediccion] = useState(false);
  const [prediccionError, setPrediccionError] = useState<string | null>(null);

  // Initialize data loading
  useEffect(() => {
    logger.debug(' DEBUG - germinaciones.tsx useEffect fired, user:', user ? 'EXISTS' : 'NULL');
    logger.debug(' DEBUG - germinacionesHook:', germinacionesHook);
    logger.debug(' DEBUG - loadCodigosDisponibles exists:', !!germinacionesHook.loadCodigosDisponibles);

    if (user) {
      logger.debug(' DEBUG - About to call loadCodigosDisponibles');
      germinacionesHook.loadCodigosDisponibles();

      logger.debug(' DEBUG - About to call loadCodigosConEspecies');
      germinacionesHook.loadCodigosConEspecies();

      logger.debug(' DEBUG - About to call loadPerchasDisponibles');
      germinacionesHook.loadPerchasDisponibles();

      logger.success(' DEBUG - All load functions called');
    } else {
      logger.warn(' DEBUG - User is null, skipping data loading');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle form submission
  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Pasar la predicción si está disponible
      const success = await germinacionesHook.handleAddGerminacion(prediccionData);
      if (success) {
        setShowForm(false);
        germinacionesHook.resetForm();
        setPrediccionData(null); // Limpiar predicción
        setShowPrediccionModal(false); // Cerrar modal de predicción

        // Navegar a la página 1 para ver la nueva germinación
        goToPage(1);
      }
    } finally {
      setSaving(false);
    }
  };

  const styles = createStyles(themeColors);

  return (
    <ProtectedRoute requiredModule="germinaciones" requiredAction="ver">
      <ResponsiveLayout currentTab="germinaciones" style={styles.mainContainer}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <GerminacionesHeader
              totalGerminaciones={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              showOnlyMine={germinacionesHook.showOnlyMine}
              search={filters.search || ''}
              activeFiltersCount={activeFiltersCount}
              onToggleShowOnlyMine={() => germinacionesHook.setShowOnlyMine(!germinacionesHook.showOnlyMine)}
              onSearchChange={(text) => setFilters({ ...filters, search: text })}
              onShowForm={() => setShowForm(true)}
              onShowExportModal={() => handleExport()}
              onShowFilters={() => setShowFilters(true)}
            />

            {/* Tarjetas de Métricas */}
            <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Total en Proceso</Text>
                <View style={[styles.metricIcon, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="leaf" size={18} color="#10b981" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {germinaciones.filter(g => g.etapa_actual === 'EN_PROCESO').length}
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Éxito Promedio</Text>
                <View style={[styles.metricIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {totalCount > 0 
                    ? Math.round((germinaciones.filter(g => g.etapa_actual === 'LISTA').length / totalCount) * 100)
                    : 0}%
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Cosecha Semanal</Text>
                <View style={[styles.metricIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="calendar" size={18} color="#f59e0b" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {germinaciones.filter(g => {
                    const fecha = new Date(g.fecha_siembra || g.fecha_ingreso);
                    const hoy = new Date();
                    const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDias <= 7 && g.etapa_actual === 'LISTA';
                  }).length}
                </Text>
              </View>
            </View>
          </View>

          {/* Barra de búsqueda */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color={themeColors.text.disabled} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por ID de lote, especie o responsable..."
                placeholderTextColor={themeColors.text.disabled}
                value={filters.search || ''}
                onChangeText={(text) => setFilters({ ...filters, search: text })}
              />
              {filters.search && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setFilters({ ...filters, search: '' })}
                >
                  <Ionicons name="close-circle" size={20} color={themeColors.text.disabled} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowFilters(true)}
              >
                <Ionicons name="options-outline" size={18} color={themeColors.text.tertiary} />
                <Text style={styles.actionButtonText}>Filtros</Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowDateFilterModal(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={themeColors.text.tertiary} />
                <Text style={styles.actionButtonText}>Fecha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleExport()}
                disabled={isExporting}
              >
                <Ionicons name="download-outline" size={18} color={themeColors.text.tertiary} />
                <Text style={styles.actionButtonText}>{isExporting ? 'Exportando...' : 'Exportar'}</Text>
              </TouchableOpacity>
            </View>
          </View>

        <GerminacionesContent
          germinaciones={germinaciones}
          loading={loading}
          refreshing={refreshing}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          activeFiltersCount={activeFiltersCount}
          responsive={responsive}
          onRefresh={refresh}
          onShowFilters={() => setShowFilters(true)}
          onShowForm={() => setShowForm(true)}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onGoToPage={goToPage}
          onItemPress={setDetalle}
        />
          </View>
        </ScrollView>

        {/* Form Modal - Popup desde lateral derecho */}
        <Modal
          visible={showForm}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowForm(false)}
          presentationStyle="overFullScreen"
        >
          <View style={styles.formModalOverlayRight}>
            <View style={styles.formModalContentRight}>
              {/* Header del Modal */}
              <View style={styles.formModalHeaderRight}>
                <View style={styles.closeButtonRight}>
                  <TouchableOpacity
                    onPress={() => setShowForm(false)}
                    style={styles.closeButtonInnerRight}
                  >
                    <Ionicons name="close" size={24} color={themeColors.text.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.formModalTitleRight}>Nueva Germinación</Text>
                <View style={styles.placeholderRight} />
              </View>

              {/* Formulario */}
              <ScrollView 
                style={styles.formModalScrollViewRight} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formModalScrollContentRight}
              >
                <GerminacionForm
                  visible={true}
                  onClose={() => setShowForm(false)}
                  form={germinacionesHook.form}
                  setForm={germinacionesHook.setForm}
                  onSubmit={handleSubmit}
                  saving={saving}
                  codigosDisponibles={germinacionesHook.codigosDisponibles}
                  especiesDisponibles={germinacionesHook.especiesDisponibles}
                  perchasDisponibles={germinacionesHook.perchasDisponibles}
                  nivelesDisponibles={germinacionesHook.nivelesDisponibles}
                  handleCodigoSelection={germinacionesHook.handleCodigoSelection}
                  handleEspecieSelection={germinacionesHook.handleEspecieSelection}
                  useOwnModal={false}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Prediction Modal */}
        <PrediccionMejoradaModal
          visible={showPrediccionModal}
          onClose={() => setShowPrediccionModal(false)}
          onAceptar={() => setShowPrediccionModal(false)}
          prediccionData={prediccionData}
          loading={loadingPrediccion}
          error={prediccionError}
        />

        {/* Filters Modal - Popup Centrado */}
        <Modal
          visible={showFilters}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.filterModalOverlay}>
            <View style={styles.filterModalContent}>
              <GerminacionFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                  setShowFilters(false);
                }}
                onClose={() => setShowFilters(false)}
              />
            </View>
          </View>
        </Modal>

        {/* Modal de Filtro por Fecha */}
        <DateFilterModal
          visible={showDateFilterModal}
          onClose={() => setShowDateFilterModal(false)}
          onApply={(fechaDesde, fechaHasta) => {
            setFilters({
              ...filters,
              fecha_siembra_desde: fechaDesde,
              fecha_siembra_hasta: fechaHasta,
            });
          }}
          tipo="germinacion"
          fechaDesde={filters.fecha_siembra_desde}
          fechaHasta={filters.fecha_siembra_hasta}
        />

        {/* Modal de detalle */}
        <Modal
          visible={!!detalle}
          transparent
          animationType="fade"
          onRequestClose={() => setDetalle(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.detalleTitle}>Detalle de Germinación</Text>
              {detalle && (
                <ScrollView style={styles.detalleContent}>
                  {Object.entries(detalle)
                    .filter(([key]) => {
                      // Campos a excluir del detalle
                      const excludedFields = [
                        'id',
                        'fecha_creacion',
                        'fecha_actualizacion',
                        'creado_por',
                        'polinizacion',
                        'fecha_ultima_revision',
                        'prediccion_dias_estimados',
                        'prediccion_confianza',
                        'prediccion_fecha_estimada',
                        'prediccion_tipo',
                        'prediccion_condiciones_climaticas',
                        'prediccion_especie_info',
                        'prediccion_parametros_usados',
                        'fecha_germinacion_estimada_min',
                        'fecha_germinacion_estimada_max',
                        'rango_confianza_dias',
                        'precision_calculada',
                        'parametros_prediccion',
                        'fecha_calculo_prediccion',
                        'alerta_activada',
                        'estado_seguimiento',
                      ];
                      return !excludedFields.includes(key);
                    })
                    .map(([key, value]) => (
                      <View key={key} style={styles.detalleRow}>
                        <Text style={styles.detalleLabel}>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </Text>
                        <Text style={styles.detalleValue}>
                          {typeof value === 'string' && value.length > 50
                            ? `${value.slice(0, 50)}...`
                            : value === null || value === undefined
                            ? 'N/A'
                            : String(value)}
                        </Text>
                      </View>
                    ))}
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
      </ResponsiveLayout>
    </ProtectedRoute>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 14,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  metricBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.status.success,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  clearSearchButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    position: 'relative',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  actionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.status.success,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  actionBadgeText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '800',
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
  detalleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  detalleContent: {
    maxHeight: 400,
  },
  detalleRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detalleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    width: 140,
    marginRight: 12,
  },
  detalleValue: {
    fontSize: 14,
    color: colors.text.tertiary,
    flex: 1,
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
  formModalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formModalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '90%',
    maxWidth: 700,
    maxHeight: '85%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  formModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  formModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  formModalSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  formModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  formModalScrollView: {
    flex: 1,
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    maxHeight: '85%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  formModalOverlayRight: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  formModalContentRight: {
    backgroundColor: colors.background.primary,
    width: '85%',
    maxWidth: 600,
    height: '100%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1,
  },
  formModalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButtonRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonInnerRight: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formModalTitleRight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  placeholderRight: {
    width: 40,
  },
  formModalScrollViewRight: {
    maxHeight: '100%',
  },
  formModalScrollContentRight: {
    paddingBottom: 20,
  },
});