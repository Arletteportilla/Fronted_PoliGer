import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface IndicadorConfianzaProps {
  confianza: number;
  nivel: 'alta' | 'media' | 'baja';
  modelo: 'ML' | 'HEURISTIC';
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  showModel?: boolean;
}

export const IndicadorConfianza: React.FC<IndicadorConfianzaProps> = ({
  confianza,
  nivel,
  modelo,
  size = 'medium',
  showPercentage = true,
  showModel = false
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const getConfianzaColor = (nivel: string) => {
    switch (nivel) {
      case 'alta': return '#28a745';
      case 'media': return '#ffc107';
      case 'baja': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getConfianzaIcon = (nivel: string) => {
    switch (nivel) {
      case 'alta': return 'shield-checkmark';
      case 'media': return 'shield-half';
      case 'baja': return 'shield-outline';
      default: return 'help-circle-outline';
    }
  };

  const getModeloIcon = (modelo: string) => {
    return modelo === 'ML' ? 'hardware-chip' : 'calculator';
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          icon: 16,
          text: styles.textSmall,
          bar: styles.barSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          icon: 28,
          text: styles.textLarge,
          bar: styles.barLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          icon: 20,
          text: styles.textMedium,
          bar: styles.barMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles(size);
  const color = getConfianzaColor(nivel);

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <View style={styles.header}>
        <Ionicons 
          name={getConfianzaIcon(nivel)} 
          size={sizeStyles.icon} 
          color={color} 
        />
        <View style={styles.info}>
          <Text style={[styles.nivelText, sizeStyles.text, { color }]}>
            {nivel.toUpperCase()}
          </Text>
          {showPercentage && (
            <Text style={[styles.percentageText, sizeStyles.text]}>
              {confianza}%
            </Text>
          )}
        </View>
        {showModel && (
          <View style={[styles.modeloBadge, { backgroundColor: modelo === 'ML' ? '#e9ad14' : '#6c757d' }]}>
            <Ionicons 
              name={getModeloIcon(modelo)} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.modeloText}>
              {modelo === 'ML' ? 'ML' : 'H'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.progressBar, sizeStyles.bar]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${confianza}%`,
              backgroundColor: color,
            }
          ]}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 8,
  },
  containerSmall: {
    padding: 6,
  },
  containerMedium: {
    padding: 8,
  },
  containerLarge: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  info: {
    marginLeft: 8,
    flex: 1,
  },
  nivelText: {
    fontWeight: 'bold',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  percentageText: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  modeloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  modeloText: {
    color: colors.text.inverse,
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 2,
  },
  progressBar: {
    backgroundColor: colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barSmall: {
    height: 4,
  },
  barMedium: {
    height: 6,
  },
  barLarge: {
    height: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default IndicadorConfianza;