import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProtectedButton } from '@/components/navigation';

interface GerminacionesHeaderProps {
  totalGerminaciones: number;
  currentPage?: number;
  totalPages?: number;
  showOnlyMine: boolean;
  search: string;
  activeFiltersCount?: number;
  onToggleShowOnlyMine: () => void;
  onSearchChange: (text: string) => void;
  onShowForm: () => void;
  onShowExportModal?: () => void;
  onShowFilters?: () => void;
}

export const GerminacionesHeader: React.FC<GerminacionesHeaderProps> = ({
  totalGerminaciones,
  currentPage = 1,
  totalPages = 1,
  showOnlyMine,
  search,
  activeFiltersCount = 0,
  onToggleShowOnlyMine,
  onSearchChange,
  onShowForm,
  onShowExportModal,
  onShowFilters,
}) => {
  return (
    <>
      {/* Header - Estilo de Polinizaciones */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Germinaciones</Text>
          <Text style={styles.subtitle}>
            Total: {totalGerminaciones} | Página {currentPage} de {totalPages}
          </Text>
        </View>

        <View style={styles.headerButtons}>
          {onShowFilters && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={onShowFilters}
            >
              <Ionicons name="filter" size={20} color="#182d49" />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {onShowExportModal && (
            <TouchableOpacity
              style={styles.exportButton}
              onPress={onShowExportModal}
            >
              <Ionicons name="download-outline" size={20} color="#182d49" />
            </TouchableOpacity>
          )}

          <ProtectedButton
            requiredModule="germinaciones"
            requiredAction="crear"
            onPress={onShowForm}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Nueva Germinación</Text>
          </ProtectedButton>
        </View>
      </View>

      {/* Barra de búsqueda - Estilo de Polinizaciones */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código, especie, género..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={onSearchChange}
          />
          {search && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => onSearchChange('')}
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearSearchButton: {
    padding: 4,
  },
});