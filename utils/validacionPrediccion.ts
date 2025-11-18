/**
 * Utilidades de validación para predicciones de polinización
 * Valida datos antes de enviarlos al backend
 */

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  codigo: string;
}

export interface ResultadoValidacion {
  esValido: boolean;
  errores: ErrorValidacion[];
}

export class ValidadorPrediccion {
  
  // Especies soportadas por el modelo
  private static readonly ESPECIES_SOPORTADAS = [
    'cattleya', 'phalaenopsis', 'dendrobium', 'oncidium', 'vanda',
    'cymbidium', 'paphiopedilum', 'miltonia', 'brassia', 'odontoglossum',
    'masdevallia', 'pleurothallis'
  ];
  
  // Climas válidos
  private static readonly CLIMAS_VALIDOS = [
    'frio', 'templado', 'calido', 'humedo', 'seco'
  ];
  
  // Ubicaciones válidas
  private static readonly UBICACIONES_VALIDAS = [
    'laboratorio', 'invernadero', 'vivero', 'exterior', 'campo'
  ];
  
  // Tipos de polinización válidos
  private static readonly TIPOS_POLINIZACION_VALIDOS = [
    'self', 'sibling', 'hibrida'
  ];
  
  // Estaciones válidas
  private static readonly ESTACIONES_VALIDAS = [
    'primavera', 'verano', 'otoño', 'invierno'
  ];

  /**
   * Valida los datos básicos requeridos para una predicción
   */
  static validarDatosBasicos(datos: {
    especie?: string;
    clima?: string;
    ubicacion?: string;
  }): ResultadoValidacion {
    const errores: ErrorValidacion[] = [];

    // Validar especie (requerida)
    if (!datos.especie) {
      errores.push({
        campo: 'especie',
        mensaje: 'La especie es requerida para generar una predicción',
        codigo: 'ESPECIE_REQUERIDA'
      });
    } else if (typeof datos.especie !== 'string') {
      errores.push({
        campo: 'especie',
        mensaje: 'La especie debe ser una cadena de texto',
        codigo: 'ESPECIE_TIPO_INVALIDO'
      });
    } else if (datos.especie.trim() === '') {
      errores.push({
        campo: 'especie',
        mensaje: 'La especie no puede estar vacía',
        codigo: 'ESPECIE_VACIA'
      });
    } else if (!this.ESPECIES_SOPORTADAS.includes(datos.especie.toLowerCase().trim())) {
      errores.push({
        campo: 'especie',
        mensaje: `La especie '${datos.especie}' no está soportada. Especies disponibles: ${this.ESPECIES_SOPORTADAS.join(', ')}`,
        codigo: 'ESPECIE_NO_SOPORTADA'
      });
    }

    // Validar clima (opcional)
    if (datos.clima !== undefined && datos.clima !== null) {
      if (typeof datos.clima !== 'string') {
        errores.push({
          campo: 'clima',
          mensaje: 'El clima debe ser una cadena de texto',
          codigo: 'CLIMA_TIPO_INVALIDO'
        });
      } else if (datos.clima.trim() !== '' && !this.CLIMAS_VALIDOS.includes(datos.clima.toLowerCase().trim())) {
        errores.push({
          campo: 'clima',
          mensaje: `El clima '${datos.clima}' no es válido. Climas disponibles: ${this.CLIMAS_VALIDOS.join(', ')}`,
          codigo: 'CLIMA_INVALIDO'
        });
      }
    }

    // Validar ubicación (opcional)
    if (datos.ubicacion !== undefined && datos.ubicacion !== null) {
      if (typeof datos.ubicacion !== 'string') {
        errores.push({
          campo: 'ubicacion',
          mensaje: 'La ubicación debe ser una cadena de texto',
          codigo: 'UBICACION_TIPO_INVALIDO'
        });
      } else if (datos.ubicacion.trim() !== '' && !this.UBICACIONES_VALIDAS.includes(datos.ubicacion.toLowerCase().trim())) {
        errores.push({
          campo: 'ubicacion',
          mensaje: `La ubicación '${datos.ubicacion}' no es válida. Ubicaciones disponibles: ${this.UBICACIONES_VALIDAS.join(', ')}`,
          codigo: 'UBICACION_INVALIDA'
        });
      }
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * Valida formato y validez de una fecha
   */
  static validarFecha(fechaStr: string, nombreCampo: string): ErrorValidacion[] {
    const errores: ErrorValidacion[] = [];

    if (!fechaStr) {
      return errores; // Fecha opcional
    }

    // Validar formato YYYY-MM-DD
    const patronFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!patronFecha.test(fechaStr)) {
      errores.push({
        campo: nombreCampo,
        mensaje: `El formato de ${nombreCampo} debe ser YYYY-MM-DD, recibido: ${fechaStr}`,
        codigo: 'FECHA_FORMATO_INVALIDO'
      });
      return errores;
    }

    // Validar que sea una fecha válida
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      errores.push({
        campo: nombreCampo,
        mensaje: `La ${nombreCampo} no es una fecha válida: ${fechaStr}`,
        codigo: 'FECHA_INVALIDA'
      });
      return errores;
    }

    // Verificar que no sea futura
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Fin del día actual
    if (fecha > hoy) {
      errores.push({
        campo: nombreCampo,
        mensaje: `La ${nombreCampo} no puede ser futura. Fecha: ${fechaStr}`,
        codigo: 'FECHA_FUTURA'
      });
    }

    return errores;
  }

