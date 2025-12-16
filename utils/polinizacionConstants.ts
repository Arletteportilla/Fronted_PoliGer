// Opciones de tipo de polinización (según backend)
export const TIPOS_POLINIZACION = [
  { label: 'Self', value: 'SELF' },
  { label: 'Sibling', value: 'SIBLING' },
  { label: 'Híbrida', value: 'HIBRIDA' },
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
  id: null as number | null,
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
  estado: 'INGRESADO',
  // Campos para planta madre
  madre_codigo: '',
  madre_genero: '',
  madre_especie: '',
  madre_clima: 'I',
  // Campos para planta padre
  padre_codigo: '',
  padre_genero: '',
  padre_especie: '',
  padre_clima: 'I',
  // Campos para nueva planta
  nueva_codigo: '',
  nueva_genero: '',
  nueva_especie: '',
  nueva_clima: 'I',
  // Campos legacy (mantener compatibilidad)
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
  pared: '',
  ubicacion_tipo: 'vivero',
  ubicacion_nombre: '',
  // Campos de cantidad
  cantidad_capsulas: 1,
  cantidad: 1
});