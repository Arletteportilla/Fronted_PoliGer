import { useEffect, useState } from 'react';
import { View, Modal, StyleSheet, Alert, ScrollView, Text, Pressable } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/navigation';
import { TabNavigation } from '@/components/navigation';
import { PrediccionMejoradaModal } from '@/components/modals';
import { germinacionService } from '@/services/germinacion.service';
import { ExportModal } from '@/components/export';

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
        refresh(); // Refresh paginated list
      }
    } finally {
      setSaving(false);
    }
  };


  return (
    <ProtectedRoute requiredModule="germinaciones" requiredAction="ver">
      <View style={styles.mainContainer}>
        <TabNavigation currentTab="germinaciones" />

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
            onShowExportModal={() => setShowExportModal(true)}
            onShowFilters={() => setShowFilters(true)}
          />

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

        {/* Form Modal */}
        <GerminacionForm
          visible={showForm}
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
        />

        {/* Prediction Modal */}
        <PrediccionMejoradaModal
          visible={showPrediccionModal}
          onClose={() => setShowPrediccionModal(false)}
          onAceptar={() => setShowPrediccionModal(false)}
          prediccionData={prediccionData}
          loading={loadingPrediccion}
          error={prediccionError}
        />

        {/* Filters Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowFilters(false)}
        >
          <GerminacionFilters
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setShowFilters(false);
            }}
            onClose={() => setShowFilters(false)}
          />
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
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  detalleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#182d49',
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
    borderBottomColor: '#f3f4f6',
  },
  detalleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 140,
    marginRight: 12,
  },
  detalleValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#182d49',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});