  /**
   * Valida la relación entre fechas de polinización y maduración
   */
  static validarFechasRelacionadas(
    fechaPolinizacion?: string,
    fechaMaduracion?: string
  ): ErrorValidacion[] {
    const errores: ErrorValidacion[] = [];

    if (fechaPolinizacion && fechaMaduracion) {
      const fechaPol = new Date(fechaPolinizacion);
      const fechaMad = new Date(fechaMaduracion);

      if (fechaMad <= fechaPol) {
        errores.push({
          campo: 'fecha_maduracion',
          mensaje: `La fecha de maduración (${fechaMaduracion}) debe ser posterior a la fecha de polinización (${fechaPolinizacion})`,
          codigo: 'FECHAS_ORDEN_INVALIDO'
        });
      }

      // Verificar que no sea demasiado pronto (mínimo 7 días)
      const diferenciaDias = Math.floor((fechaMad.getTime() - fechaPol.getTime()) / (1000 * 60 * 60 * 24));
      if (diferenciaDias < 7) {
        errores.push({
          campo: 'fecha_maduracion',
          mensaje: `La fecha de maduración debe ser al menos 7 días después de la polinización. Diferencia actual: ${diferenciaDias} días`,
          codigo: 'MADURACION_MUY_TEMPRANA'
        });
      }
    }

    return errores;
  }

  /**
   * Valida el tipo de polinización
   */
  static validarTipoPolinizacion(tipoPolinizacion?: string): ErrorValidacion[] {
    const errores: ErrorValidacion[] = [];

    if (tipoPolinizacion && !this.TIPOS_POLINIZACION_VALIDOS.includes(tipoPolinizacion.toLowerCase().trim())) {
      errores.push({
        campo: 'tipo_polinizacion',
        mensaje: `El tipo de polinización '${tipoPolinizacion}' no es válido. Tipos disponibles: ${this.TIPOS_POLINIZACION_VALIDOS.join(', ')}`,
        codigo: 'TIPO_POLINIZACION_INVALIDO'
      });
    }

    return errores;
  }

