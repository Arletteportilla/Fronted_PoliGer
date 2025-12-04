import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SimpleCalendarPicker } from '@/components/common';

interface FinalizarGerminacionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (fechaGerminacion: string) => void;
  germinacion: {
    id: number;
    codigo: string;
    especie_variedad?: string;
    fecha_siembra?: string;
    prediccion_fecha_estimada?: string;
    progreso_germinacion?: number;
  } | null;
}

export const FinalizarGerminacionModal: React.FC<FinalizarGerminacionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  germinacion,
}) => {
  const [fechaGerminacion, setFechaGerminacion] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!germinacion) return null;

  const handleConfirm = () => {
    onConfirm(fechaGerminacion);
    onClose();
  };

  const calcularDiferenciaDias = () => {
    if (!germinacion.prediccion_fecha_estimada) return null;
    
    const fechaPredicha = new Date(germinacion.prediccion_fecha_estimada);
    const fechaReal = new Date(fechaGerminacion);
    const diferencia = Math.round((fechaReal.getTime() - fechaPredicha.getTime()) / (1000 * 60 * 60 * 24));
    
    return diferencia;
  };

  const diferenciaDias = calcularDiferenciaDias();

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
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
                </View>
                <Text style={styles.title}>Finalizar Germinación</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Información de la germinación */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="code-outline" size={18} color="#64748b" />
                <Text style={styles.infoLabel}>Código:</Text>
                <Text style={styles.infoValue}>{germinacion.codigo}</Text>
              </View>
              {germinacion.especie_variedad && (
                <View style={styles.infoRow}>
                  <Ionicons name="leaf-outline" size={18} color="#64748b" />
                  <Text style={styles.infoLabel}>Especie:</Text>
                  <Text style={styles.infoValue}>{germinacion.especie_variedad}</Text>
                </View>
              )}
              {germinacion.fecha_siembra && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color="#64748b" />
                  <Text style={styles.infoLabel}>Fecha siembra:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(germinacion.fecha_siembra).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              )}
            </View>

            {/* Predicción vs Real */}
            {germinacion.prediccion_fecha_estimada && (
              <View style={styles.predictionCard}>
                <Text style={styles.predictionTitle}>
                  <Ionicons name="analytics-outline" size={16} color="#0ea5e9" /> Predicción
                </Text>
                <View style={styles.predictionRow}>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionLabel}>Fecha predicha</Text>
                    <Text style={styles.predictionValue}>
                      {new Date(germinacion.prediccion_fecha_estimada).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  {diferenciaDias !== null && (
                    <View style={styles.predictionItem}>
                      <Text style={styles.predictionLabel}>Diferencia</Text>
                      <Text style={[
                        styles.predictionValue,
                        diferenciaDias === 0 ? styles.exacto :
                        diferenciaDias > 0 ? styles.tarde :
                        styles.temprano
                      ]}>
                        {diferenciaDias === 0 ? '¡Exacto!' :
                         diferenciaDias > 0 ? `+${diferenciaDias} días` :
                         `${diferenciaDias} días`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Selector de fecha */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>
                Fecha de germinación <Text style={styles.required}>*</Text>
              </Text>
              <SimpleCalendarPicker
                label=""
                value={fechaGerminacion}
                onDateChange={(date: string) => setFechaGerminacion(date)}
                placeholder="Seleccionar fecha"
              />
              <Text style={styles.dateHint}>
                Selecciona la fecha real en que germinó la planta
              </Text>
            </View>

            {/* Progreso */}
            {germinacion.progreso_germinacion !== undefined && (
              <View style={styles.progressCard}>
                <Text style={styles.progressLabel}>Progreso actual</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${germinacion.progreso_germinacion}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {germinacion.progreso_germinacion}% → 100% (Finalizado)
                </Text>
              </View>
            )}

            {/* Botones */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text style={styles.confirmButtonText}>Finalizar</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  predictionCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  predictionItem: {
    flex: 1,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  exacto: {
    color: '#059669',
  },
  tarde: {
    color: '#f59e0b',
  },
  temprano: {
    color: '#0ea5e9',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  dateHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
