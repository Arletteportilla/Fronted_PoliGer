// Shared TypeScript interfaces for the application

export interface Germinacion {
  id: number;
  // Fields from actual API response
  fecha_polinizacion?: string;
  fecha_siembra?: string | null;
  codigo?: string | null;
  especie?: string | null;
  especie_variedad?: string | null;
  genero?: string | null;
  clima?: string;
  percha?: string | null;
  nivel?: string | null;
  clima_lab?: string;
  cantidad_solicitada?: number;
  no_capsulas?: number;
  estado_capsula?: string;
  estado_semilla?: string;
  cantidad_semilla?: string;
  semilla_en_stock?: boolean;
  observaciones?: string;
  responsable?: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  creado_por?: number | null;
  fecha_germinacion?: string | null;
  estado_capsulas?: string;
  tipo_polinizacion?: string;
  entrega_capsulas?: string;
  recibe_capsulas?: string;
  semilla_vana?: number;
  semillas_stock?: number;
  disponibles?: number;
  
  // Estado de germinación (INICIAL, EN_PROCESO, FINALIZADO)
  estado_germinacion?: 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO';
  progreso_germinacion?: number; // 0-100%
  
  // NUEVOS CAMPOS DE PREDICCIÓN MEJORADA - Disponibles en backend pero faltantes en frontend
  fecha_germinacion_estimada?: string | null;
  fecha_germinacion_estimada_min?: string | null;
  fecha_germinacion_estimada_max?: string | null;
  dias_estimados_germinacion?: number | null;
  rango_confianza_dias?: number | null;
  confianza_prediccion?: number | null;
  modelo_utilizado?: 'ML' | 'HEURISTIC' | null;
  precision_calculada?: number | null;
  parametros_prediccion?: any;
  fecha_calculo_prediccion?: string | null;
  alerta_activada?: boolean;
  estado_seguimiento?: 'PENDIENTE' | 'EN_REVISION' | 'COMPLETADA' | 'VENCIDA';
  
  // Campos de predicción del backend (nombres del modelo Django)
  prediccion_fecha_estimada?: string | null;
  prediccion_dias_estimados?: number | null;
  prediccion_confianza?: number | null;
  prediccion_tipo?: string | null;
  
  // NUEVOS CAMPOS ADICIONALES - Disponibles en backend
  tipo_semilla?: 'MADURA' | 'TIERNA' | 'VANA' | null;
  responsable_polinizacion?: string | null;
  responsable_germinacion?: string | null;
  
  // Legacy fields (optional)
  fecha_ingreso?: string;
  dias_polinizacion?: number;
  nombre?: string;
  detalles_padres?: string;
  finca?: string;
  numero_vivero?: string;
  numero_capsulas?: number;
  etapa_actual?: string;
  polinizacion?: number;
  estado?: 'INGRESADO' | 'EN_PROCESO' | 'LISTO' | 'pendiente';
}

export interface Polinizacion {
  id: number;
  numero: number;
  codigo: string;
  genero: string;
  especie: string;
  fechapol: string;
  fechamad?: string;
  ubicacion: string;
  responsable?: string | { id: number; username: string; first_name?: string; last_name?: string } | null;
  cantidad: number;
  disponible: boolean;
  tipo_polinizacion: string;
  cantidad_disponible: number;
  estado: 'INGRESADO' | 'EN_PROCESO' | 'LISTO' | 'pendiente';
  observaciones?: string;
  creado_por?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  archivo_origen?: string;

  // NUEVOS CAMPOS DE PLANTAS INVOLUCRADAS - Disponibles en backend pero faltantes en frontend
  planta_madre_codigo?: string | null;
  planta_madre_genero?: string | null;
  planta_madre_especie?: string | null;
  planta_padre_codigo?: string | null;
  planta_padre_genero?: string | null;
  planta_padre_especie?: string | null;
  nueva_planta_codigo?: string | null;
  nueva_planta_genero?: string | null;
  nueva_planta_especie?: string | null;
  
  // NUEVOS CAMPOS DE UBICACIÓN ESPECÍFICA - Disponibles en backend
  vivero?: string | null;
  mesa?: string | null;
  pared?: string | null;
  
  // NUEVOS CAMPOS DE ESTADO Y SEGUIMIENTO - Disponibles en backend
  cantidad_capsulas?: number;
  cantidad_semilla?: 'ABUNDANTE' | 'ESCASA' | null;
  clima?: string | null;

