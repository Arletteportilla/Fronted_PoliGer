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
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
      </View>
      
      <View style={styles.metricBody}>
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
  tipoRegistro?: 'historicos' | 'nuevos' | 'todos';
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onShowFilters: () => void;
  onShowExportModal: () => void;
  onTipoRegistroChange?: (tipo: 'historicos' | 'nuevos' | 'todos') => void;
  showFiltersSection?: boolean;
  children?: React.ReactNode;
}

export const PolinizacionesContent: React.FC<PolinizacionesContentProps> = ({
  totalPolinizaciones,
  tasaExito,
  cosechasRealizadas,
  search,
  activeFiltersCount,
  tipoRegistro = 'todos',
  onSearchChange,
  onClearSearch,
  onShowFilters,
  onShowExportModal,
  onTipoRegistroChange,
  showFiltersSection = false,
  children
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  return (
    <>
      {/* Métricas */}
      <View style={styles.metricsContainer}>
        <MetricCard
          title="POLINIZACIONES ACTIVAS"
          value={totalPolinizaciones}
          icon="flower-outline"
          iconColor={themeColors.primary.main}
          iconBg={themeColors.primary.light}
          styles={styles}
        />
        
        <MetricCard
          title="TASA DE ÉXITO (MES)"
          value={`${tasaExito}%`}
          icon="checkmark-circle-outline"
          iconColor={themeColors.accent.primary}
          iconBg={themeColors.accent.tertiary}
          styles={styles}
        />
        
        <MetricCard
          title="COSECHAS REALIZADAS"
          value={cosechasRealizadas}
          icon="leaf-outline"
          iconColor={themeColors.status.warning}
          iconBg={themeColors.status.warningLight}
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
            <Ionicons
              name={showFiltersSection ? "chevron-up-outline" : "options-outline"}
              size={18}
              color={themeColors.text.tertiary}
            />
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
          >
            <Ionicons name="download-outline" size={18} color={themeColors.text.tertiary} />
            <Text style={styles.actionButtonText}>Exportar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección de Filtros Expandible */}
      {showFiltersSection && (
        <View style={styles.filtersSection}>
          {children}
        </View>
      )}

      {/* Filtros de tipo de registro */}
      <View style={styles.filterTypeContainer}>
        <Text style={styles.filterTypeLabel}>Tipo de registro:</Text>
        <View style={styles.filterTypeButtons}>
          <TouchableOpacity
            style={[
              styles.filterTypeButton,
              tipoRegistro === 'todos' && styles.filterTypeButtonActive
            ]}
            onPress={() => onTipoRegistroChange?.('todos')}
          >
            <Ionicons 
              name="list" 
              size={16} 
              color={tipoRegistro === 'todos' ? '#FFFFFF' : themeColors.text.tertiary} 
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
            onPress={() => onTipoRegistroChange?.('nuevos')}
          >
            <Ionicons 
              name="add-circle" 
              size={16} 
              color={tipoRegistro === 'nuevos' ? '#FFFFFF' : themeColors.text.tertiary} 
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
            onPress={() => onTipoRegistroChange?.('historicos')}
          >
            <Ionicons 
              name="archive" 
              size={16} 
              color={tipoRegistro === 'historicos' ? '#FFFFFF' : themeColors.text.tertiary} 
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
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
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

  filtersSection: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
});
