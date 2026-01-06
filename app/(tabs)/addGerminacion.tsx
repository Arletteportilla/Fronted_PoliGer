import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, ScrollView, View, Modal, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { germinacionService } from '@/services/germinacion.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { SimpleCalendarPicker } from '@/components/common';
import { PrediccionMLGerminacion } from '@/components/germinaciones';
import { Ionicons } from '@expo/vector-icons';
import type { PrediccionGerminacionMLResponse } from '@/services/germinacion-ml.service';

const ESTADOS_CAPSULA = [
  { label: 'Cerrada', value: 'CERRADA' },
  { label: 'Abierta', value: 'ABIERTA' },
  { label: 'Semiabierta', value: 'SEMIABIERTA' },
];


const CLIMAS = [
  { label: 'Intermedio (I)', value: 'I' },
  { label: 'Intermedio Caliente (IW)', value: 'IW' },
  { label: 'Intermedio Frío (IC)', value: 'IC' },
  { label: 'Caliente (W)', value: 'W' },
  { label: 'Frío (C)', value: 'C' },
];

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// Hook para detectar el tamaño de pantalla
const useResponsive = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  return {
    width: screenData.width,
    height: screenData.height,
    isTablet: screenData.width >= 768,
    isLargeScreen: screenData.width >= 1024,
    isSmallScreen: screenData.width < 400,
  };
};