  // Campos adicionales que faltan
  nombre?: string;
  madre_codigo?: string;
  madre_genero?: string;
  madre_especie?: string;
  madre_clima?: string;
  padre_codigo?: string;
  padre_genero?: string;
  padre_especie?: string;
  padre_clima?: string;
  nueva_codigo?: string;
  nueva_genero?: string;
  nueva_especie?: string;
  nueva_clima?: string;
  ubicacion_tipo?: string;
  ubicacion_nombre?: string;
  tipo?: string;
  
  // Campos de predicción ML (nuevos)
  Tipo?: 'SELF' | 'SIBBLING' | 'HYBRID';
  dias_maduracion_predichos?: number;
  fecha_maduracion_predicha?: string;
  metodo_prediccion?: 'ML' | 'heuristica';
  confianza_prediccion?: number;
  
  // Campos de predicción legacy (mantener compatibilidad)
  prediccion_dias_estimados?: number;
  prediccion_confianza?: number;
  prediccion_fecha_estimada?: string;
  prediccion_tipo?: string;
  prediccion_condiciones_climaticas?: string;
  prediccion_especie_info?: string;
  prediccion_parametros_usados?: string;
  
  // Estado y progreso de polinización
  estado_polinizacion?: 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO';
  progreso_polinizacion?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserProfile {
  id: number;
  usuario: number;
  usuario_info: User;
  rol: 'TIPO_1' | 'TIPO_2' | 'TIPO_3' | 'TIPO_4';
  rol_display: string;
  telefono: string;
  departamento: string;
  fecha_ingreso: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  permisos: UserPermissions;
  // Campos de metas y progreso
  meta_polinizaciones: number;
  meta_germinaciones: number;
  tasa_exito_objetivo: number;
  polinizaciones_actuales: number;
  germinaciones_actuales: number;
  tasa_exito_actual: number;
  // Campos calculados de progreso
  progreso_meta_polinizaciones?: number;
  progreso_meta_germinaciones?: number;
  estado_meta_polinizaciones?: string;
  estado_meta_germinaciones?: string;
}

export interface UserPermissions {
  germinaciones: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
  };
  polinizaciones: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
  };
  reportes: {
    ver: boolean;
    generar: boolean;
    exportar: boolean;
  };
  administracion: {
    usuarios: boolean;
    estadisticas_globales: boolean;
  };
}

export interface UserWithProfile extends User {
  profile: UserProfile;
  rol: string;
  rol_display: string;
  permisos: UserPermissions;
}

export interface AuthContextType {
  user: UserWithProfile | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  permissions: UserPermissions | null;
  hasPermission: (module: string, action: string) => boolean;
}

export interface EstadisticasUsuario {
  total_polinizaciones: number;
  total_germinaciones: number;
  polinizaciones_actuales: number;
  germinaciones_actuales: number;
  usuario: string;
}

// ============================================================================
// TIPOS PARA PREDICCIONES DE POLINIZACIÓN CON MODELO .BIN
// ============================================================================

export interface CondicionesClimaticas {
  temperatura?: {
    promedio?: number;
    minima?: number;
    maxima?: number;
  };
  humedad?: number;
  precipitacion?: number;
  estacion?: 'primavera' | 'verano' | 'otoño' | 'invierno';
  viento_promedio?: number;
  horas_luz?: number;
}

export interface PrediccionPolinizacion {
  id: number;
  codigo: string;
  especie: string;
  genero?: string;
  clima?: string;
  ubicacion?: string;
  fecha_polinizacion?: string;
  tipo_polinizacion?: string;
  dias_estimados: number;
  fecha_estimada_semillas?: string;
  confianza: number;
  tipo_prediccion: 'inicial' | 'refinada' | 'basica_con_fecha' | 'validada';
  tipo_prediccion_display: string;
  estado: 'activa' | 'validada' | 'archivada';
  estado_display: string;
  archivo_modelo_usado: string;
  version_modelo?: string;
  usuario_creador: number;
  usuario_creador_info: User;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_maduracion_real?: string;
  dias_reales?: number;
  precision?: number;
  desviacion_dias?: number;
  esta_validada: boolean;
  calidad_prediccion?: string;
  dias_restantes?: number;
  factores_usados: string[];
  condiciones_climaticas?: CondicionesClimaticas;
}

export interface PrediccionPolinizacionRequest {
  especie: string;
  genero?: string;
  clima?: string;
  ubicacion?: string;
  fecha_polinizacion?: string;
  tipo_polinizacion?: string;
  condiciones_climaticas?: CondicionesClimaticas;
  fecha_maduracion?: string;
}

