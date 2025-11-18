// Opciones de tipo de polinización (según backend)
export const TIPOS_POLINIZACION = [
  { label: 'Self', value: 'SELF' },
  { label: 'Sibling', value: 'SIBLING' },
  { label: 'Híbrido', value: 'HIBRIDO' },
];

// Opciones de clima (según backend)
export const CLIMAS = [
  { label: 'Intermedio (I)', value: 'I' },
  { label: 'Intermedio Caliente (IW)', value: 'IW' },
  { label: 'Intermedio Frío (IC)', value: 'IC' },
  { label: 'Caliente (W)', value: 'W' },
  { label: 'Frío (C)', value: 'C' },
];

// Opciones de cantidad de semilla
export const CANTIDAD_SEMILLA = [
  { label: 'Abundante', value: 'ABUNDANTE' },
  { label: 'Escasa', value: 'ESCASA' },
];

// Estado inicial del formulario
export const getInitialFormState = (getUserFullName: () => string) => ({
  fecha_polinizacion: '',
  fecha_maduracion: '',
  clima: '',
  ubicacion: '',
  responsable: getUserFullName(),
  cantidad_solicitada: '',
  cantidad_disponible: '',
  cantidad_semilla: '',
  tipo_polinizacion: '',
  observaciones: '',
  etapa_actual: 'Ingresado',
  // Campos para plantas
  planta_madre_codigo: '',
  planta_madre_genero: '',
  planta_madre_especie: '',
  planta_padre_codigo: '',
  planta_padre_genero: '',
  planta_padre_especie: '',
  nueva_planta_codigo: '',
  nueva_planta_genero: '',
  nueva_planta_especie: '',
  // Campos de ubicación específica
  vivero: '',
  mesa: '',
  pared: ''
});