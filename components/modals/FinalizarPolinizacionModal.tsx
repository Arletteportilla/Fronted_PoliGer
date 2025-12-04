import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { Polinizacion } from '@/types';

interface FinalizarPolinizacionModalProps {
  visible: boolean;
  polinizacion: Polinizacion | null;
  onClose: () => void;
  onConfirm: (fechaMaduracion: string) => Promise<void>;
}

export const FinalizarPolinizacionModal: React.FC<FinalizarPolinizacionModalProps> = ({
  visible,
  polinizacion,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!polinizacion) return null;

  // Calcular fecha predicha y fecha actual
  const fechaPredicha = polinizacion.fecha_maduracion_predicha || polinizacion.prediccion_fecha_estimada;
  const hoy = new Date().toISOString().split('T')[0];

  // Inicializar con fecha de hoy si no hay selección
  const fechaSeleccionada = selectedDate || hoy;

  const handleConfirm = async () => {
    if (!fechaSeleccionada) {
      alert('Por favor selecciona una fecha de maduración');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(fechaSeleccionada);
      setSelectedDate('');
      onClose();
    } catch (error) {
      console.error('Error finalizando polinización:', error);
      alert('Error al finalizar la polinización');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedDate('');
    onClose();
  };

  // Calcular diferencia de días
  const calcularDiferenciaDias = () => {
    if (!fechaPredicha || !fechaSeleccionada) return null;

    const fechaPred = new Date(fechaPredicha);
    const fechaSel = new Date(fechaSeleccionada);
    const diffTime = fechaSel.getTime() - fechaPred.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const diferenciaDias = calcularDiferenciaDias();

  // Marcar fechas en el calendario
  const markedDates: any = {};

  // Marcar fecha predicha
  if (fechaPredicha) {
    markedDates[fechaPredicha] = {
      marked: true,
      dotColor: '#0ea5e9',
      customStyles: {
        container: {
          backgroundColor: '#eff6ff',
          borderColor: '#0ea5e9',
          borderWidth: 2,
        },
        text: {
          color: '#1e40af',
          fontWeight: 'bold',
        },
      },
    };
  }

  // Marcar fecha seleccionada
  if (fechaSeleccionada) {
    markedDates[fechaSeleccionada] = {
      ...markedDates[fechaSeleccionada],
      selected: true,
      selectedColor: '#0ea5e9',
      customStyles: {
        container: {
          backgroundColor: '#0ea5e9',
        },
        text: {
          color: '#ffffff',
          fontWeight: 'bold',
        },
      },
    };
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="checkmark-circle" size={32} color="#0ea5e9" />
              </View>
              <Text style={styles.title}>Finalizar Polinización</Text>
              <Text style={styles.subtitle}>
                {polinizacion.codigo || polinizacion.nueva_codigo}
              </Text>
            </View>

            {/* Información de la polinización */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="leaf-outline" size={16} color="#64748b" />
                <Text style={styles.infoLabel}>Especie:</Text>
                <Text style={styles.infoValue}>
                  {polinizacion.nueva_especie || polinizacion.especie || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text style={styles.infoLabel}>Fecha de polinización:</Text>
                <Text style={styles.infoValue}>
                  {polinizacion.fechapol
                    ? new Date(polinizacion.fechapol).toLocaleDateString('es-ES')
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Predicción vs Realidad */}
            {fechaPredicha && (
              <View style={styles.comparisonSection}>
                <Text style={styles.comparisonTitle}>Predicción vs Realidad</Text>
                
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonItem}>
                    <Ionicons name="analytics-outline" size={20} color="#0ea5e9" />
                    <Text style={styles.comparisonLabel}>Predicción</Text>
                    <Text style={styles.comparisonValue}>
                      {new Date(fechaPredicha).toLocaleDateString('es-ES')}
                    </Text>
                  </View>

                  <Ionicons name="arrow-forward" size={24} color="#94a3b8" />

                  <View style={styles.comparisonItem}>
                    <Ionicons name="calendar-outline" size={20} color="#0ea5e9" />
                    <Text style={styles.comparisonLabel}>Realidad</Text>
                    <Text style={styles.comparisonValue}>
                      {fechaSeleccionada
                        ? new Date(fechaSeleccionada).toLocaleDateString('es-ES')
                        : 'Seleccionar'}
                    </Text>
                  </View>
                </View>

                {diferenciaDias !== null && (
                  <View style={styles.differenceContainer}>
                    <Text style={styles.differenceLabel}>Diferencia:</Text>
                    <Text
                      style={[
                        styles.differenceValue,
                        {
                          color:
                            diferenciaDias === 0
                              ? '#059669'
                              : Math.abs(diferenciaDias) <= 3
                              ? '#f59e0b'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {diferenciaDias === 0
                        ? '¡Exacto!'
                        : diferenciaDias > 0
                        ? `+${diferenciaDias} días`
                        : `${diferenciaDias} días`}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Calendario */}
            <View style={styles.calendarSection}>
              <Text style={styles.calendarTitle}>Selecciona la fecha de maduración</Text>
              <Calendar
                current={hoy}
                maxDate={hoy}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                markingType={'custom' as any}
                theme={{
                  todayTextColor: '#0ea5e9',
                  selectedDayBackgroundColor: '#0ea5e9',
                  selectedDayTextColor: '#ffffff',
                  arrowColor: '#0ea5e9',
                  monthTextColor: '#1e293b',
                  textMonthFontWeight: 'bold',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                }}
              />
              
              {fechaPredicha && (
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
                    <Text style={styles.legendText}>Fecha predicha</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
                    <Text style={styles.legendText}>Fecha seleccionada</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={loading || !fechaSeleccionada}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Finalizar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  comparisonSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonItem: {
    alignItems: 'center',
    gap: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  comparisonValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  differenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#bfdbfe',
  },
  differenceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  differenceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  calendarSection: {
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    backgroundColor: '#0ea5e9',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
