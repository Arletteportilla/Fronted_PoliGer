import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { OptionsPicker } from '@/components/common';
import { germinacionOptionsService, GerminacionOptions } from '@/services/germinacionOptions.service';
import { SimpleCalendarPicker } from '@/components/common';

interface GerminacionFormProps {
  form: any;
  setForm: (form: any) => void;
  saving: boolean;
}

export const GerminacionFormWithOptions: React.FC<GerminacionFormProps> = ({
  form,
  setForm,
  saving,
}) => {
  const [options, setOptions] = useState<GerminacionOptions>({
    niveles: [],
    tipos_semilla: [],
    estados_capsula: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      console.log('🔍 Cargando opciones de germinación...');
      const loadedOptions = await germinacionOptionsService.getOptions();
      setOptions(loadedOptions);
      console.log('✅ Opciones cargadas:', loadedOptions);
    } catch (error) {
      console.error('❌ Error cargando opciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las opciones. Usando valores por defecto.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  if (loadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando opciones...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Campo Código */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Código:</Text>
        <TextInput
          style={styles.input}
          value={form.codigo}
          onChangeText={(value) => updateForm('codigo', value)}
          placeholder="Ingrese el código"
          editable={!saving}
        />
      </View>

      {/* Campo Género */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Género:</Text>
        <TextInput
          style={styles.input}
          value={form.genero}
          onChangeText={(value) => updateForm('genero', value)}
          placeholder="Ingrese el género"
          editable={!saving}
        />
      </View>

      {/* Campo Especie */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Especie:</Text>
        <TextInput
          style={styles.input}
          value={form.especie}
          onChangeText={(value) => updateForm('especie', value)}
          placeholder="Ingrese la especie"
          editable={!saving}
        />
      </View>

      {/* Campo Nivel - NUEVO: Dropdown con opciones A, B, C */}
      <OptionsPicker
        label="Nivel:"
        options={options.niveles}
        selectedValue={form.nivel || ''}
        onValueChange={(value) => updateForm('nivel', value)}
        placeholder="Seleccionar nivel"
        enabled={!saving}
      />

      {/* Campo Tipo de Semilla - NUEVO */}
      <OptionsPicker
        label="Tipo de Semilla:"
        options={options.tipos_semilla}
        selectedValue={form.tipo_semilla || ''}
        onValueChange={(value) => updateForm('tipo_semilla', value)}
        placeholder="Seleccionar tipo de semilla"
        enabled={!saving}
      />

      {/* Campo Estado de Cápsula - MEJORADO: Usar opciones del backend */}
      <OptionsPicker
        label="Estado de Cápsula:"
        options={options.estados_capsula}
        selectedValue={form.estado_capsula || ''}
        onValueChange={(value) => updateForm('estado_capsula', value)}
        placeholder="Seleccionar estado de cápsula"
        enabled={!saving}
      />

      {/* Campo Fecha de Polinización - NUEVO */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Fecha de Polinización:</Text>
        <SimpleCalendarPicker
          selectedDate={form.fecha_polinizacion}
          onDateChange={(date) => updateForm('fecha_polinizacion', date)}
          placeholder="Seleccionar fecha de polinización"
          disabled={saving}
        />
      </View>

      {/* Campo Fecha de Siembra */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Fecha de Siembra:</Text>
        <SimpleCalendarPicker
          selectedDate={form.fecha_siembra}
          onDateChange={(date) => updateForm('fecha_siembra', date)}
          placeholder="Seleccionar fecha de siembra"
          disabled={saving}
        />
      </View>

      {/* Campo Clima */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Clima:</Text>
        <TextInput
          style={styles.input}
          value={form.clima}
          onChangeText={(value) => updateForm('clima', value)}
          placeholder="Ingrese el clima"
          editable={!saving}
        />
      </View>

      {/* Campo Percha */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Percha:</Text>
        <TextInput
          style={styles.input}
          value={form.percha}
          onChangeText={(value) => updateForm('percha', value)}
          placeholder="Ingrese la percha"
          editable={!saving}
        />
      </View>

      {/* Campo Cantidad Solicitada */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Cantidad Solicitada:</Text>
        <TextInput
          style={styles.input}
          value={form.cantidad_solicitada?.toString() || ''}
          onChangeText={(value) => updateForm('cantidad_solicitada', parseInt(value) || 0)}
          placeholder="Ingrese la cantidad"
          keyboardType="numeric"
          editable={!saving}
        />
      </View>

      {/* Campo Observaciones */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Observaciones:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.observaciones}
          onChangeText={(value) => updateForm('observaciones', value)}
          placeholder="Ingrese observaciones"
          multiline
          numberOfLines={4}
          editable={!saving}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fieldContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
