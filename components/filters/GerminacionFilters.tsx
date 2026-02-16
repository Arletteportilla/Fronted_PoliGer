import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { germinacionService } from '@/services/germinacion.service';
import { logger } from '@/services/logger';

export interface GerminacionFilterParams {
  search?: string | undefined;
  estado_capsulas?: string | undefined;
  clima?: string | undefined;
  responsable?: string | undefined;
  percha?: string | undefined;
  tipo_polinizacion?: string | undefined;
  fecha_siembra_desde?: string | undefined;
  fecha_siembra_hasta?: string | undefined;
}

interface GerminacionFiltersProps {
  filters: GerminacionFilterParams;
  onFiltersChange: (filters: GerminacionFilterParams) => void;
  onClose?: () => void;
}

export default function GerminacionFilters({
  filters,
  onFiltersChange,
  onClose,
}: GerminacionFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GerminacionFilterParams>(filters);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const options = await germinacionService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      logger.error('Error cargando opciones de filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    if (onClose) onClose();
  };

  const handleClearFilters = () => {
    const emptyFilters: GerminacionFilterParams = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const countActiveFilters = () => {
    return Object.keys(localFilters).filter(
      (key) => localFilters[key as keyof GerminacionFilterParams]
    ).length;
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Filtros</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas rápidas */}
      {filterOptions?.estadisticas && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filterOptions.estadisticas.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {filterOptions.estadisticas.por_estado?.CERRADA || 0}
              </Text>
              <Text style={styles.statLabel}>Cerradas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {filterOptions.estadisticas.por_estado?.ABIERTA || 0}
              </Text>
              <Text style={styles.statLabel}>Abiertas</Text>
            </View>
          </View>
        </View>
      )}

      {/* Búsqueda general */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Búsqueda</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código, especie, género..."
            value={localFilters.search || ''}
            onChangeText={(text) => setLocalFilters({ ...localFilters, search: text })}
            placeholderTextColor="#94a3b8"
          />
          {localFilters.search && (
            <TouchableOpacity
              onPress={() => setLocalFilters({ ...localFilters, search: '' })}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Estado de cápsula */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de Cápsula</Text>
        <View style={styles.chipContainer}>
          {filterOptions?.opciones?.estados?.map((estado: string) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.chip,
                localFilters.estado_capsulas === estado && styles.chipActive,
              ]}
              onPress={() =>
                setLocalFilters({
                  ...localFilters,
                  estado_capsulas:
                    localFilters.estado_capsulas === estado ? undefined : estado,
                })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  localFilters.estado_capsulas === estado && styles.chipTextActive,
                ]}
              >
                {estado}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Clima */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clima</Text>
        <View style={styles.chipContainer}>
          {filterOptions?.opciones?.climas?.map((clima: string) => (
            <TouchableOpacity
              key={clima}
              style={[
                styles.chip,
                localFilters.clima === clima && styles.chipActive,
              ]}
              onPress={() =>
                setLocalFilters({
                  ...localFilters,
                  clima: localFilters.clima === clima ? undefined : clima,
                })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  localFilters.clima === clima && styles.chipTextActive,
                ]}
              >
                {clima}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tipo de Polinización */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Polinización</Text>
        <View style={styles.chipContainer}>
          {filterOptions?.opciones?.tipos_polinizacion?.map((tipo: string) => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.chip,
                localFilters.tipo_polinizacion === tipo && styles.chipActive,
              ]}
              onPress={() =>
                setLocalFilters({
                  ...localFilters,
                  tipo_polinizacion:
                    localFilters.tipo_polinizacion === tipo ? undefined : tipo,
                })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  localFilters.tipo_polinizacion === tipo && styles.chipTextActive,
                ]}
              >
                {tipo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Responsable */}
      {filterOptions?.opciones?.responsables?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsable</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {filterOptions.opciones.responsables.slice(0, 10).map((resp: string) => (
                <TouchableOpacity
                  key={resp}
                  style={[
                    styles.chip,
                    localFilters.responsable === resp && styles.chipActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      responsable:
                        localFilters.responsable === resp ? undefined : resp,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.responsable === resp && styles.chipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {resp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Percha */}
      {filterOptions?.opciones?.perchas?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Percha</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {filterOptions.opciones.perchas.slice(0, 10).map((percha: string) => (
                <TouchableOpacity
                  key={percha}
                  style={[
                    styles.chip,
                    localFilters.percha === percha && styles.chipActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      percha: localFilters.percha === percha ? undefined : percha,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.percha === percha && styles.chipTextActive,
                    ]}
                  >
                    {percha}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={handleClearFilters}
        >
          <Ionicons name="refresh" size={20} color="#ef4444" />
          <Text style={styles.clearAllButtonText}>Limpiar ({countActiveFilters()})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  chipText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  clearAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 8,
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
