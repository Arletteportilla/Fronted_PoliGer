import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SimpleCalendarPicker } from '../common';
import { germinacionService } from '../../services/germinacion.service';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '@/services/logger';

interface Germinacion {
  id: number;
  codigo: string;
  especie_variedad?: string;
  fecha_siembra?: string;
  prediccion_dias_estimados?: number;
  prediccion_fecha_estimada?: string;
  prediccion_confianza?: number;
  estado_validacion?: string;
  precision_prediccion?: number;
  usuario_valida?: any;
  fecha_validacion?: string;
}

interface Props {
  visible: boolean;
  germinacion: Germinacion | null;
  onClose: () => void;
  onValidacionExitosa: (germinacion: Germinacion) => void;
}

export const ValidarPrediccionGerminacionModal: React.FC<Props> = ({
  visible,
  germinacion,
  onClose,
  onValidacionExitosa
}) => {
  const [fechaReal, setFechaReal] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const toast = useToast();

  const handleValidar = async () => {
    if (!fechaReal) {
      Alert.alert('Error', 'Seleccione la fecha real de germinación');
      return;
    }

    if (!germinacion) return;

    try {
      setValidando(true);

      const resultado = await germinacionService.validarPrediccion(
        germinacion.id,
        fechaReal
      );

      toast.success(`Predicción validada: ${resultado.validacion.calidad} (${resultado.validacion.precision.toFixed(1)}%)`);
      onValidacionExitosa(resultado.germinacion);
      onClose();

    } catch (error: any) {
      logger.error('Error validando predicción:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo validar la predicción'
      );
    } finally {
      setValidando(false);
    }
  };

  if (!germinacion) return null;

  const diasPredichos = germinacion.prediccion_dias_estimados || 0;
  const fechaPredichaStr = germinacion.prediccion_fecha_estimada || '';

  let diasReales = 0;
  let diferenciaDias = 0;

  if (fechaReal && germinacion.fecha_siembra) {
    const fechaSiembraDate = new Date(germinacion.fecha_siembra);
    const fechaRealDate = new Date(fechaReal);
    diasReales = Math.floor((fechaRealDate.getTime() - fechaSiembraDate.getTime()) / (1000 * 60 * 60 * 24));
    diferenciaDias = Math.abs(diasReales - diasPredichos);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="checkmark-done" size={24} color="#4caf50" />
              </View>
              <Text style={styles.title}>Validar Predicción</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                disabled={validando}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Información de la predicción */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Código:</Text>
                <Text style={styles.infoValue}>{germinacion.codigo}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Especie:</Text>
                <Text style={styles.infoValue}>{germinacion.especie_variedad}</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.sublabel}>Fecha Siembra</Text>
                  <Text style={styles.value}>{germinacion.fecha_siembra}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.sublabel}>Predicción</Text>
                  <Text style={styles.value}>{diasPredichos} días</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.sublabel}>Fecha Predicha</Text>
                  <Text style={styles.value}>{fechaPredichaStr}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.sublabel}>Confianza</Text>
                  <Text style={styles.value}>
                    {germinacion.prediccion_confianza ?
                      (typeof germinacion.prediccion_confianza === 'number'
                        ? germinacion.prediccion_confianza.toFixed(0)
                        : Math.round(parseFloat(germinacion.prediccion_confianza))
                      ) : '0'}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Selector de fecha real */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fecha Real de Germinación *</Text>
              <SimpleCalendarPicker
                value={fechaReal || ''}
                onDateChange={(date) => setFechaReal(date)}
                placeholder="Seleccione la fecha"
                minDate={germinacion.fecha_siembra}
                maxDate={new Date().toISOString().split('T')[0]}
                required={true}
              />
            </View>

            {/* Preview de validación */}
            {fechaReal && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Vista Previa</Text>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.sublabel}>Días Reales</Text>
                    <Text style={styles.previewValue}>{diasReales} días</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.sublabel}>Diferencia</Text>
                    <Text style={[
                      styles.previewValue,
                      diferenciaDias > 10 ? styles.errorText : styles.successText
                    ]}>
                      {diferenciaDias} días
                    </Text>
                  </View>
                </View>

                {diferenciaDias > 10 && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={18} color="#FF9800" />
                    <Text style={styles.warningText}>
                      La diferencia es mayor a 10 días. Verifica que la fecha sea correcta.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={validando}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  (!fechaReal || validando) && styles.buttonDisabled
                ]}
                onPress={handleValidar}
                disabled={!fechaReal || validando}
              >
                {validando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Validar</Text>
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
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '400',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  col: {
    flex: 1,
  },
  sublabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  previewContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  successText: {
    color: '#4caf50',
  },
  errorText: {
    color: '#f44336',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