export interface PrediccionPolinizacionResponse {
  dias_estimados: number;
  fecha_estimada_semillas?: string;
  confianza: number;
  tipo_prediccion: 'inicial' | 'refinada' | 'basica_con_fecha' | 'validada';
  especie_info: {
    especie: string;
    tipo: string;
    clima_usado?: string;
    ubicacion_usada?: string;
    metodo: string;
    factores_considerados: string[];
    factores_faltantes?: string[];
    refinamientos_aplicados?: {
      fecha_polinizacion: boolean;
      condiciones_climaticas: boolean;
      tipo_polinizacion: boolean;
    };
    mejora_confianza?: number;
  };
  parametros_usados: PrediccionPolinizacionRequest;
  datos_del_modelo?: {
    dias_base_especie: number;
    factor_clima_especie: number;
    ajuste_clima_aplicado: number;
  };
  comparacion_con_inicial?: {
    dias_iniciales: number;
    dias_refinados: number;
    diferencia_dias: number;
    confianza_inicial: number;
    confianza_refinada: number;
  };
  siguiente_paso?: string;
}

export interface ValidacionPrediccion {
  fecha_estimada: string;
  fecha_real: string;
  fecha_polinizacion: string;
  dias_estimados: number;
  dias_reales: number;
  diferencia_dias: number;
  precision: number;
  desviacion_porcentual: number;
  calidad_prediccion: string;
  tendencia: string;
  factor_correccion: number;
  prediccion_original: PrediccionPolinizacionResponse;
  metricas_detalladas: {
    error_absoluto: number;
    error_relativo: number;
    precision_temporal: number;
    factor_ajuste_sugerido: number;
  };
  recomendaciones_mejora: string[];
  datos_para_entrenamiento: {
    especie: string;
    clima?: string;
    ubicacion?: string;
    tipo_polinizacion?: string;
    dias_reales_observados: number;
    condiciones_climaticas?: CondicionesClimaticas;
  };
}

export interface HistorialPredicciones {
  predicciones: PrediccionPolinizacion[];
  estadisticas: {
    total_predicciones: number;
    predicciones_validadas: number;
    precision_promedio: number;
    especies_mas_predichas: string[];
    confianza_promedio: number;
  };
  filtros_aplicados: {
    especie?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    limit: number;
  };
}

export interface EstadisticasPredicciones {
  total_predicciones: number;
  predicciones_validadas: number;
  precision_promedio: number;
  confianza_promedio: number;
  especies_mas_predichas: {
    especie: string;
    cantidad: number;
    precision_promedio?: number;
  }[];
  distribucion_por_tipo: {
    inicial: number;
    refinada: number;
    basica_con_fecha: number;
    validada: number;
  };
  distribucion_por_calidad: {
    excelente: number;
    buena: number;
    aceptable: number;
    regular: number;
    pobre: number;
  };
  tendencia_mensual: {
    mes: string;
    predicciones: number;
    precision_promedio?: number;
  }[];
  modelo_version: string;
  modelo_precision: number;
  ultima_actualizacion: string;
}

// ============================================================================
// TIPOS PARA PREDICCIONES DE GERMINACIÓN MEJORADAS
// ============================================================================

export interface PrediccionMejoradaResponse {
  success: boolean;
  prediccion: {
    dias_estimados: number;
    fecha_estimada: string;
    fecha_estimada_formatted: string;
    fecha_minima: string;
    fecha_minima_formatted: string;
    fecha_maxima: string;
    fecha_maxima_formatted: string;
    rango_dias: number;
    confianza: number;
    nivel_confianza: 'alta' | 'media' | 'baja';
    modelo_usado: 'ML' | 'HEURISTIC';
    dias_restantes: number;
    estado: string;
    mensaje_estado: string;
  };
  parametros_usados: {
    especie: string;
    genero: string;
    clima: string;
    fecha_siembra: string;
  };
  recomendaciones: string[];
  alertas_configuradas: boolean;
  rango_confianza: {
    descripcion: string;
    color: string;
    precision_esperada: string;
  };
}

export interface AlertaGerminacion {
  id: number;
  codigo: string;
  especie: string;
  genero: string;
  fecha_estimada: string;
  fecha_estimada_formatted: string;
  dias_restantes: number;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'en_revision' | 'completada' | 'vencida';
  mensaje: string;
  tipo_alerta: 'proximidad' | 'proximidad_7_dias' | 'proximidad_3_dias' | 'vencida' | 'hoy';
  acciones_sugeridas?: string[];
  confianza_prediccion: number;
  nivel_confianza: 'alta' | 'media' | 'baja';
  modelo_usado: 'ML' | 'HEURISTIC';
  fecha_creacion: string;
  responsable: string;
}

