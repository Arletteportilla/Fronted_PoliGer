import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type EstadoType = 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO';

interface EstadoProgressBarProps {
  estadoActual: EstadoType;
  tipo?: 'germinacion' | 'polinizacion';
}

export const EstadoProgressBar: React.FC<EstadoProgressBarProps> = ({
  estadoActual,
  tipo = 'germinacion'
}) => {
  // Definir las etapas
  const etapas = [
    {
      id: 'INICIAL',
      label: tipo === 'germinacion' ? 'Inicial' : 'Inicial',
      icon: 'play-circle' as const
    },
    {
      id: 'EN_PROCESO_TEMPRANO',
      label: 'Proceso\nTemprano',
      icon: 'leaf' as const
    },
    {
      id: 'EN_PROCESO_AVANZADO',
      label: 'Avanzar\nProceso',
      icon: 'trending-up' as const
    },
    {
      id: 'FINALIZADO',
      label: 'Finalizado',
      icon: 'flag' as const
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

  return (
    <View style={styles.container}>
      {etapas.map((etapa, index) => {
        const estado = getEtapaEstado(index);
        const isLast = index === etapas.length - 1;

        return (
          <View key={etapa.id} style={styles.etapaContainer}>
            {/* Etapa */}
            <View style={styles.etapaContent}>
              {/* Círculo con icono */}
              <View
                style={[
                  styles.circle,
                  estado === 'completed' && styles.circleCompleted,
                  estado === 'active' && styles.circleActive,
                  estado === 'pending' && styles.circlePending
                ]}
              >
                {estado === 'completed' ? (
                  <Ionicons name="checkmark" size={10} color="#ffffff" />
                ) : estado === 'active' ? (
                  <Ionicons name={etapa.icon} size={10} color="#ffffff" />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  estado === 'completed' && styles.labelCompleted,
                  estado === 'active' && styles.labelActive,
                  estado === 'pending' && styles.labelPending
                ]}
                numberOfLines={2}
              >
                {etapa.label}
              </Text>
            </View>

            {/* Línea conectora */}
            {!isLast && (
              <View
                style={[
                  styles.line,
                  estado === 'completed' && styles.lineCompleted,
                  estado === 'active' && styles.lineActive,
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  etapaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  etapaContent: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  circleCompleted: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  circleActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  circlePending: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  pendingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#d1d5db',
  },
  label: {
    fontSize: 7,
    textAlign: 'center',
    lineHeight: 9,
  },
  labelCompleted: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  labelActive: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  labelPending: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  line: {
    height: 1.5,
    flex: 1,
    marginTop: 9,
    marginHorizontal: 1,
  },
  lineCompleted: {
    backgroundColor: '#3b82f6',
  },
  lineActive: {
    backgroundColor: '#d1d5db',
  },
  linePending: {
    backgroundColor: '#e5e7eb',
  },
});
