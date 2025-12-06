import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, ScrollView, View, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { polinizacionService } from '@/services/polinizacion.service';
import { polinizacionPrediccionService } from '@/services/polinizacion-prediccion.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from '@/contexts/ToastContext';
import { SimpleCalendarPicker } from '@/components/common';
import { Ionicons } from '@expo/vector-icons';

const TIPOS_POLINIZACION = [
  { label: 'Self', value: 'SELF' },
  { label: 'Sibling', value: 'SIBLING' },
  { label: 'Híbrido', value: 'HIBRIDO' },
];

const ESTADOS_POLINIZACION = [
  { label: 'Ingresado', value: 'INGRESADO' },
  { label: 'En proceso', value: 'EN_PROCESO' },
  { label: 'Lista', value: 'LISTA' },
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

export default function AddPolinizacionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const toast = useToast();
  const responsive = useResponsive();

  // Campos del formulario
  const [fechaPolinizacion, setFechaPolinizacion] = useState(todayStr());
  const [ubicacion, setUbicacion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [genero, setGenero] = useState('');
  const [especie, setEspecie] = useState('');
  const [clima, setClima] = useState('I');
  const [tipoPolinizacion, setTipoPolinizacion] = useState('SELF');
  const [estado, setEstado] = useState('INGRESADO');
  const [cantidad, setCantidad] = useState('');
  const [responsable, setResponsable] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estados del componente
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  
  // Estados para predicción
  const [prediccion, setPrediccion] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showPrediccion, setShowPrediccion] = useState(false);

  // Handle edit mode and pre-fill form
  useEffect(() => {
    if (params['editMode'] === 'true' && params['editData']) {
      try {
        const editData = JSON.parse(params['editData'] as string);
        setIsEditMode(true);
        setEditItemId(editData.numero);
        
        // Pre-fill form fields
        setFechaPolinizacion(editData.fechapol || todayStr());
        setUbicacion(editData.ubicacion || '');
        setCodigo(editData.codigo || '');
        setGenero(editData.genero || '');
        setEspecie(editData.especie || '');
        setClima(editData.clima || 'I');
        setTipoPolinizacion(editData.tipo_polinizacion || 'SELF');
        setEstado(editData.estado || 'INGRESADO');
        setCantidad(editData.cantidad?.toString() || '');
        setResponsable(editData.responsable || '');
        setObservaciones(editData.observaciones || '');
      } catch (error) {
        console.error('Error parsing edit data:', error);
        toast.error('No se pudieron cargar los datos para editar');
      }
    }
  }, [params]);

  const handlePrediccion = async () => {
    // Validar campos mínimos para predicción
    if (!especie.trim() || !genero.trim()) {
      toast.error('Para generar una predicción necesitas al menos el género y la especie.');
      return;
    }

    setIsPredicting(true);
    try {
      console.log('🌸 Generando predicción de polinización...');
      
      const datosPrediccion = {
        especie: especie.trim(),
        genero: genero.trim(),
        clima: clima || undefined,
        ubicacion: ubicacion || undefined,
        fecha_polinizacion: fechaPolinizacion || undefined,
        tipo_polinizacion: tipoPolinizacion || undefined,
      };

      console.log('Datos para predicción:', datosPrediccion);

      // Generar predicción inicial
      const resultado = await polinizacionPrediccionService.generarPrediccionInicial({
        especie: especie.trim(),
        ...(clima && { clima }),
        ...(ubicacion && { ubicacion }),
      });

      console.log('✅ Predicción generada:', resultado);
      setPrediccion(resultado);
      setShowPrediccion(true);

      toast.success(`Predicción generada: ${resultado.dias_estimados} días hasta maduración`);

    } catch (error: any) {
      console.error('❌ Error generando predicción:', error);

      let errorMessage = 'No se pudo generar la predicción.';

      if (error.message?.includes('timeout')) {
        errorMessage = 'La predicción tardó demasiado tiempo. Intenta nuevamente.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = async () => {
    // Validaciones de campos obligatorios
    if (!ubicacion.trim() || !codigo.trim() || !genero.trim() || !especie.trim() ||
        !fechaPolinizacion || !responsable.trim() || !cantidad.trim() || !tipoPolinizacion) {
      toast.error('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Validar que la cantidad sea un número positivo
    const cantidadNum = parseInt(cantidad);

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast.error('La cantidad debe ser un número positivo.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = {
        ubicacion: ubicacion.trim(),
        codigo: codigo.trim(),
        genero: genero.trim(),
        especie: especie.trim(),
        fechapol: fechaPolinizacion,
        responsable: responsable.trim(),
        cantidad: cantidadNum,
        observaciones: observaciones.trim(),
        tipo_polinizacion: tipoPolinizacion,
        estado: estado,
        clima: clima,
        // Incluir datos de predicción si están disponibles
        ...(prediccion && {
          prediccion_dias_estimados: prediccion.dias_estimados,
          prediccion_confianza: prediccion.confianza,
          prediccion_fecha_estimada: prediccion.fecha_estimada_semillas,
          prediccion_tipo: prediccion.tipo_prediccion,
        }),
      };

      console.log('Datos a enviar:', formData);

      if (isEditMode && editItemId) {
        await polinizacionService.update(editItemId, formData);
        toast.success('Polinización actualizada correctamente');
      } else {
        await polinizacionService.create(formData);
        toast.success('Polinización creada correctamente');
      }

      router.back();
    } catch (error: any) {
      console.error('Error completo:', error);

      let errorMessage = 'No se pudo guardar la polinización.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        console.log('Error del backend:', errorData);

        // Si hay errores específicos del serializer
        if (typeof errorData === 'object' && errorData !== null) {
          const errorFields = Object.keys(errorData);
          if (errorFields.length > 0) {
            const firstError = errorFields[0];
            const fieldErrors = errorData[firstError as keyof typeof errorData];
            const firstErrorMessage = Array.isArray(fieldErrors)
              ? fieldErrors[0]
              : fieldErrors;
            errorMessage = `${firstError}: ${firstErrorMessage}`;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
              {isEditMode ? 'Editar Polinización' : 'Nueva Polinización'}
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

          {/* Ubicación */}
          {renderFormField('Ubicación', (
            <TextInput
              style={styles.input}
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholder="Ingresa la ubicación"
            />
          ), true)}

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
          ), true)}

          {/* Tipo de Polinización */}
          {renderFormField('Tipo de Polinización', (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tipoPolinizacion}
                onValueChange={setTipoPolinizacion}
                style={styles.picker}
              >
                {TIPOS_POLINIZACION.map((tipo) => (
                  <Picker.Item
                    key={tipo.value}
                    label={tipo.label}
                    value={tipo.value}
                  />
                ))}
              </Picker>
            </View>
          ), true)}

          {/* Estado */}
          {renderFormField('Estado', (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={estado}
                onValueChange={setEstado}
                style={styles.picker}
              >
                {ESTADOS_POLINIZACION.map((est) => (
                  <Picker.Item
                    key={est.value}
                    label={est.label}
                    value={est.value}
                  />
                ))}
              </Picker>
            </View>
          ), true)}

          {/* Cantidad */}
          {renderFormField('Cantidad', (
            <TextInput
              style={styles.input}
              value={cantidad}
              onChangeText={setCantidad}
              placeholder="Ingresa la cantidad"
              keyboardType="numeric"
            />
          ), true)}

          {/* Responsable */}
          {renderFormField('Responsable', (
            <TextInput
              style={styles.input}
              value={responsable}
              onChangeText={setResponsable}
              placeholder="Ingresa el responsable"
            />
          ), true)}

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

          {/* Botón de Predicción */}
          <TouchableOpacity 
            style={[styles.predictionButton, (isPredicting || !especie.trim() || !genero.trim()) && styles.predictionButtonDisabled]} 
            onPress={handlePrediccion} 
            disabled={isPredicting || !especie.trim() || !genero.trim()}
          >
            {isPredicting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="analytics" size={20} color="#fff" />
            )}
            <Text style={styles.predictionButtonText}>
              {isPredicting ? 'Generando...' : 'Generar Predicción'}
            </Text>
          </TouchableOpacity>

          {/* Mostrar resultados de predicción */}
          {showPrediccion && prediccion && (
            <View style={styles.prediccionContainer}>
              <Text style={styles.prediccionTitle}>📊 Predicción Generada</Text>
              <View style={styles.prediccionInfo}>
                <Text style={styles.prediccionText}>
                  <Text style={styles.prediccionLabel}>Días estimados:</Text> {prediccion.dias_estimados} días
                </Text>
                <Text style={styles.prediccionText}>
                  <Text style={styles.prediccionLabel}>Confianza:</Text> {prediccion.confianza}%
                </Text>
                {prediccion.fecha_estimada_semillas && (
                  <Text style={styles.prediccionText}>
                    <Text style={styles.prediccionLabel}>Fecha estimada:</Text> {new Date(prediccion.fecha_estimada_semillas).toLocaleDateString('es-ES')}
                  </Text>
                )}
                <Text style={styles.prediccionText}>
                  <Text style={styles.prediccionLabel}>Tipo:</Text> {prediccion.tipo_prediccion}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closePrediccionButton} 
                onPress={() => setShowPrediccion(false)}
              >
                <Text style={styles.closePrediccionText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}

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
    backgroundColor: 'rgba(71, 85, 105, 0.75)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#e9ad14',
  },
  modalContainerTablet: {
    maxWidth: 700,
    maxHeight: '85%',
  },
  modalContainerLarge: {
    maxWidth: 900,
    maxHeight: '80%',
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
    borderTopRightRadius: 20,
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
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
  predictionButton: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  predictionButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  predictionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  prediccionContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  prediccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 12,
    textAlign: 'center',
  },
  prediccionInfo: {
    marginBottom: 12,
  },
  prediccionText: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 6,
  },
  prediccionLabel: {
    fontWeight: 'bold',
  },
  closePrediccionButton: {
    backgroundColor: '#0ea5e9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closePrediccionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
});
