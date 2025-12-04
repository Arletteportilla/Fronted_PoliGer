import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CambiarEstadoModalProps {
  visible: boolean;
  onClose: () => void;
  onCambiarEstado: (estado: 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO') => void;
  item: {
    codigo?: string | null;
    nombre?: string | null;
    nueva_codigo?: string | null;
    especie?: string | null;
    especie_variedad?: string | null;
    nueva_especie?: string | null;
    genero?: string | null;
    estado_germinacion?: 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO';
    estado_polinizacion?: 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO';
  } | null;
  tipo: 'germinacion' | 'polinizacion';
}

export const CambiarEstadoModal: React.FC<CambiarEstadoModalProps> = ({
  visible,
  onClose,
  onCambiarEstado,
  item,
  tipo,
}) => {
  if (!item) return null;

  // Obtener el estado actual según el tipo
  const estadoActual = tipo === 'germinacion' 
    ? (item.estado_germinacion || 'INICIAL')
    : (item.estado_polinizacion || 'INICIAL');

  // Obtener información del item
  const codigo = item.codigo || item.nueva_codigo || item.nombre || 'N/A';
  const especie = tipo === 'germinacion'
    ? item.especie_variedad
    : (item.nueva_especie || item.especie);

  const titulo = tipo === 'germinacion' 
    ? 'Cambiar Estado de Germinación'
    : 'Cambiar Estado de Polinización';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{titulo}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Información del item */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Código:</Text>
              <Text style={styles.infoValue}>{codigo}</Text>
            </View>

            {especie && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Especie:</Text>
                <Text style={styles.infoValue}>{especie}</Text>
              </View>
            )}

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Estado Actual:</Text>
              <View style={[styles.estadoBadge, {
                backgroundColor: 
                  estadoActual === 'FINALIZADO' ? '#d1fae5' :
                  estadoActual === 'EN_PROCESO' ? '#fef3c7' :
                  '#e2e8f0'
              }]}>
                <Ionicons
                  name={
                    estadoActual === 'FINALIZADO' ? 'checkmark-circle' :
                    estadoActual === 'EN_PROCESO' ? 'time' :
                    'ellipse'
                  }
                  size={16}
                  color={
                    estadoActual === 'FINALIZADO' ? '#059669' :
                    estadoActual === 'EN_PROCESO' ? '#f59e0b' :
                    '#64748b'
                  }
                />
                <Text style={[styles.estadoText, {
                  color:
                    estadoActual === 'FINALIZADO' ? '#059669' :
                    estadoActual === 'EN_PROCESO' ? '#f59e0b' :
                    '#64748b'
                }]}>
                  {estadoActual === 'FINALIZADO' ? 'Finalizado' :
                   estadoActual === 'EN_PROCESO' ? 'En Proceso' :
                   'Inicial'}
                </Text>
              </View>
            </View>
          </View>

          {/* Opciones de cambio de estado */}
          <View style={styles.optionsSection}>
            <Text style={styles.optionsTitle}>Selecciona el nuevo estado:</Text>

            <View style={styles.buttonsContainer}>
              {/* Solo mostrar "Iniciar Proceso" si está en INICIAL */}
              {estadoActual === 'INICIAL' && (
                <TouchableOpacity
                  style={[styles.stateButton, styles.stateButtonProcess]}
                  onPress={() => {
                    onCambiarEstado('EN_PROCESO');
                    onClose();
                  }}
                >
                  <Ionicons name="play-circle" size={20} color="#ffffff" />
                  <Text style={styles.stateButtonText}>Iniciar Proceso</Text>
                </TouchableOpacity>
              )}

              {/* Solo mostrar "Finalizar" si está en EN_PROCESO */}
              {estadoActual === 'EN_PROCESO' && (
                <TouchableOpacity
                  style={[styles.stateButton, styles.stateButtonFinish]}
                  onPress={() => {
                    onCambiarEstado('FINALIZADO');
                    onClose();
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.stateButtonText}>Finalizar</Text>
                </TouchableOpacity>
              )}

              {/* Mensaje si ya está finalizado */}
              {estadoActual === 'FINALIZADO' && (
                <View style={styles.completedContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                  <Text style={styles.completedText}>
                    {tipo === 'germinacion' 
                      ? 'Esta germinación ya está finalizada'
                      : 'Esta polinización ya está finalizada'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Botón cancelar */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
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
    padding: 24,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  infoSection: {
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  estadoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionsSection: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  stateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stateButtonProcess: {
    backgroundColor: '#0ea5e9',
  },
  stateButtonFinish: {
    backgroundColor: '#0ea5e9',
  },
  stateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    gap: 12,
  },
  completedText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});
