import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, Alert, ScrollView, View, Platform, ActivityIndicator } from 'react-native';
import { polinizacionService } from '@/services/polinizacion.service';
import { prediccionService } from '@/services/prediccion.service';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SimpleCalendarPicker } from '@/components/common';
import { Ionicons } from '@expo/vector-icons';

export default function AddPolinizacionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ubicacion, setUbicacion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [genero, setGenero] = useState('');
  const [especie, setEspecie] = useState('');
  const [fechapol, setFechapol] = useState('');
  const [responsable, setResponsable] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [tipoPolinizacion, setTipoPolinizacion] = useState('');
  const [estado, setEstado] = useState('INGRESADO');
  const [clima, setClima] = useState('I');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  
  // Estados para predicción
  const [prediccion, setPrediccion] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showPrediccion, setShowPrediccion] = useState(false);

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

  const CLIMAS_DISPONIBLES = [
    { label: 'Intermedio (I)', value: 'I' },
    { label: 'Intermedio Caliente (IW)', value: 'IW' },
    { label: 'Intermedio Frío (IC)', value: 'IC' },
    { label: 'Caliente (W)', value: 'W' },
    { label: 'Frío (C)', value: 'C' },
    { label: 'Frío (W)', value: 'W' },
  ];

  // Handle edit mode and pre-fill form
  useEffect(() => {
    if (params.editMode === 'true' && params.editData) {
      try {
        const editData = JSON.parse(params.editData as string);
        setIsEditMode(true);
        setEditItemId(editData.numero);
        
        // Pre-fill form fields
        setUbicacion(editData.ubicacion || '');
        setCodigo(editData.codigo || '');
        setGenero(editData.genero || '');
        setEspecie(editData.especie || '');
        setFechapol(editData.fechapol || '');
        setResponsable(editData.responsable || '');
        setCantidad(editData.cantidad?.toString() || '');
        setObservaciones(editData.observaciones || '');
        setTipoPolinizacion(editData.tipo_polinizacion || '');
        setEstado(editData.estado || 'INGRESADO');
      } catch (error) {
        console.error('Error parsing edit data:', error);
        Alert.alert('Error', 'No se pudo cargar los datos para editar.');
      }
    }
  }, [params]);

  const handlePrediccion = async () => {
    // Validar campos mínimos para predicción
    if (!especie.trim() || !genero.trim()) {
      Alert.alert('Error', 'Para generar una predicción necesitas al menos el género y la especie.');
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
        fecha_polinizacion: fechapol || undefined,
        tipo_polinizacion: tipoPolinizacion || undefined,
      };

      console.log('Datos para predicción:', datosPrediccion);

      // Generar predicción inicial
      const resultado = await prediccionService.predecirPolinizacionInicial({
        especie: especie.trim(),
        clima: clima || undefined,
        ubicacion: ubicacion || undefined,
      });

      console.log('✅ Predicción generada:', resultado);
      setPrediccion(resultado);
      setShowPrediccion(true);
      
      Alert.alert(
        'Predicción Generada', 
        `La polinización de ${especie} debería madurar en aproximadamente ${resultado.dias_estimados} días.\n\nConfianza: ${resultado.confianza}%`,
        [{ text: 'OK' }]
      );
      
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
      
      Alert.alert('Error en Predicción', errorMessage);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = async () => {
    // Validaciones avanzadas
    if (!ubicacion.trim() || !codigo.trim() || !genero.trim() || !especie.trim() || !fechapol.trim() || !responsable.trim() || !cantidad.trim() || !tipoPolinizacion) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }
    if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      Alert.alert('Error', 'La cantidad solicitada debe ser un número mayor a 0.');
      return;
    }
    setIsLoading(true);
    try {
      const formData = {
        ubicacion,
        codigo,
        genero,
        especie,
        fechapol,
        responsable,
        cantidad: Number(cantidad),
        observaciones,
        tipo_polinizacion: tipoPolinizacion,
        estado,
        clima,
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
        Alert.alert('Éxito', 'Polinización actualizada correctamente.');
      } else {
        await polinizacionService.create(formData);
        Alert.alert('Éxito', 'Polinización añadida correctamente.');
      }

      // Reset form and navigate back
      setUbicacion(''); 
      setCodigo(''); 
      setGenero('');
      setEspecie('');
      setFechapol('');
      setResponsable(''); 
      setCantidad(''); 
      setObservaciones(''); 
      setTipoPolinizacion('');
      setEstado('INGRESADO');
      
      // Navigate back to profile
      router.back();
    } catch (error: any) {
      console.error('Error completo:', error);
      
      let errorMessage = 'No se pudo guardar la polinización.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.log('Error del backend:', errorData);
        
        // Si hay errores específicos del serializer
        if (typeof errorData === 'object') {
          const errorFields = Object.keys(errorData);
          if (errorFields.length > 0) {
            const firstError = errorFields[0];
            const firstErrorMessage = Array.isArray(errorData[firstError]) 
              ? errorData[firstError][0] 
              : errorData[firstError];
            errorMessage = `${firstError}: ${firstErrorMessage}`;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#e0e7ff", "#f5f7fa"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.title}>{isEditMode ? 'Editar Polinización' : 'Añadir Polinización'}</Text>
          
          <Text style={styles.label}>Ubicación*</Text>
          <TextInput style={styles.input} placeholder="Ubicación" value={ubicacion} onChangeText={setUbicacion} />
          
          <Text style={styles.label}>Código*</Text>
          <TextInput style={styles.input} placeholder="Código" value={codigo} onChangeText={setCodigo} />
          
          <Text style={styles.label}>Género*</Text>
          <TextInput style={styles.input} placeholder="Género" value={genero} onChangeText={setGenero} />
          
          <Text style={styles.label}>Especie*</Text>
          <TextInput style={styles.input} placeholder="Especie" value={especie} onChangeText={setEspecie} />
          
          <SimpleCalendarPicker
            label="Fecha de Polinización"
            value={fechapol}
            onDateChange={setFechapol}
            placeholder="Selecciona fecha de polinización"
            required={true}
          />
          
          <Text style={styles.label}>Responsable*</Text>
          <TextInput style={styles.input} placeholder="Responsable" value={responsable} onChangeText={setResponsable} />
          
          <Text style={styles.label}>Cantidad*</Text>
          <TextInput style={styles.input} placeholder="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />
          
          <Text style={styles.label}>Tipo de polinización*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoPolinizacion}
              onValueChange={setTipoPolinizacion}
            >
              <Picker.Item label="Selecciona tipo..." value="" />
              {TIPOS_POLINIZACION.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Clima*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={clima}
              onValueChange={setClima}
            >
              {CLIMAS_DISPONIBLES.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Estado*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={estado}
              onValueChange={setEstado}
            >
              {ESTADOS_POLINIZACION.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Observaciones</Text>
          <TextInput style={[styles.input, {height: 80}]} placeholder="Observaciones" value={observaciones} onChangeText={setObservaciones} multiline />
          
          {/* Botón de Predicción */}
          <TouchableOpacity 
            style={[styles.predictionButton, isPredicting && styles.predictionButtonDisabled]} 
            onPress={handlePrediccion} 
            disabled={isPredicting || !especie.trim() || !genero.trim()}
          >
            {isPredicting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="analytics" size={20} color="#fff" />
            )}
            <Text style={styles.predictionButtonText}>
              {isPredicting ? 'Generando Predicción...' : 'Generar Predicción'}
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
          
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#4a6cf7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a6cf7',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e7ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f7f9fc',
    color: '#222',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e7ff',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f7f9fc',
  },
  button: {
    backgroundColor: '#4a6cf7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4a6cf7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  predictionButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  predictionButtonDisabled: {
    backgroundColor: '#6b7280',
    shadowColor: '#6b7280',
  },
  predictionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  prediccionContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  prediccionTitle: {
    fontSize: 18,
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
    marginBottom: 4,
  },
  prediccionLabel: {
    fontWeight: 'bold',
  },
  closePrediccionButton: {
    backgroundColor: '#0ea5e9',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  closePrediccionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 