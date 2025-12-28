import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  styles: any;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon,
  iconColor,
  iconBg,
  styles,
}) => {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
      </View>
      
      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
};

interface PolinizacionesContentProps {
  totalPolinizaciones: number;
  tasaExito: number;
  cosechasRealizadas: number;
  search: string;
  activeFiltersCount: number;
  isExporting?: boolean;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onShowFilters: () => void;
  onShowExportModal: () => void;
}

export const PolinizacionesContent: React.FC<PolinizacionesContentProps> = ({
  totalPolinizaciones,
  tasaExito,
  cosechasRealizadas,
  search,
  activeFiltersCount,
  isExporting = false,
  onSearchChange,
  onClearSearch,
  onShowFilters,
  onShowExportModal,
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  return (
    <>
      {/* Métricas */}
      <View style={styles.metricsContainer}>
        <MetricCard
          title="Polinizaciones Activas"
          value={totalPolinizaciones}
          icon="flower-outline"
          iconColor="#10b981"
          iconBg="#d1fae5"
          styles={styles}
        />
        
        <MetricCard
          title="Tasa de Éxito"
          value={`${tasaExito}%`}
          icon="checkmark-circle-outline"
          iconColor="#3b82f6"
          iconBg="#dbeafe"
          styles={styles}
        />
        
        <MetricCard
          title="Cosechas Realizadas"
          value={cosechasRealizadas}
          icon="leaf-outline"
          iconColor="#f59e0b"
          iconBg="#fef3c7"
          styles={styles}
        />
      </View>

      {/* Barra de búsqueda moderna */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={themeColors.text.disabled} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código, especie..."
            placeholderTextColor={themeColors.text.disabled}
            value={search}
            onChangeText={onSearchChange}
          />
          {search && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={onClearSearch}
            >
              <Ionicons name="close-circle" size={20} color={themeColors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShowFilters}
          >
            <Ionicons name="options-outline" size={18} color={themeColors.text.tertiary} />
            <Text style={styles.actionButtonText}>Filtros</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={18} color={themeColors.text.tertiary} />
            <Text style={styles.actionButtonText}>Fecha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShowExportModal}
            disabled={isExporting}
          >
            <Ionicons name="download-outline" size={18} color={themeColors.text.tertiary} />
            <Text style={styles.actionButtonText}>{isExporting ? 'Exportando...' : 'Exportar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
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
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
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
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
  },
  metricChangePositive: {
    backgroundColor: colors.primary.light,
  },
  metricChangeNegative: {
    backgroundColor: colors.status.errorLight,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  metricChangeTextPositive: {
    color: colors.primary.main,
  },
  metricChangeTextNegative: {
    color: colors.status.error,
  },
  metricSubtitle: {
    fontSize: 13,
    color: colors.text.disabled,
    lineHeight: 18,
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
    backgroundColor: colors.primary.main,
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
});