  /**
   * Valida las condiciones climáticas detalladas
   */
  static validarCondicionesClimaticas(condiciones?: any): ErrorValidacion[] {
    const errores: ErrorValidacion[] = [];

    if (!condiciones) {
      return errores; // Condiciones opcionales
    }

    if (typeof condiciones !== 'object' || condiciones === null) {
      errores.push({
        campo: 'condiciones_climaticas',
        mensaje: 'Las condiciones climáticas deben ser un objeto',
        codigo: 'CONDICIONES_TIPO_INVALIDO'
      });
      return errores;
    }

    // Validar temperatura
    if (condiciones.temperatura) {
      if (typeof condiciones.temperatura !== 'object') {
        errores.push({
          campo: 'condiciones_climaticas.temperatura',
          mensaje: 'La temperatura debe ser un objeto con promedio, mínima y máxima',
          codigo: 'TEMPERATURA_TIPO_INVALIDO'
        });
      } else {
        // Validar temperatura promedio
        if (condiciones.temperatura.promedio !== undefined) {
          const tempPromedio = Number(condiciones.temperatura.promedio);
          if (isNaN(tempPromedio)) {
            errores.push({
              campo: 'condiciones_climaticas.temperatura.promedio',
              mensaje: 'La temperatura promedio debe ser un número',
              codigo: 'TEMPERATURA_PROMEDIO_INVALIDA'
            });
          } else if (tempPromedio < -50 || tempPromedio > 60) {
            errores.push({
              campo: 'condiciones_climaticas.temperatura.promedio',
              mensaje: 'La temperatura promedio debe estar entre -50°C y 60°C',
              codigo: 'TEMPERATURA_PROMEDIO_FUERA_RANGO'
            });
          }
        }

        // Validar temperatura mínima
        if (condiciones.temperatura.minima !== undefined) {
          const tempMinima = Number(condiciones.temperatura.minima);
          if (isNaN(tempMinima)) {
            errores.push({
              campo: 'condiciones_climaticas.temperatura.minima',
              mensaje: 'La temperatura mínima debe ser un número',
              codigo: 'TEMPERATURA_MINIMA_INVALIDA'
            });
          } else if (tempMinima < -60 || tempMinima > 50) {
            errores.push({
              campo: 'condiciones_climaticas.temperatura.minima',
              mensaje: 'La temperatura mínima debe estar entre -60°C y 50°C',
              codigo: 'TEMPERATURA_MINIMA_FUERA_RANGO'
            });
          }
        }

        // Validar temperatura máxima
        if (condiciones.temperatura.maxima !== undefined) {
          const tempMaxima = Number(condiciones.temperatura.maxima);
          if (isNaN(tempMaxima)) {
            errores.push({
              campo: 'condiciones_climaticas.temperatura.maxima',
              mensaje: 'La temperatura máxima debe ser un número',
              codigo: 'TEMPERATURA_MAXIMA_INVALIDA'
            });
          } else if (tempMaxima < -40 || tempMaxima > 70) {
            errores.push({
              campo: 'condiciones_climaticas.temperatura.maxima',
              mensaje: 'La temperatura máxima debe estar entre -40°C y 70°C',
              codigo: 'TEMPERATURA_MAXIMA_FUERA_RANGO'
            });
          }
        }

        // Validar coherencia entre temperaturas
        if (condiciones.temperatura.minima !== undefined && condiciones.temperatura.maxima !== undefined) {
          const tempMin = Number(condiciones.temperatura.minima);
          const tempMax = Number(condiciones.temperatura.maxima);
          if (!isNaN(tempMin) && !isNaN(tempMax) && tempMin > tempMax) {
            errores.push({
              campo: 'condiciones_climaticas.temperatura',
              mensaje: 'La temperatura mínima no puede ser mayor que la máxima',
              codigo: 'TEMPERATURAS_INCOHERENTES'
            });
          }
        }
      }
    }

    // Validar humedad
    if (condiciones.humedad !== undefined) {
      const humedad = Number(condiciones.humedad);
      if (isNaN(humedad)) {
        errores.push({
          campo: 'condiciones_climaticas.humedad',
          mensaje: 'La humedad debe ser un número',
          codigo: 'HUMEDAD_INVALIDA'
        });
      } else if (humedad < 0 || humedad > 100) {
        errores.push({
          campo: 'condiciones_climaticas.humedad',
          mensaje: 'La humedad debe estar entre 0% y 100%',
          codigo: 'HUMEDAD_FUERA_RANGO'
        });
      }
    }

    // Validar precipitación
    if (condiciones.precipitacion !== undefined) {
      const precipitacion = Number(condiciones.precipitacion);
      if (isNaN(precipitacion)) {
        errores.push({
          campo: 'condiciones_climaticas.precipitacion',
          mensaje: 'La precipitación debe ser un número',
          codigo: 'PRECIPITACION_INVALIDA'
        });
      } else if (precipitacion < 0) {
        errores.push({
          campo: 'condiciones_climaticas.precipitacion',
          mensaje: 'La precipitación no puede ser negativa',
          codigo: 'PRECIPITACION_NEGATIVA'
        });
      } else if (precipitacion > 1000) {
        errores.push({
          campo: 'condiciones_climaticas.precipitacion',
          mensaje: 'La precipitación parece excesivamente alta (>1000mm)',
          codigo: 'PRECIPITACION_EXCESIVA'
        });
      }
    }

    // Validar estación
    if (condiciones.estacion) {
      if (typeof condiciones.estacion !== 'string') {
        errores.push({
          campo: 'condiciones_climaticas.estacion',
          mensaje: 'La estación debe ser una cadena de texto',
          codigo: 'ESTACION_TIPO_INVALIDO'
        });
      } else if (!this.ESTACIONES_VALIDAS.includes(condiciones.estacion.toLowerCase().trim())) {
        errores.push({
          campo: 'condiciones_climaticas.estacion',
          mensaje: `La estación '${condiciones.estacion}' no es válida. Estaciones disponibles: ${this.ESTACIONES_VALIDAS.join(', ')}`,
          codigo: 'ESTACION_INVALIDA'
        });
      }
    }

    return errores;
  }

