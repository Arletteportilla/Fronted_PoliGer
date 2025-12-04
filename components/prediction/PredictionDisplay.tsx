import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Helper para calcular días faltantes
const calcularDiasFaltantes = (fechaEstimada: string): number => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaEstimada);
  fecha.setHours(0, 0, 0, 0);
  return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

// Helper para calcular días transcurridos
const calcularDiasTranscurridos = (fechaInicio: string): number => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);
  return Math.ceil((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
};

interface PredictionDisplayProps {
  prediccionData: any;
  loadingPrediccion: boolean;
  fechaInicio: string; // fecha_siembra para germinaciones, fecha_polinizacion para polinizaciones
  tipo: 'germinacion' | 'polinizacion';
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  prediccionData,
  loadingPrediccion,
  fechaInicio,
  tipo,
}) => {
  // Determinar labels según el tipo
  const labels = {
    germinacion: {
      titulo: 'Predicción de Germinación',
      fechaLabel: 'Fecha Estimada de Germinación',
      diasEstimados: 'Días estimados desde la siembra',
    },
    polinizacion: {
      titulo: 'Predicción de Polinización',
      fechaLabel: 'Fecha Estimada de Polinización',
      diasEstimados: 'Días estimados desde la polinización',
    },
  };

  const label = labels[tipo];

  // Si no hay predicción ni está cargando, no mostrar nada
  if (!prediccionData && !loadingPrediccion) {
    return null;
  }

  return (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name="analytics-outline" size={20} color="#e9ad14" />
        </View>
        <Text style={styles.sectionTitle}>{label.titulo}</Text>
      </View>

      {loadingPrediccion ? (
        <View style={styles.prediccionLoading}>
          <ActivityIndicator size="small" color="#e9ad14" />
          <Text style={styles.prediccionLoadingText}>Calculando predicción...</Text>
        </View>
      ) : prediccionData && prediccionData.prediccion && prediccionData.prediccion.fecha_estimada ? (
        <View style={styles.prediccionContainer}>
          <View style={styles.prediccionCard}>
            <View style={styles.prediccionHeader}>
              <Ionicons name="calendar" size={24} color="#3B82F6" />
              <Text style={styles.prediccionTitle}>{label.fechaLabel}</Text>
            </View>
            <Text style={styles.prediccionFecha}>
              {new Date(prediccionData.prediccion.fecha_estimada).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>

            {(() => {
              const diasFaltantes = calcularDiasFaltantes(prediccionData.prediccion.fecha_estimada);
              const diasTranscurridos = calcularDiasTranscurridos(fechaInicio);
              const diasTotales = prediccionData.prediccion.dias_estimados || 30;
              const progreso = Math.min(Math.max((diasTranscurridos / diasTotales) * 100, 0), 100);

              return (
                <>
                  <View style={styles.diasFaltantesContainer}>
                    <View
                      style={[
                        styles.diasFaltantesBadge,
                        {
                          backgroundColor:
                            diasFaltantes < 0
                              ? '#FEE2E2'
                              : diasFaltantes === 0
                              ? '#D1FAE5'
                              : diasFaltantes <= 7
                              ? '#FEF3C7'
                              : '#DBEAFE',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          diasFaltantes < 0
                            ? 'alert-circle'
                            : diasFaltantes === 0
                            ? 'checkmark-circle'
                            : diasFaltantes <= 7
                            ? 'time'
                            : 'hourglass'
                        }
                        size={20}
                        color={
                          diasFaltantes < 0
                            ? '#EF4444'
                            : diasFaltantes === 0
                            ? '#10B981'
                            : diasFaltantes <= 7
                            ? '#F59E0B'
                            : '#3B82F6'
                        }
                      />
                      <Text
                        style={[
                          styles.diasFaltantesText,
                          {
                            color:
                              diasFaltantes < 0
                                ? '#EF4444'
                                : diasFaltantes === 0
                                ? '#10B981'
                                : diasFaltantes <= 7
                                ? '#F59E0B'
                                : '#3B82F6',
                          },
                        ]}
                      >
                        {diasFaltantes < 0
                          ? `Vencida hace ${Math.abs(diasFaltantes)} días`
                          : diasFaltantes === 0
                          ? '¡Hoy es el día estimado!'
                          : `Faltan ${diasFaltantes} días`}
                      </Text>
                    </View>
                  </View>

                  {/* Barra de progreso del ciclo */}
                  <View style={styles.progresoContainer}>
                    <View style={styles.progresoHeader}>
                      <Ionicons name="trending-up" size={16} color="#6B7280" />
                      <Text style={styles.progresoLabel}>Progreso del ciclo:</Text>
                      <Text style={styles.progresoTexto}>
                        {diasTranscurridos} de {diasTotales} días ({Math.round(progreso)}%)
                      </Text>
                    </View>
                    <View style={styles.progresoBarContainer}>
                      <View
                        style={[
                          styles.progresoBarFill,
                          {
                            width: `${progreso}%`,
                            backgroundColor:
                              progreso >= 100
                                ? '#10B981'
                                : progreso >= 75
                                ? '#F59E0B'
                                : progreso >= 50
                                ? '#3B82F6'
                                : '#6B7280',
                          },
                        ]}
                      />
                    </View>
                  </View>
                </>
              );
            })()}

            {prediccionData.prediccion.dias_estimados && (
              <View style={styles.prediccionInfo}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.prediccionInfoText}>
                  {label.diasEstimados}: {prediccionData.prediccion.dias_estimados} días
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(233, 173, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#182d49',
  },
  prediccionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  prediccionLoadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 12,
  },
  prediccionContainer: {
    marginTop: 8,
  },
  prediccionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  prediccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prediccionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182d49',
    marginLeft: 8,
  },
  prediccionFecha: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  diasFaltantesContainer: {
    marginBottom: 12,
  },
  diasFaltantesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  diasFaltantesText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
  progresoContainer: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progresoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progresoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
    marginRight: 8,
  },
  progresoTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  progresoBarContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progresoBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  prediccionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  prediccionInfoText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
});
