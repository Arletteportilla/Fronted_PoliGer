import { 
  validarDatosPrediccion,
  validarEspecie,
  validarCondicionesClimaticas,
  validarFechaPolinizacion,
  validarTipoPolinizacion,
  obtenerCamposFaltantes,
  esPrediccionCompleta,
  calcularNivelCompletitud
} from '@/utils/validacionPrediccion';

describe('validacionPrediccion', () => {
  describe('validarEspecie', () => {
    it('debe validar especie correcta', () => {
      expect(validarEspecie('cattleya')).toEqual({ esValido: true, errores: [] });
      expect(validarEspecie('phalaenopsis')).toEqual({ esValido: true, errores: [] });
    });

    it('debe rechazar especie vacía', () => {
      const resultado = validarEspecie('');
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La especie es requerida');
    });

    it('debe rechazar especie null o undefined', () => {
      expect(validarEspecie(null as any).esValido).toBe(false);
      expect(validarEspecie(undefined as any).esValido).toBe(false);
    });

    it('debe rechazar especie con solo espacios', () => {
      const resultado = validarEspecie('   ');
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La especie es requerida');
    });

    it('debe rechazar especie demasiado corta', () => {
      const resultado = validarEspecie('ab');
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La especie debe tener al menos 3 caracteres');
    });

    it('debe rechazar especie con caracteres especiales', () => {
      const resultado = validarEspecie('cattleya@123');
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La especie solo puede contener letras, números y guiones');
    });

    it('debe aceptar especie con guiones', () => {
      expect(validarEspecie('cattleya-hybrid').esValido).toBe(true);
    });
  });

  describe('validarCondicionesClimaticas', () => {
    it('debe validar condiciones climáticas correctas', () => {
      const condiciones = {
        temperatura: {
          promedio: 25,
          minima: 18,
          maxima: 32
        },
        humedad: 70,
        precipitacion: 50.5,
        estacion: 'primavera' as const
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(true);
      expect(resultado.errores).toEqual([]);
    });

    it('debe validar condiciones parciales', () => {
      const condiciones = {
        temperatura: { promedio: 25 },
        humedad: 70
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(true);
    });

    it('debe rechazar temperatura fuera de rango', () => {
      const condiciones = {
        temperatura: {
          promedio: 60, // Muy alta
          minima: -20,  // Muy baja
          maxima: 70    // Muy alta
        }
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La temperatura promedio debe estar entre 0°C y 50°C');
      expect(resultado.errores).toContain('La temperatura mínima debe estar entre -10°C y 40°C');
      expect(resultado.errores).toContain('La temperatura máxima debe estar entre 10°C y 60°C');
    });

    it('debe rechazar humedad fuera de rango', () => {
      const condiciones = {
        humedad: 150 // Mayor a 100%
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La humedad debe estar entre 0% y 100%');
    });

    it('debe rechazar precipitación negativa', () => {
      const condiciones = {
        precipitacion: -10
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La precipitación no puede ser negativa');
    });

    it('debe validar temperaturas coherentes', () => {
      const condiciones = {
        temperatura: {
          promedio: 20,
          minima: 25, // Mínima mayor que promedio
          maxima: 15  // Máxima menor que promedio
        }
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La temperatura mínima no puede ser mayor que el promedio');
      expect(resultado.errores).toContain('La temperatura máxima no puede ser menor que el promedio');
    });

    it('debe validar estación correcta', () => {
      const condiciones = {
        estacion: 'invierno' as const
      };

      expect(validarCondicionesClimaticas(condiciones).esValido).toBe(true);
    });

    it('debe rechazar estación inválida', () => {
      const condiciones = {
        estacion: 'estacion-inexistente' as any
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La estación debe ser: primavera, verano, otoño o invierno');
    });
  });

  describe('validarFechaPolinizacion', () => {
    it('debe validar fecha correcta', () => {
      const fecha = '2024-03-15';
      const resultado = validarFechaPolinizacion(fecha);
      expect(resultado.esValido).toBe(true);
    });

    it('debe rechazar fecha futura', () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 1);
      const fechaString = fechaFutura.toISOString().split('T')[0];

      const resultado = validarFechaPolinizacion(fechaString);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La fecha de polinización no puede ser futura');
    });

    it('debe rechazar fecha muy antigua', () => {
      const fechaAntigua = '2020-01-01';
      const resultado = validarFechaPolinizacion(fechaAntigua);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La fecha de polinización no puede ser anterior a 2 años');
    });

    it('debe rechazar formato de fecha inválido', () => {
      const resultado = validarFechaPolinizacion('fecha-invalida');
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('Formato de fecha inválido. Use YYYY-MM-DD');
    });

    it('debe aceptar fecha vacía como opcional', () => {
      expect(validarFechaPolinizacion('').esValido).toBe(true);
      expect(validarFechaPolinizacion(null as any).esValido).toBe(true);
    });
  });

  describe('validarTipoPolinizacion', () => {
    it('debe validar tipos correctos', () => {
      const tiposValidos = ['artificial', 'manual', 'natural', 'cruzada', 'autopolinizacion'];
      
      tiposValidos.forEach(tipo => {
        expect(validarTipoPolinizacion(tipo).esValido).toBe(true);
      });
    });

    it('debe rechazar tipo inválido', () => {
      const resultado = validarTipoPolinizacion('tipo-inexistente');
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('Tipo de polinización no válido');
    });

    it('debe aceptar tipo vacío como opcional', () => {
      expect(validarTipoPolinizacion('').esValido).toBe(true);
      expect(validarTipoPolinizacion(null as any).esValido).toBe(true);
    });
  });

  describe('validarDatosPrediccion', () => {
    it('debe validar datos completos correctos', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio',
        fecha_polinizacion: '2024-03-01',
        tipo_polinizacion: 'artificial',
        condiciones_climaticas: {
          temperatura: { promedio: 25 },
          humedad: 70
        }
      };

      const resultado = validarDatosPrediccion(datos);
      expect(resultado.esValido).toBe(true);
      expect(resultado.errores).toEqual([]);
    });

    it('debe validar datos mínimos', () => {
      const datos = {
        especie: 'cattleya'
      };

      const resultado = validarDatosPrediccion(datos);
      expect(resultado.esValido).toBe(true);
    });

    it('debe rechazar datos sin especie', () => {
      const datos = {
        clima: 'templado'
      };

      const resultado = validarDatosPrediccion(datos);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La especie es requerida');
    });

    it('debe acumular múltiples errores', () => {
      const datos = {
        especie: '', // Inválida
        fecha_polinizacion: 'fecha-invalida', // Inválida
        tipo_polinizacion: 'tipo-inexistente', // Inválido
        condiciones_climaticas: {
          temperatura: { promedio: 100 } // Fuera de rango
        }
      };

      const resultado = validarDatosPrediccion(datos);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores.length).toBeGreaterThan(1);
    });
  });

  describe('obtenerCamposFaltantes', () => {
    it('debe identificar campos faltantes para predicción básica', () => {
      const datos = {
        especie: 'cattleya'
      };

      const faltantes = obtenerCamposFaltantes(datos);
      expect(faltantes).toContain('clima');
      expect(faltantes).toContain('ubicacion');
    });

    it('debe identificar campos faltantes para predicción avanzada', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado'
      };

      const faltantes = obtenerCamposFaltantes(datos, 'avanzada');
      expect(faltantes).toContain('fecha_polinizacion');
      expect(faltantes).toContain('tipo_polinizacion');
      expect(faltantes).toContain('condiciones_climaticas');
    });

    it('debe retornar array vacío cuando todos los campos están presentes', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio'
      };

      const faltantes = obtenerCamposFaltantes(datos);
      expect(faltantes).toEqual([]);
    });
  });

  describe('esPrediccionCompleta', () => {
    it('debe identificar predicción completa básica', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio'
      };

      expect(esPrediccionCompleta(datos)).toBe(true);
    });

    it('debe identificar predicción completa avanzada', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio',
        fecha_polinizacion: '2024-03-01',
        tipo_polinizacion: 'artificial',
        condiciones_climaticas: {
          temperatura: { promedio: 25 },
          humedad: 70
        }
      };

      expect(esPrediccionCompleta(datos, 'avanzada')).toBe(true);
    });

    it('debe identificar predicción incompleta', () => {
      const datos = {
        especie: 'cattleya'
      };

      expect(esPrediccionCompleta(datos)).toBe(false);
    });
  });

  describe('calcularNivelCompletitud', () => {
    it('debe calcular completitud básica correctamente', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado'
        // Falta ubicacion
      };

      const nivel = calcularNivelCompletitud(datos);
      expect(nivel.porcentaje).toBeCloseTo(66.67, 1); // 2 de 3 campos
      expect(nivel.camposCompletos).toBe(2);
      expect(nivel.camposTotal).toBe(3);
    });

    it('debe calcular completitud avanzada correctamente', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio',
        fecha_polinizacion: '2024-03-01'
        // Faltan tipo_polinizacion y condiciones_climaticas
      };

      const nivel = calcularNivelCompletitud(datos, 'avanzada');
      expect(nivel.porcentaje).toBeCloseTo(66.67, 1); // 4 de 6 campos
      expect(nivel.camposCompletos).toBe(4);
      expect(nivel.camposTotal).toBe(6);
    });

    it('debe manejar completitud del 100%', () => {
      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio'
      };

      const nivel = calcularNivelCompletitud(datos);
      expect(nivel.porcentaje).toBe(100);
      expect(nivel.esCompleto).toBe(true);
    });

    it('debe manejar completitud del 0%', () => {
      const datos = {};

      const nivel = calcularNivelCompletitud(datos);
      expect(nivel.porcentaje).toBe(0);
      expect(nivel.esCompleto).toBe(false);
      expect(nivel.camposCompletos).toBe(0);
    });
  });

  describe('Casos edge y validaciones especiales', () => {
    it('debe manejar datos null o undefined', () => {
      expect(validarDatosPrediccion(null as any).esValido).toBe(false);
      expect(validarDatosPrediccion(undefined as any).esValido).toBe(false);
    });

    it('debe manejar condiciones climáticas vacías', () => {
      const datos = {
        especie: 'cattleya',
        condiciones_climaticas: {}
      };

      const resultado = validarDatosPrediccion(datos);
      expect(resultado.esValido).toBe(true);
    });

    it('debe validar coherencia entre temperaturas cuando todas están presentes', () => {
      const condiciones = {
        temperatura: {
          promedio: 25,
          minima: 20,
          maxima: 30
        }
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(true);
    });

    it('debe manejar valores de temperatura como strings', () => {
      const condiciones = {
        temperatura: {
          promedio: '25' as any,
          minima: '20' as any,
          maxima: '30' as any
        }
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La temperatura debe ser un número');
    });

    it('debe validar precipitación extremadamente alta', () => {
      const condiciones = {
        precipitacion: 1000 // Muy alta pero técnicamente posible
      };

      const resultado = validarCondicionesClimaticas(condiciones);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toContain('La precipitación parece excesivamente alta (máximo 500mm)');
    });
  });
});