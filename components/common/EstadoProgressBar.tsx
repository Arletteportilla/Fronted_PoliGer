import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

type EstadoType = 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO';

interface EstadoProgressBarProps {
  estadoActual: EstadoType;
  tipo?: 'germinacion' | 'polinizacion';
  onChangeEstado?: (nuevoEstado: EstadoType) => void;
}

export const EstadoProgressBar: React.FC<EstadoProgressBarProps> = ({
  estadoActual,
  tipo = 'germinacion',
  onChangeEstado,
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  // Definir las etapas con sus colores
  const etapas = [
    {
      id: 'INICIAL' as EstadoType,
      label: tipo === 'germinacion' ? 'Inicial' : 'Inicial',
      icon: 'play-circle' as const,
      color: '#3b82f6' // Azul
    },
    {
      id: 'EN_PROCESO_TEMPRANO' as EstadoType,
      label: 'Proceso\nTemprano',
      icon: 'leaf' as const,
      color: '#f59e0b' // Amarillo/Naranja
    },
    {
      id: 'EN_PROCESO_AVANZADO' as EstadoType,
      label: 'Avanzar\nProceso',
      icon: 'trending-up' as const,
      color: '#f97316' // Naranja
    },
    {
      id: 'FINALIZADO' as EstadoType,
      label: 'Finalizado',
      icon: 'flag' as const,
      color: '#10b981' // Verde
    }
  ];

  // Determinar el índice de la etapa actual
  const getEtapaIndex = (estado: EstadoType): number => {
    return etapas.findIndex(e => e.id === estado);
  };

  const etapaActualIndex = getEtapaIndex(estadoActual);

  // Función para determinar el estado de cada etapa
  const getEtapaEstado = (index: number): 'completed' | 'active' | 'pending' => {
    if (index < etapaActualIndex) return 'completed';
    if (index === etapaActualIndex) return 'active';
    return 'pending';
  };

  const handlePress = (etapa: { id: EstadoType }, index: number) => {
    if (!onChangeEstado) return;
    // Solo permitir avanzar al siguiente paso
    if (index === etapaActualIndex + 1) {
      onChangeEstado(etapa.id);
    }
  };

  return (
    <View style={styles.container}>
      {etapas.map((etapa, index) => {
        const estado = getEtapaEstado(index);
        const isLast = index === etapas.length - 1;
        const etapaColor = etapa.color;
        const nextEtapaColor = index < etapas.length - 1 ? (etapas[index + 1]?.color || etapaColor) : etapaColor;
        const isNextStep = !!onChangeEstado && index === etapaActualIndex + 1;

        const etapaContent = (
          <View style={styles.etapaContent}>
            {/* Círculo con icono */}
            <View
              style={[
                styles.circle,
                estado === 'completed' && {
                  backgroundColor: etapaColor,
                  borderColor: etapaColor,
                },
                estado === 'active' && {
                  backgroundColor: etapaColor,
                  borderColor: etapaColor,
                  shadowColor: etapaColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                },
                estado === 'pending' && styles.circlePending,
                isNextStep && {
                  borderColor: etapaColor,
                  borderStyle: 'dashed' as const,
                },
              ]}
            >
              {estado === 'completed' ? (
                <Ionicons name="checkmark" size={16} color={themeColors.text.inverse} />
              ) : estado === 'active' ? (
                <Ionicons name={etapa.icon} size={16} color={themeColors.text.inverse} />
              ) : isNextStep ? (
                <Ionicons name="arrow-forward" size={14} color={etapaColor} />
              ) : (
                <View style={styles.pendingDot} />
              )}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                estado === 'completed' && {
                  color: etapaColor,
                  fontWeight: '600',
                },
                estado === 'active' && {
                  color: etapaColor,
                  fontWeight: '700',
                },
                estado === 'pending' && styles.labelPending,
                isNextStep && {
                  color: etapaColor,
                  fontWeight: '600',
                },
              ]}
              numberOfLines={2}
            >
              {etapa.label}
            </Text>
          </View>
        );

        return (
          <View key={etapa.id} style={styles.etapaContainer}>
            {/* Etapa - clickeable solo si es el siguiente paso */}
            {isNextStep ? (
              <TouchableOpacity onPress={() => handlePress(etapa, index)} activeOpacity={0.6}>
                {etapaContent}
              </TouchableOpacity>
            ) : (
              etapaContent
            )}

            {/* Línea conectora */}
            {!isLast && (
              <View
                style={[
                  styles.line,
                  estado === 'completed' && {
                    backgroundColor: nextEtapaColor,
                  },
                  estado === 'active' && {
                    backgroundColor: themeColors.border.default,
                  },
                  estado === 'pending' && styles.linePending
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  etapaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  etapaContent: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  circlePending: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    color: colors.text.primary,
  },
  labelPending: {
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  line: {
    height: 2,
    flex: 1,
    marginTop: 15,
    marginHorizontal: 4,
  },
  linePending: {
    backgroundColor: colors.border.light,
  },
});