export default function AddGerminacionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const responsive = useResponsive();

  // Campos del formulario según especificación
  const [fechaPolinizacion, setFechaPolinizacion] = useState(todayStr());
  const [fechaSiembra, setFechaSiembra] = useState(todayStr());
  const [codigo, setCodigo] = useState('');
  const [genero, setGenero] = useState('');
  const [especie, setEspecie] = useState('');
  const [clima, setClima] = useState('I');
  const [percha, setPercha] = useState('');
  const [nivel, setNivel] = useState('');
  const [cantidadSolicitada, setCantidadSolicitada] = useState('');
  const [numeroCapsulas, setNumeroCapsulas] = useState('');
  const [estadoCapsulas, setEstadoCapsulas] = useState('CERRADA');
  const [observaciones, setObservaciones] = useState('');
  const [responsablePolinizacion, setResponsablePolinizacion] = useState('');
  
  // Estados del componente
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);

  // Estado para la predicción ML
  const [prediccionML, setPrediccionML] = useState<PrediccionGerminacionMLResponse | null>(null);

  // Handle edit mode and pre-fill form
  useEffect(() => {
    if (params['editMode'] === 'true' && params['editData']) {
      try {
        const editData = JSON.parse(params['editData'] as string);
        setIsEditMode(true);
        setEditItemId(editData.id);
        
        // Pre-fill form fields with new structure
        setFechaPolinizacion(editData.fecha_polinizacion || todayStr());
        setFechaSiembra(editData.fecha_siembra || todayStr());
        setCodigo(editData.codigo || '');
        setGenero(editData.genero || '');
        setEspecie(editData.especie || '');
        setClima(editData.clima || 'I');
        setPercha(editData.percha || '');
        setNivel(editData.nivel || '');
        setCantidadSolicitada(editData.cantidad_solicitada?.toString() || '');
        setNumeroCapsulas(editData.no_capsulas?.toString() || '');
        setEstadoCapsulas(editData.estado_capsula || 'CERRADA');
        setObservaciones(editData.observaciones || '');
        setResponsablePolinizacion(editData.responsable_polinizacion || '');
      } catch (error) {
        console.error('Error parsing edit data:', error);
        toast.error('No se pudieron cargar los datos para editar');
      }
    }
  }, [params]);

  const handleSubmit = async () => {
    // Validaciones de campos obligatorios
    if (!codigo.trim() || !genero.trim() || !especie.trim() || !fechaPolinizacion || !fechaSiembra ||
        !cantidadSolicitada.trim() || !numeroCapsulas.trim()) {
      toast.error('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Validar que las cantidades sean números positivos
    const cantidad = parseInt(cantidadSolicitada);
    const capsulas = parseInt(numeroCapsulas);

    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error('La cantidad solicitada debe ser un número positivo.');
      return;
    }

    if (isNaN(capsulas) || capsulas <= 0) {
      toast.error('El número de cápsulas debe ser un número positivo.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = {
        fecha_polinizacion: fechaPolinizacion,
        fecha_siembra: fechaSiembra,
        codigo: codigo.trim(),
        genero: genero.trim(),
        especie: especie.trim(),
        clima: clima,
        percha: percha.trim(),
        nivel: nivel.trim(),
        cantidad_solicitada: cantidad,
        no_capsulas: capsulas,
        estado_capsula: estadoCapsulas,
        observaciones: observaciones.trim(),
        responsable_polinizacion: responsablePolinizacion.trim(),
        responsable_germinacion: user?.username || '', // Usuario logueado
      };


      if (isEditMode && editItemId) {
        await germinacionService.update(editItemId, formData);
        toast.success('Germinación actualizada correctamente');
      } else {
        await germinacionService.create(formData);
        toast.success('Germinación creada correctamente');
      }

      router.back();
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo guardar la germinación. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrediccionComplete = (resultado: PrediccionGerminacionMLResponse) => {
    setPrediccionML(resultado);
    console.log('Predicción ML de germinación recibida:', resultado);
  };

  const renderFormField = (label: string, children: React.ReactNode, required = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      {children}
    </View>
  );

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={() => router.back()}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => router.back()}
      >
        <TouchableOpacity
          style={[
            styles.modalContainer,
            responsive.isTablet && styles.modalContainerTablet,
            responsive.isLargeScreen && styles.modalContainerLarge,
          ]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header del modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="#182d49" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Editar Germinación' : 'Nueva Germinación'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>

          {/* Fecha de Polinización */}
          <SimpleCalendarPicker
            label="Fecha de Polinización"
            value={fechaPolinizacion}
            onDateChange={setFechaPolinizacion}
            placeholder="Seleccionar fecha de polinización"
            required={true}
          />

          {/* Fecha de Siembra */}
          <SimpleCalendarPicker
            label="Fecha de Siembra"
            value={fechaSiembra}
            onDateChange={setFechaSiembra}
            placeholder="Seleccionar fecha de siembra"
            required={true}
          />

          {/* Código */}
          {renderFormField('Código', (
            <TextInput
              style={styles.input}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="Ingresa el código"
            />
          ), true)}

          {/* Género */}
          {renderFormField('Género', (
            <TextInput
              style={styles.input}
              value={genero}
              onChangeText={setGenero}
              placeholder="Ingresa el género"
            />
          ), true)}

          {/* Especie */}
          {renderFormField('Especie', (
            <TextInput
              style={styles.input}
              value={especie}
              onChangeText={setEspecie}
              placeholder="Ingresa la especie"
            />
          ), true)}

          {/* Clima */}
          {renderFormField('Clima', (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={clima}
                onValueChange={setClima}
                style={styles.picker}
              >
                {CLIMAS.map((climaOption) => (
                  <Picker.Item
                    key={climaOption.value}
                    label={climaOption.label}
                    value={climaOption.value}
                  />
                ))}
              </Picker>
            </View>
          ))}

          {/* Ubicación - Percha */}
          {renderFormField('Percha', (
            <TextInput
              style={styles.input}
              value={percha}
              onChangeText={setPercha}
              placeholder="Ingresa la percha"
            />
          ))}

          {/* Ubicación - Nivel */}
          {renderFormField('Nivel', (
            <TextInput
              style={styles.input}
              value={nivel}
              onChangeText={setNivel}
              placeholder="Ingresa el nivel"
            />
          ))}

          {/* Cantidad Solicitada */}
          {renderFormField('Cantidad Solicitada', (
            <TextInput
              style={styles.input}
              value={cantidadSolicitada}
              onChangeText={setCantidadSolicitada}
              placeholder="Ingresa la cantidad"
              keyboardType="numeric"
            />
          ), true)}

          {/* Número de Cápsulas */}
          {renderFormField('Número de Cápsulas', (
            <TextInput
              style={styles.input}
              value={numeroCapsulas}
              onChangeText={setNumeroCapsulas}
              placeholder="Ingresa el número de cápsulas"
              keyboardType="numeric"
            />
          ), true)}

          {/* Estado de Cápsulas */}
          {renderFormField('Estado de Cápsulas', (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={estadoCapsulas}
                onValueChange={setEstadoCapsulas}
                style={styles.picker}
              >
                {ESTADOS_CAPSULA.map((estado) => (
                  <Picker.Item
                    key={estado.value}
                    label={estado.label}
                    value={estado.value}
                  />
                ))}
              </Picker>
            </View>
          ))}

          {/* Observaciones */}
          {renderFormField('Observaciones', (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Ingresa observaciones adicionales"
              multiline
              numberOfLines={3}
            />
          ))}

          {/* Responsable de Polinización */}
          {renderFormField('Responsable de Polinización', (
            <TextInput
              style={styles.input}
              value={responsablePolinizacion}
              onChangeText={setResponsablePolinizacion}
              placeholder="Ingresa el responsable de polinización"
            />
          ))}

          {/* Responsable de Germinación (automático) */}
          {renderFormField('Responsable de Germinación', (
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.username || ''}
              editable={false}
              placeholder="Usuario logueado"
            />
          ))}

          {/* Predicción ML de Germinación */}
          <View style={styles.prediccionSection}>
            <View style={styles.prediccionHeader}>
              <Ionicons name="analytics" size={20} color="#2E7D32" />
              <Text style={styles.prediccionTitle}>Predicción ML (Random Forest)</Text>
            </View>
            <PrediccionMLGerminacion
              formData={{
                fecha_siembra: fechaSiembra,
                especie: especie,
                clima: clima,
                estado_capsula: estadoCapsulas,
                cantidad_solicitada: parseInt(cantidadSolicitada) || 0,
                no_capsulas: parseInt(numeroCapsulas) || 0
              }}
              onPrediccionComplete={handlePrediccionComplete}
              disabled={isLoading}
            />
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 45, 73, 0.8)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: '85%',
    maxWidth: 600,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderLeftWidth: 2,
    borderColor: '#e9ad14',
  },
  modalContainerTablet: {
    maxWidth: 700,
  },
  modalContainerLarge: {
    maxWidth: 900,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#182d49',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#182d49',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  picker: {
    height: 50,
    color: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#e9ad14',
    borderWidth: 2,
    borderColor: '#182d49',
  },
  submitButtonText: {
    color: '#182d49',
    fontSize: 16,
    fontWeight: '600',
  },
  prediccionSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  prediccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  prediccionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
});