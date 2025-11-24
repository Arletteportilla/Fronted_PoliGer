import { useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, View, TextInput, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigation } from '@/components/navigation';
import { PolinizacionCard } from '@/components/cards/PolinizacionCard';
import { PolinizacionForm } from '@/components/forms/PolinizacionForm';
import { usePolinizacionesWithFilters } from '@/hooks/usePolinizacionesWithFilters';
import { usePolinizaciones } from '@/hooks/usePolinizaciones';
import { getInitialFormState } from '@/utils/polinizacionConstants';
import PolinizacionFilters from '@/components/filters/PolinizacionFilters';
import Pagination from '@/components/filters/Pagination';
import type { PolinizacionFilterParams } from '@/types';
import { ExportModal } from '@/components/export';

export default function PolinizacionesScreen() {
  
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
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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

  const renderItem = ({ item }: { item: any }) => (
    <PolinizacionCard 
      item={item} 
      onPress={setDetalle}
      onEdit={handleEdit}
      onViewDetails={setDetalle}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e9ad14" />
        <Text style={styles.loadingText}>Cargando polinizaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Navegación con pestañas */}
      <TabNavigation currentTab="polinizaciones" />
      
      <View style={styles.container}>
        {/* Header con título y botón */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Polinizaciones</Text>
            <Text style={styles.subtitle}>
              Total: {totalCount} | Página {currentPage} de {totalPages}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFiltersModal(true)}
            >
              <Ionicons name="filter" size={20} color="#182d49" />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => setShowExportModal(true)}
            >
              <Ionicons name="download-outline" size={20} color="#182d49" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleNew}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Nueva Polinización</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInputNew}
              placeholder="Buscar por código, especie, género..."
              placeholderTextColor="#9ca3af"
              value={filters.search || ''}
              onChangeText={handleSearchChange}
            />
            {filters.search && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => setFilters({ ...filters, search: '' })}
              >
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

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

        {/* Modal de Filtros */}
        <Modal
          visible={showFiltersModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFiltersModal(false)}
        >
          <PolinizacionFilters
            filters={filters}
            onFiltersChange={handleApplyFilters}
            onClose={() => setShowFiltersModal(false)}
          />
        </Modal>

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

        {/* Lista de polinizaciones */}
        <FlatList
          data={polinizaciones}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || item.numero?.toString() || Math.random().toString()}
          refreshing={refreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="flower-outline" size={64} color="#e5e7eb" />
              <Text style={styles.emptyTitle}>No hay polinizaciones</Text>
              <Text style={styles.emptySubtitle}>
                {filters.search || activeFiltersCount > 0 ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera polinización'}
              </Text>
            </View>
          )}
        />

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

        {/* Export Modal */}
        <ExportModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          defaultEntity="polinizaciones"
          allowEntitySelection={false}
          title="Exportar Polinizaciones"
        />
      </View>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    maxWidth: 280,
    lineHeight: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e9ad14',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#F3F4F6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182d49',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputNew: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 4,
  },
  clearSearchButton: {
    marginLeft: 6,
    padding: 2,
  },
  resultsCounter: {
    marginTop: 6,
    alignItems: 'center',
  },
  resultsCounterText: {
    fontSize: 12,
    color: '#6b7280',
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
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
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
    width: 120,
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