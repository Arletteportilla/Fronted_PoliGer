import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GerminacionCard } from '@/components/cards/GerminacionCard';
import Pagination from '@/components/filters/Pagination';

interface GerminacionesContentProps {
  germinaciones: any[];
  loading: boolean;
  refreshing: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  activeFiltersCount: number;
  responsive: any;
  onRefresh: () => void;
  onShowFilters: () => void;
  onShowForm: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onItemPress?: (item: any) => void;
}

export const GerminacionesContent: React.FC<GerminacionesContentProps> = ({
  germinaciones,
  loading,
  refreshing,
  totalCount,
  currentPage,
  totalPages,
  activeFiltersCount,
  responsive,
  onRefresh,
  onShowFilters,
  onShowForm,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onItemPress,
}) => {
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e9ad14" />
        <Text style={styles.loadingText}>Cargando germinaciones...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Lista de germinaciones - OPTIMIZADA con virtualización */}
      <FlatList
        data={germinaciones}
        renderItem={({ item }) => (
          <GerminacionCard
            item={item}
            onPress={onItemPress || (() => {})}
          />
        )}
        keyExtractor={(item) => `${item.id}-${item.codigo}`}
        refreshing={refreshing}
        onRefresh={onRefresh}
        windowSize={10}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#e5e7eb" />
            <Text style={styles.emptyTitle}>No hay germinaciones</Text>
            <Text style={styles.emptySubtitle}>
              {activeFiltersCount > 0 ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera germinación'}
            </Text>
          </View>
        )}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={onGoToPage}
          nextPage={onNextPage}
          prevPage={onPrevPage}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
});