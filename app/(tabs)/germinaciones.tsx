import { useEffect, useState } from 'react';
import { View, Modal, StyleSheet, Alert, ScrollView, Text, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/navigation';
import { ResponsiveLayout } from '@/components/layout';
import { PrediccionMejoradaModal } from '@/components/modals';
import { germinacionService } from '@/services/germinacion.service';
import { ExportModal } from '@/components/export';
import { useTheme } from '@/contexts/ThemeContext';

// Extracted components and hooks
import { useResponsive } from '@/hooks/useResponsive';
import { useGerminaciones } from '@/hooks/useGerminaciones';
import { useGerminacionesWithFilters } from '@/hooks/useGerminacionesWithFilters';
import { GerminacionForm } from '@/components/forms/GerminacionForm';
import { GerminacionesHeader, GerminacionesContent } from '@/components/germinaciones';
import GerminacionFilters from '@/components/filters/GerminacionFilters';

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

  // Local state for UI
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [tipoRegistro, setTipoRegistro] = useState<'historicos' | 'nuevos' | 'todos'>('todos');

  // Prediction states (solo para mantener compatibilidad con el modal antiguo)
  const [showPrediccionModal, setShowPrediccionModal] = useState(false);
  const [prediccionData, setPrediccionData] = useState<any>(null);
  const [loadingPrediccion, setLoadingPrediccion] = useState(false);
  const [prediccionError, setPrediccionError] = useState<string | null>(null);

  // Initialize data loading
  useEffect(() => {
    console.log('🔍 DEBUG - germinaciones.tsx useEffect fired, user:', user ? 'EXISTS' : 'NULL');
    console.log('🔍 DEBUG - germinacionesHook:', germinacionesHook);
    console.log('🔍 DEBUG - loadCodigosDisponibles exists:', !!germinacionesHook.loadCodigosDisponibles);

    if (user) {
      console.log('🔍 DEBUG - About to call loadCodigosDisponibles');
      germinacionesHook.loadCodigosDisponibles();

      console.log('🔍 DEBUG - About to call loadCodigosConEspecies');
      germinacionesHook.loadCodigosConEspecies();

      console.log('🔍 DEBUG - About to call loadPerchasDisponibles');
      germinacionesHook.loadPerchasDisponibles();

      console.log('✅ DEBUG - All load functions called');
    } else {
      console.log('⚠️ DEBUG - User is null, skipping data loading');
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

  // Manejar cambio de tipo de registro
  const handleTipoRegistroChange = (tipo: 'historicos' | 'nuevos' | 'todos') => {
    console.log('🔄 Cambiando tipo de registro para germinaciones:', tipo);
    setTipoRegistro(tipo);
    
    const newFilters: any = {
      ...filters,
    };
    
    if (tipo !== 'todos') {
      newFilters.tipo_registro = tipo;
    } else {
      delete newFilters.tipo_registro;
    }
    
    setFilters(newFilters);
  };

  const styles = createStyles(themeColors);

  return (
    <ProtectedRoute requiredModule="germinaciones" requiredAction="ver">
      <ResponsiveLayout currentTab="germinaciones" style={styles.mainContainer}>
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
            onShowExportModal={() => setShowExportModal(true)}
            onShowFilters={() => setShowFilters(true)}
          />

          {/* Tarjetas de Métricas */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Total en Proceso</Text>
                <View style={[styles.metricIcon, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="leaf" size={20} color="#10b981" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {germinaciones.filter(g =>
                    g.estado_germinacion === 'EN_PROCESO' ||
                    g.estado_germinacion === 'EN_PROCESO_TEMPRANO' ||
                    g.estado_germinacion === 'EN_PROCESO_AVANZADO' ||
                    g.etapa_actual === 'EN_PROCESO'
                  ).length}
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Éxito Promedio</Text>
                <View style={[styles.metricIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {totalCount > 0
                    ? Math.round((germinaciones.filter(g =>
                        g.estado_germinacion === 'FINALIZADO' ||
                        g.etapa_actual === 'LISTA'
                      ).length / germinaciones.length) * 100)
                    : 0}%
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Finalizados</Text>
                <View style={[styles.metricIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="checkmark-done" size={20} color="#f59e0b" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {germinaciones.filter(g =>
                    g.estado_germinacion === 'FINALIZADO' ||
                    g.etapa_actual === 'LISTA'
                  ).length}
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
                <Ionicons name="options-outline" size={18} color={themeColors.text.secondary} />
                <Text style={styles.actionButtonText}>Filtros</Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="calendar-outline" size={18} color={themeColors.text.secondary} />
                <Text style={styles.actionButtonText}>Fecha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowExportModal(true)}
              >
                <Ionicons name="download-outline" size={18} color={themeColors.text.secondary} />
                <Text style={styles.actionButtonText}>Exportar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtros de tipo de registro */}
          <View style={styles.filterTypeContainer}>
            <Text style={styles.filterTypeLabel}>Tipo de registro:</Text>
            <View style={styles.filterTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.filterTypeButton,
                  tipoRegistro === 'todos' && styles.filterTypeButtonActive
                ]}
                onPress={() => handleTipoRegistroChange('todos')}
              >
                <Ionicons 
                  name="list" 
                  size={16} 
                  color={tipoRegistro === 'todos' ? themeColors.text.inverse : themeColors.text.tertiary} 
                />
                <Text style={[
                  styles.filterTypeButtonText,
                  tipoRegistro === 'todos' && styles.filterTypeButtonTextActive
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterTypeButton,
                  tipoRegistro === 'nuevos' && styles.filterTypeButtonActive
                ]}
                onPress={() => handleTipoRegistroChange('nuevos')}
              >
                <Ionicons 
                  name="add-circle" 
                  size={16} 
                  color={tipoRegistro === 'nuevos' ? themeColors.text.inverse : themeColors.text.tertiary} 
                />
                <Text style={[
                  styles.filterTypeButtonText,
                  tipoRegistro === 'nuevos' && styles.filterTypeButtonTextActive
                ]}>
                  Nuevos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterTypeButton,
                  tipoRegistro === 'historicos' && styles.filterTypeButtonActive
                ]}
                onPress={() => handleTipoRegistroChange('historicos')}
              >
                <Ionicons 
                  name="archive" 
                  size={16} 
                  color={tipoRegistro === 'historicos' ? themeColors.text.inverse : themeColors.text.tertiary} 
                />
                <Text style={[
                  styles.filterTypeButtonText,
                  tipoRegistro === 'historicos' && styles.filterTypeButtonTextActive
                ]}>
                  Históricos
                </Text>
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
        </ScrollView>

        {/* Form Modal - Popup Centrado */}
        <Modal
          visible={showForm}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowForm(false)}
        >
          <View style={styles.formModalOverlay}>
            <View style={styles.formModalContent}>
              {/* Header del Modal */}
              <View style={styles.formModalHeader}>
                <View>
                  <Text style={styles.formModalTitle}>Nueva Germinación</Text>
                  <Text style={styles.formModalSubtitle}>Completa los datos del formulario</Text>
                </View>
                <TouchableOpacity 
                  style={styles.formModalCloseButton}
                  onPress={() => setShowForm(false)}
                >
                  <Ionicons name="close" size={24} color={themeColors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Formulario */}
              <ScrollView style={styles.formModalScrollView}>
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

          {/* Export Modal */}
          <ExportModal
            visible={showExportModal}
            onClose={() => setShowExportModal(false)}
            defaultEntity="germinaciones"
            allowEntitySelection={false}
            title="Exportar Germinaciones"
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
  container: {
    flex: 1,
  },
  scrollContent: {
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
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  metricValue: {
    fontSize: 32,
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
    gap: 12,
    marginBottom: 24,
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    position: 'relative',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  
  filterTypeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginBottom: 16,
  },

  filterTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },

  filterTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  filterTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  filterTypeButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },

  filterTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
  },

  filterTypeButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
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
    color: colors.background.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    color: colors.primary.main,
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
    color: colors.text.primary,
    width: 140,
    marginRight: 12,
  },
  detalleValue: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  formModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    color: colors.text.secondary,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
});