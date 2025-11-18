import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { germinacionService } from '@/services/germinacion.service';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ExportBackupModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ModelInfo {
  existe: boolean;
  tamano_bytes: number | null;
  fecha_modificacion: string | null;
  legible: boolean;
}

interface BackupInfo {
  success: boolean;
  modelo: ModelInfo;
  estadisticas: {
    total_predicciones: number;
    predicciones_completadas: number;
    precision_promedio: number | null;
    predicciones_ml: number;
    predicciones_heuristicas: number;
  };
  recomendaciones: string[];
}

export const ExportBackupModal: React.FC<ExportBackupModalProps> = ({
  visible,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'backup'>('export');
  const [loading, setLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  
  // Estados para filtros de exportación
  const [exportFilters, setExportFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    especie: '',
    genero: '',
    modelo: '',
    incluir_historial: false
  });

  useEffect(() => {
    if (visible && activeTab === 'backup') {
      loadBackupInfo();
    }
  }, [visible, activeTab]);

  const loadBackupInfo = async () => {
    try {
      setLoading(true);
      const info = await germinacionService.obtenerInfoBackupModelo();
      setBackupInfo(info);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo obtener información del modelo');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      
      // Preparar filtros (solo incluir los que tienen valor)
      const filtros: any = {};
      if (exportFilters.fecha_inicio) filtros.fecha_inicio = exportFilters.fecha_inicio;
      if (exportFilters.fecha_fin) filtros.fecha_fin = exportFilters.fecha_fin;
      if (exportFilters.especie) filtros.especie = exportFilters.especie;
      if (exportFilters.genero) filtros.genero = exportFilters.genero;
      if (exportFilters.modelo) filtros.modelo = exportFilters.modelo;
      filtros.incluir_historial = exportFilters.incluir_historial;

      console.log('📤 Exportando con filtros:', filtros);

      const blob = await germinacionService.exportarPrediccionesCSV(filtros);
      
      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `predicciones_germinacion_${timestamp}.csv`;
      
      // Guardar archivo temporalmente
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Convertir blob a base64 para guardarlo
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Compartir archivo
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'text/csv',
              dialogTitle: 'Exportar Predicciones CSV'
            });
          } else {
            Alert.alert('Éxito', `Archivo guardado en: ${fileUri}`);
          }
          
          Alert.alert('Éxito', 'Datos exportados correctamente');
        } catch (error) {
          console.error('Error guardando archivo:', error);
          Alert.alert('Error', 'No se pudo guardar el archivo');
        }
      };
      
      reader.readAsDataURL(blob);
      
    } catch (error: any) {
      console.error('Error exportando:', error);
      Alert.alert('Error', error.message || 'No se pudo exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      
      Alert.alert(
        'Crear Backup',
        '¿Estás seguro de que quieres crear un backup del modelo? Esto puede tomar unos momentos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Crear Backup',
            onPress: async () => {
              try {
                const blob = await germinacionService.crearBackupModelo();
                
                // Generar nombre de archivo con timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const filename = `modelo_germinacion_backup_${timestamp}.zip`;
                
                // Guardar archivo temporalmente
                const fileUri = `${FileSystem.documentDirectory}${filename}`;
                
                // Convertir blob a base64 para guardarlo
                const reader = new FileReader();
                reader.onload = async () => {
                  try {
                    const base64Data = (reader.result as string).split(',')[1];
                    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                      encoding: FileSystem.EncodingType.Base64,
                    });
                    
                    // Compartir archivo
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(fileUri, {
                        mimeType: 'application/zip',
                        dialogTitle: 'Backup del Modelo'
                      });
                    } else {
                      Alert.alert('Éxito', `Backup guardado en: ${fileUri}`);
                    }
                    
                    Alert.alert('Éxito', 'Backup del modelo creado correctamente');
                  } catch (error) {
                    console.error('Error guardando backup:', error);
                    Alert.alert('Error', 'No se pudo guardar el backup');
                  }
                };
                
                reader.readAsDataURL(blob);
                
              } catch (error: any) {
                Alert.alert('Error', error.message || 'No se pudo crear el backup');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error creando backup:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el backup');
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const renderExportTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Exportar Predicciones a CSV</Text>
      <Text style={styles.sectionDescription}>
        Exporta datos de predicciones con parámetros utilizados, resultados estimados y reales.
      </Text>

      {/* Filtros de exportación */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtros (Opcional)</Text>
        
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Fecha Inicio</Text>
            <TextInput
              style={styles.filterInput}
              value={exportFilters.fecha_inicio}
              onChangeText={(text) => setExportFilters(prev => ({ ...prev, fecha_inicio: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Fecha Fin</Text>
            <TextInput
              style={styles.filterInput}
              value={exportFilters.fecha_fin}
              onChangeText={(text) => setExportFilters(prev => ({ ...prev, fecha_fin: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Especie</Text>
            <TextInput
              style={styles.filterInput}
              value={exportFilters.especie}
              onChangeText={(text) => setExportFilters(prev => ({ ...prev, especie: text }))}
              placeholder="Filtrar por especie"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Género</Text>
            <TextInput
              style={styles.filterInput}
              value={exportFilters.genero}
              onChangeText={(text) => setExportFilters(prev => ({ ...prev, genero: text }))}
              placeholder="Filtrar por género"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Incluir Historial de Predicciones</Text>
          <Switch
            value={exportFilters.incluir_historial}
            onValueChange={(value) => setExportFilters(prev => ({ ...prev, incluir_historial: value }))}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={exportFilters.incluir_historial ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, styles.exportButton]}
        onPress={handleExportCSV}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Exportar CSV</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBackupTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Backup del Modelo</Text>
      <Text style={styles.sectionDescription}>
        Crea un backup completo del modelo entrenado con sus parámetros y metadatos.
      </Text>

      {loading && !backupInfo ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando información del modelo...</Text>
        </View>
      ) : backupInfo ? (
        <View style={styles.modelInfoContainer}>
          <Text style={styles.modelInfoTitle}>Estado del Modelo</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name={backupInfo.modelo.existe ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={backupInfo.modelo.existe ? "#4CAF50" : "#f44336"} 
                />
                <Text style={[styles.infoValue, { color: backupInfo.modelo.existe ? "#4CAF50" : "#f44336" }]}>
                  {backupInfo.modelo.existe ? "Disponible" : "No encontrado"}
                </Text>
              </View>
            </View>
            
            {backupInfo.modelo.existe && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tamaño:</Text>
                  <Text style={styles.infoValue}>{formatBytes(backupInfo.modelo.tamano_bytes)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Última modificación:</Text>
                  <Text style={styles.infoValue}>{formatDate(backupInfo.modelo.fecha_modificacion)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Legible:</Text>
                  <Text style={[styles.infoValue, { color: backupInfo.modelo.legible ? "#4CAF50" : "#f44336" }]}>
                    {backupInfo.modelo.legible ? "Sí" : "No"}
                  </Text>
                </View>
              </>
            )}
          </View>

          <Text style={styles.modelInfoTitle}>Estadísticas del Modelo</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total predicciones:</Text>
              <Text style={styles.infoValue}>{backupInfo.estadisticas.total_predicciones}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Predicciones completadas:</Text>
              <Text style={styles.infoValue}>{backupInfo.estadisticas.predicciones_completadas}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Precisión promedio:</Text>
              <Text style={styles.infoValue}>
                {backupInfo.estadisticas.precision_promedio ? 
                  `${backupInfo.estadisticas.precision_promedio.toFixed(2)}%` : 
                  'N/A'
                }
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Predicciones ML:</Text>
              <Text style={styles.infoValue}>{backupInfo.estadisticas.predicciones_ml}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Predicciones heurísticas:</Text>
              <Text style={styles.infoValue}>{backupInfo.estadisticas.predicciones_heuristicas}</Text>
            </View>
          </View>

          {backupInfo.recomendaciones.length > 0 && (
            <>
              <Text style={styles.modelInfoTitle}>Recomendaciones</Text>
              <View style={styles.recommendationsContainer}>
                {backupInfo.recomendaciones.map((recomendacion, index) => (
                  <Text key={index} style={styles.recommendation}>
                    {recomendacion}
                  </Text>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.backupButton]}
            onPress={handleCreateBackup}
            disabled={loading || !backupInfo.modelo.existe}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="archive-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Crear Backup</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Exportación y Backup</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'export' && styles.activeTab]}
            onPress={() => setActiveTab('export')}
          >
            <Ionicons 
              name="download-outline" 
              size={20} 
              color={activeTab === 'export' ? '#4CAF50' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'export' && styles.activeTabText]}>
              Exportar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'backup' && styles.activeTab]}
            onPress={() => setActiveTab('backup')}
          >
            <Ionicons 
              name="archive-outline" 
              size={20} 
              color={activeTab === 'backup' ? '#4CAF50' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'backup' && styles.activeTabText]}>
              Backup
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'export' ? renderExportTab() : renderBackupTab()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
  },
  backupButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  modelInfoContainer: {
    gap: 20,
  },
  modelInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});