export interface AlertasGerminacionResponse {
  total_alertas: number;
  alertas_alta_prioridad: number;
  alertas_media_prioridad: number;
  alertas_baja_prioridad: number;
  alertas: AlertaGerminacion[];
  resumen_por_estado: {
    pendiente: number;
    en_revision: number;
    completada: number;
  };
}

export interface AlertaPolinizacion {
  id: number;
  codigo: string;
  especie: string;
  genero: string;
  fecha_polinizacion: string;
  fecha_polinizacion_formatted: string;
  fecha_estimada: string;
  fecha_estimada_formatted: string;
  dias_restantes: number;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'en_revision' | 'completada' | 'vencida';
  mensaje: string;
  tipo_alerta: 'vencida' | 'hoy' | 'muy_pronto' | 'pronto' | 'futuro';
  icono: string;
  confianza: number;
  modelo_usado: string;
  tipo_polinizacion: string;
  cantidad_capsulas: number;
  responsable: {
    id: number | null;
    username: string;
  };
  ubicacion: {
    vivero: string;
    mesa: string;
    pared: string;
  };
  plantas: {
    madre: {
      codigo: string;
      genero: string;
      especie: string;
    };
    padre: {
      codigo: string;
      genero: string;
      especie: string;
    };
    nueva: {
      codigo: string;
      genero: string;
      especie: string;
    };
  };
  acciones_disponibles: string[];
}

export interface AlertasPolinizacionResponse {
  success: boolean;
  alertas: AlertaPolinizacion[];
  estadisticas: {
    total: number;
    por_prioridad: {
      alta: number;
      media: number;
      baja: number;
    };
    por_estado: {
      pendiente: number;
      en_revision: number;
      completada: number;
    };
  };
  total_alertas: number;
  filtros_aplicados: {
    prioridad?: string;
    estado?: string;
    dias_anticipacion: number;
  };
}

export interface EstadisticasPrecisionModelo {
  precision_promedio: number;
  error_promedio_dias: number;
  confianza_promedio: number;
  total_predicciones: number;
  predicciones_pendientes: number;
  predicciones_completadas: number;
  modelo_entrenado: boolean;
  modelo_activo: 'ML' | 'HEURISTIC';
  mejores_predicciones: Array<{
    codigo: string;
    especie: string;
    dias_reales: number;
    dias_estimados: number;
    error_absoluto: number;
    precision: number;
    confianza: number;
  }>;
  especies_mas_precisas: Array<{
    especie: string;
    precision_promedio: number;
    total_registros: number;
  }>;
  evolucion_precision: Array<{
    fecha: string;
    precision: number;
  }>;
}

export interface ReentrenamientoResponse {
  success: boolean;
  mensaje: string;
  modelo_actualizado: boolean;
  estadisticas_anteriores?: {
    precision_promedio: number;
    total_registros: number;
  };
  estadisticas_nuevas?: {
    precision_promedio: number;
    total_registros: number;
    mejora_precision: number;
  };
  fecha_reentrenamiento: string;
  version_modelo: string;
}

export interface ExportacionFiltros {
  fecha_inicio?: string;
  fecha_fin?: string;
  especie?: string;
  genero?: string;
  modelo?: 'ML' | 'HEURISTIC';
  incluir_historial?: boolean;
}

export interface InfoBackupModelo {
  modelo_disponible: boolean;
  ruta_modelo: string;
  tamaño_archivo: number;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
  version_modelo: string;
  total_registros_entrenamiento: number;
  precision_actual: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  favorita?: boolean;
  archivada?: boolean;
  detalles?: any;
  tipo?: string; // Tipo original del backend
  tipoDisplay?: string; // Nombre legible del tipo
  germinacion_id?: number | null; // ID de la germinación relacionada
  polinizacion_id?: number | null; // ID de la polinización relacionada
}

export interface PolinizacionFilterParams {
  search?: string;
  fechapol_desde?: string;
  fechapol_hasta?: string;
  fechamad_desde?: string;
  fechamad_hasta?: string;
  tipo_polinizacion?: string;
  madre_codigo?: string;
  madre_genero?: string;
  madre_especie?: string;
  padre_codigo?: string;
  padre_genero?: string;
  padre_especie?: string;
  nueva_codigo?: string;
  nueva_genero?: string;
  nueva_especie?: string;
  ubicacion_tipo?: string;
  ubicacion_nombre?: string;
  responsable?: string;
  estado?: string;
  ordering?: string;
}