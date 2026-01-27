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
  // Definir las etapas con sus colores
  const etapas = [
    {
      id: 'INICIAL',
      label: tipo === 'germinacion' ? 'Inicial' : 'Inicial',
      icon: 'play-circle' as const,
      color: '#3b82f6' // Azul
    },
    {
      id: 'EN_PROCESO_TEMPRANO',
      label: 'Proceso\nTemprano',
      icon: 'leaf' as const,
      color: '#f59e0b' // Amarillo/Naranja
    },
    {
      id: 'EN_PROCESO_AVANZADO',
      label: 'Avanzar\nProceso',
      icon: 'trending-up' as const,
      color: '#f97316' // Naranja
    },
    {
      id: 'FINALIZADO',
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

  return (
    <View style={styles.container}>
      {etapas.map((etapa, index) => {
        const estado = getEtapaEstado(index);
        const isLast = index === etapas.length - 1;
        const etapaColor = etapa.color;
        const nextEtapaColor = index < etapas.length - 1 ? etapas[index + 1].color : etapaColor;

        return (
          <View key={etapa.id} style={styles.etapaContainer}>
            {/* Etapa */}
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
                  estado === 'pending' && styles.circlePending
                ]}
              >
                {estado === 'completed' ? (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                ) : estado === 'active' ? (
                  <Ionicons name={etapa.icon} size={16} color="#ffffff" />
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
                  estado === 'completed' && {
                    backgroundColor: nextEtapaColor,
                  },
                  estado === 'active' && {
                    backgroundColor: '#d1d5db',
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

const styles = StyleSheet.create({
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
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  labelPending: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  line: {
    height: 2,
    flex: 1,
    marginTop: 15,
    marginHorizontal: 4,
  },
  linePending: {
    backgroundColor: '#e5e7eb',
  },
});
