import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProtectedButton } from '@/components/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface GerminacionesHeaderProps {
  onShowForm: () => void;
}

export const GerminacionesHeader: React.FC<GerminacionesHeaderProps> = ({
  onShowForm,
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  return (
    <>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Inicio</Text>
        <Text style={styles.breadcrumbSeparator}>/</Text>
        <Text style={styles.breadcrumbTextActive}>Germinaciones</Text>
      </View>

      {/* Header Principal */}
      <View style={styles.mainHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.mainTitle}>Gestión de Germinaciones</Text>
          <Text style={styles.mainSubtitle}>
            Administra y monitorea el ciclo de vida de los cultivos y lotes de germinación en tiempo real.
          </Text>
        </View>

        <ProtectedButton
          requiredModule="germinaciones"
          requiredAction="crear"
          onPress={onShowForm}
          style={styles.newButton}
        >
          <Ionicons name="add" size={18} color={themeColors.text.inverse} />
          <Text style={styles.newButtonText}>Nueva Germinación</Text>
        </ProtectedButton>
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
});
