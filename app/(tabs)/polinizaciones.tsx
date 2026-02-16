import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { ResponsiveLayout } from '@/components/layout';
import { PolinizacionForm } from '@/components/forms/PolinizacionForm';
import { PolinizacionesHeader, PolinizacionesContent, PolinizacionesTableContent } from '@/components/polinizaciones';
import { usePolinizacionesWithFilters } from '@/hooks/usePolinizacionesWithFilters';
import { usePolinizaciones } from '@/hooks/usePolinizaciones';
import { getInitialFormState } from '@/utils/polinizacionConstants';
import PolinizacionFilters from '@/components/filters/PolinizacionFilters';
import type { PolinizacionFilterParams } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { reportesService } from '@/services/reportes.service';
import { polinizacionService } from '@/services/polinizacion.service';
import { useToast } from '@/contexts/ToastContext';

export default function PolinizacionesScreen() {
  const { colors: themeColors } = useTheme();
  const { showToast } = useToast();

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

  // Estados locales del componente
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => getInitialFormState(getUserFullName));
  const [detalle, setDetalle] = useState(null);
  const [showFiltersSection, setShowFiltersSection] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState<'historicos' | 'nuevos' | 'todos'>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Métricas reales desde el backend
  const [metricas, setMetricas] = useState({ activas: 0, cosechas: 0, tasaExito: 0 });

  const fetchMetricas = useCallback(async () => {
    try {
      const stats = await polinizacionService.getStats(true);
      setMetricas({
        activas: stats.activas || 0,
        cosechas: stats.cosechas || 0,
        tasaExito: Math.round(stats.tasa_exito || 0)
      });
    } catch (err) {
      setMetricas({ activas: totalCount, cosechas: 0, tasaExito: 0 });
    }
  }, [totalCount]);

  useEffect(() => {
    fetchMetricas();
  }, [fetchMetricas]);

  // Funciones para manejar el formulario
  const handleSave = async () => {
    const success = await hookHandleSave(form, isEditMode);
    if (success) {
      setShowForm(false);
      setForm(getInitialFormState(getUserFullName));
      setPrediccion(null);
      setIsEditMode(false);
      refresh(); // Refrescar la lista después de guardar
      fetchMetricas(); // Refrescar métricas
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
      cantidad_solicitada: item.cantidad_solicitada?.toString() || '',
      cantidad_disponible: item.cantidad_disponible?.toString() || '',
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

  const handleTipoRegistroChange = (tipo: 'historicos' | 'nuevos' | 'todos') => {
    console.log('🔄 Cambiando tipo de registro:', tipo);
    setTipoRegistro(tipo);

    if (tipo === 'todos') {
      const { tipo_registro, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({
        ...filters,
        tipo_registro: tipo
      });
    }
  };

  const handleApplyFilters = (newFilters: PolinizacionFilterParams) => {
    setFilters(newFilters);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      // Preparar filtros
      const filtros: any = {};

      if (fechaDesde) {
        filtros.fecha_inicio = fechaDesde;
      }

      if (fechaHasta) {
        filtros.fecha_fin = fechaHasta;
      }

      // Llamar al servicio de reportes
      await reportesService.generarReportePolinizaciones('pdf', filtros);

      showToast('PDF descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      showToast('Error al descargar el PDF', 'error');
    } finally {
      setDownloading(false);
    }
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
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <PolinizacionesHeader
          totalPolinizaciones={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onShowForm={handleNew}
        />

        {/* Content con métricas y búsqueda */}
        <PolinizacionesContent
          totalPolinizaciones={metricas.activas}
          tasaExito={metricas.tasaExito}
          cosechasRealizadas={metricas.cosechas}
          search={filters.search || ''}
          activeFiltersCount={activeFiltersCount}
          tipoRegistro={tipoRegistro}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          downloading={downloading}
          onSearchChange={handleSearchChange}
          onClearSearch={() => setFilters({ ...filters, search: '' })}
          onShowFilters={() => setShowFiltersSection(!showFiltersSection)}
          onFechaDesdeChange={setFechaDesde}
          onFechaHastaChange={setFechaHasta}
          onTipoRegistroChange={handleTipoRegistroChange}
          onDownloadPDF={handleDownloadPDF}
          showFiltersSection={showFiltersSection}
        >
          <PolinizacionFilters
            filters={filters}
            onFiltersChange={handleApplyFilters}
            inline={true}
          />
        </PolinizacionesContent>

        {/* Tabla de polinizaciones */}
        <PolinizacionesTableContent
          polinizaciones={polinizaciones}
          loading={loading}
          refreshing={refreshing}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          activeFiltersCount={activeFiltersCount}
          tipoRegistro={tipoRegistro}
          onRefresh={refresh}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onGoToPage={goToPage}
          onItemPress={setDetalle}
          onEdit={handleEdit}
        />
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
            <Text style={styles.detalleTitle}>Detalle de Polinización</Text>
            {detalle && (
              <ScrollView style={styles.detalleContent}>
                {Object.entries(detalle)
                  .filter(([key]) => {
                    // Campos a excluir del detalle
                    const excludedFields = [
                      'fechapol',
                      'fechamad',
                      'madre_codigo',
                      'madre_genero',
                      'madre_especie',
                      'madre_clima',
                      'padre_codigo',
                      'padre_genero',
                      'padre_clima',
                      'padre_especie',
                      'nueva_codigo',
                      'nueva_genero',
                      'nueva_clima',
                      'nueva_especie',
                      'ubicacion_tipo',
                      'ubicacion_nombre',
                      'prediccion_dias_estimados',
                      'prediccion_confianza',
                      'prediccion_fecha_estimada',
                      'prediccion_tipo',
                      'prediccion_condiciones_climaticas',
                      'prediccion_especie_info',
                      'prediccion_parametros_usados',
                    ];
                    return !excludedFields.includes(key);
                  })
                  .map(([key, value]) => (
                    <View key={key} style={styles.detalleRow}>
                      <Text style={styles.detalleLabel}>{key}:</Text>
                      <Text style={styles.detalleValue}>
                        {typeof value === 'string' && value.length > 50
                          ? `${value.slice(0, 50)}...`
                          : String(value || 'N/A')}
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

      {/* Modal de Filtros - Ahora se muestra inline en PolinizacionesContent */}

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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
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
  detalleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent.primary,
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
    width: 120,
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
});