  /**
   * Valida todos los datos de una predicción completa
   */
  static validarDatosCompletos(datos: {
    especie?: string;
    clima?: string;
    ubicacion?: string;
    fecha_polinizacion?: string;
    fecha_maduracion?: string;
    tipo_polinizacion?: string;
    condiciones_climaticas?: any;
  }): ResultadoValidacion {
    const errores: ErrorValidacion[] = [];

    // Validar datos básicos
    const validacionBasica = this.validarDatosBasicos(datos);
    errores.push(...validacionBasica.errores);

    // Si hay errores básicos, no continuar
    if (validacionBasica.errores.length > 0) {
      return {
        esValido: false,
        errores
      };
    }

    // Validar fechas
    errores.push(...this.validarFecha(datos.fecha_polinizacion || '', 'fecha de polinización'));
    errores.push(...this.validarFecha(datos.fecha_maduracion || '', 'fecha de maduración'));

    // Validar relación entre fechas
    errores.push(...this.validarFechasRelacionadas(datos.fecha_polinizacion, datos.fecha_maduracion));

    // Validar tipo de polinización
    errores.push(...this.validarTipoPolinizacion(datos.tipo_polinizacion));

    // Validar condiciones climáticas
    errores.push(...this.validarCondicionesClimaticas(datos.condiciones_climaticas));

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * Valida que una predicción tenga los datos necesarios para ser validada
   */
  static validarPrediccionParaValidacion(prediccionData: any): ResultadoValidacion {
    const errores: ErrorValidacion[] = [];

    if (!prediccionData) {
      errores.push({
        campo: 'prediccion',
        mensaje: 'Se requieren los datos de la predicción original',
        codigo: 'PREDICCION_REQUERIDA'
      });
      return {
        esValido: false,
        errores
      };
    }

    // Verificar campos requeridos para validación
    const camposRequeridos = ['dias_estimados', 'parametros_usados'];
    for (const campo of camposRequeridos) {
      if (!(campo in prediccionData)) {
        errores.push({
          campo: 'prediccion',
          mensaje: `La predicción debe contener el campo '${campo}'`,
          codigo: 'CAMPO_FALTANTE'
        });
      }
    }

    // Verificar que tenga fecha de polinización
    const parametrosUsados = prediccionData.parametros_usados || {};
    if (!parametrosUsados.fecha_polinizacion) {
      errores.push({
        campo: 'prediccion',
        mensaje: 'La predicción debe tener una fecha de polinización para poder ser validada',
        codigo: 'FECHA_POLINIZACION_FALTANTE'
      });
    }

    // Verificar que los días estimados sean válidos
    if (prediccionData.dias_estimados !== undefined) {
      const diasEstimados = Number(prediccionData.dias_estimados);
      if (isNaN(diasEstimados) || diasEstimados <= 0) {
        errores.push({
          campo: 'prediccion',
          mensaje: 'Los días estimados deben ser un número positivo',
          codigo: 'DIAS_ESTIMADOS_INVALIDOS'
        });
      }
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * Obtiene las especies soportadas
   */
  static obtenerEspeciesSoportadas(): string[] {
    return [...this.ESPECIES_SOPORTADAS];
  }

  /**
   * Obtiene los climas válidos
   */
  static obtenerClimasValidos(): string[] {
    return [...this.CLIMAS_VALIDOS];
  }

  /**
   * Obtiene las ubicaciones válidas
   */
  static obtenerUbicacionesValidas(): string[] {
    return [...this.UBICACIONES_VALIDAS];
  }

  /**
   * Obtiene los tipos de polinización válidos
   */
  static obtenerTiposPolinizacionValidos(): string[] {
    return [...this.TIPOS_POLINIZACION_VALIDOS];
  }

  /**
   * Obtiene las estaciones válidas
   */
  static obtenerEstacionesValidas(): string[] {
    return [...this.ESTACIONES_VALIDAS];
  }
}

// Funciones de utilidad para uso rápido
export const validarDatosBasicos = (datos: any) => ValidadorPrediccion.validarDatosBasicos(datos);
export const validarDatosCompletos = (datos: any) => ValidadorPrediccion.validarDatosCompletos(datos);
export const validarFecha = (fecha: string, nombre: string) => ValidadorPrediccion.validarFecha(fecha, nombre);