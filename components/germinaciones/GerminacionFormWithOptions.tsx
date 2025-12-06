import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView } from 'react-native';
import { OptionsPicker } from '@/components/common';
import { SimpleCalendarPicker } from '@/components/common';

// Opciones estáticas para el formulario
interface GerminacionOptions {
  niveles: { value: string; label: string }[];
  tipos_semilla: { value: string; label: string }[];
  estados_capsula: { value: string; label: string }[];
}

interface GerminacionFormProps {
  form: any;
  setForm: (form: any) => void;
  saving: boolean;
}

// Opciones estáticas (valores por defecto)
const DEFAULT_OPTIONS: GerminacionOptions = {
  niveles: [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
  ],
  tipos_semilla: [
    { value: 'MADURA', label: 'Madura' },
    { value: 'TIERNA', label: 'Tierna' },
    { value: 'VANA', label: 'Vana' },
  ],
  estados_capsula: [
    { value: 'VIABLE', label: 'Viable' },
    { value: 'NO_VIABLE', label: 'No viable' },
    { value: 'GERMINADA', label: 'Germinada' },
    { value: 'EXITOSA', label: 'Exitosa' },
    { value: 'CERRADA', label: 'Cerrada' },
    { value: 'ABIERTA', label: 'Abierta' },
    { value: 'SEMIABIERTA', label: 'Semiabierta' },
  ],
};

export const GerminacionFormWithOptions: React.FC<GerminacionFormProps> = ({
  form,
  setForm,
  saving,
}) => {
  const options = DEFAULT_OPTIONS;

  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

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
