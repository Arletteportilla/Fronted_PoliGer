import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProtectedButton } from '@/components/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface PolinizacionesHeaderProps {
  totalPolinizaciones: number;
  currentPage?: number;
  totalPages?: number;
  onShowForm: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onDownloadPDF?: () => void;
  downloading?: boolean;
}

export const PolinizacionesHeader: React.FC<PolinizacionesHeaderProps> = ({
  totalPolinizaciones,
  currentPage = 1,
  totalPages = 1,
  onShowForm,
  onRefresh,
  refreshing = false,
  onDownloadPDF,
  downloading = false,
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  return (
    <>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Inicio</Text>
        <Text style={styles.breadcrumbSeparator}>/</Text>
        <Text style={styles.breadcrumbTextActive}>Polinizaciones</Text>
      </View>

      {/* Header Principal */}
      <View style={styles.mainHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.mainTitle}>Gestión de Polinizaciones</Text>
          <Text style={styles.mainSubtitle}>
            Administra y rastrea el progreso de los cruzamientos genéticos, desde la polinización hasta la cosecha de semillas.
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <ProtectedButton
            requiredModule="polinizaciones"
            requiredAction="crear"
            onPress={onShowForm}
            style={styles.newButton}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.newButtonText}>Nueva Polinización</Text>
          </ProtectedButton>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={themeColors.primary.main} />
            ) : (
              <Ionicons name="refresh" size={20} color={themeColors.primary.main} />
            )}
            <Text style={styles.refreshButtonText}>Actualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
            onPress={onDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 14,
    color: colors.text.disabled,
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 14,
    color: colors.border.medium,
  },
  breadcrumbTextActive: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    lineHeight: 20,
    maxWidth: 600,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  newButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.main,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.secondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
});
