import { prediccionService } from '@/services/prediccion.service';
import { polinizacionPrediccionService } from '@/services/polinizacion-prediccion.service';
import api from '@/services/api';

// Mock del API
jest.mock('@/services/api');

// Mock del servicio de polinización
jest.mock('@/services/polinizacion-prediccion.service', () => ({
  polinizacionPrediccionService: {
    generarPrediccionInicial: jest.fn(),
    refinarPrediccion: jest.fn(),
    validarPrediccion: jest.fn(),
    obtenerHistorial: jest.fn(),
    prediccionCompleta: jest.fn(),
    obtenerEstadisticas: jest.fn(),
    validarDatosPrediccion: jest.fn(),
    formatearFecha: jest.fn(),
    calcularDiasRestantes: jest.fn(),
    obtenerColorConfianza: jest.fn(),
    obtenerColorPrecision: jest.fn()
  }
}));

describe('PrediccionService', () => {
  const mockApiResponse = {
    data: {
      dias_estimados: 45,
      fecha_germinacion: '2024-03-15',
      especie_info: {
        especie: 'cattleya',
        genero: 'cattleya'
      }
    }
  };

  const mockPrediccionPolinizacionResponse = {
    dias_estimados: 42,
    confianza: 88,
    fecha_estimada_semillas: '2024-03-12',
    tipo_prediccion: 'inicial',
    especie_info: {
      especie: 'cattleya',
      metodo: 'modelo_bin',
      factores_considerados: ['especie', 'clima'],
      factores_faltantes: []
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Predicciones de germinación (métodos existentes)', () => {
    it('debe predecir germinación correctamente', async () => {
      (api.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio'
      };

      const resultado = await prediccionService.predecirGerminacion(datos);

      expect(api.post).toHaveBeenCalledWith('predicciones/germinacion/', datos);
      expect(resultado).toEqual(mockApiResponse.data);
    });

    it('debe manejar errores en predicción de germinación', async () => {
      const error = new Error('Error de conexión');
      (api.post as jest.Mock).mockRejectedValue(error);

      const datos = { especie: 'cattleya' };

      await expect(prediccionService.predecirGerminacion(datos)).rejects.toThrow('Error de conexión');
    });

    it('debe predecir polinización (método legacy)', async () => {
      (api.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const datos = { especie: 'cattleya' };
      const resultado = await prediccionService.predecirPolinizacion(datos);

      expect(api.post).toHaveBeenCalledWith('predicciones/polinizacion/', datos);
      expect(resultado).toEqual(mockApiResponse.data);
    });

    it('debe realizar predicción completa', async () => {
      (api.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        f_siembra: '2024-01-15'
      };

      const resultado = await prediccionService.prediccionCompleta(datos);

      expect(api.post).toHaveBeenCalledWith('predicciones/completa/', datos);
      expect(resultado).toEqual(mockApiResponse.data);
    });

    it('debe obtener estadísticas de modelos', async () => {
      const mockEstadisticas = {
        data: {
          total_predicciones: 100,
          precision_promedio: 85.5
        }
      };

      (api.get as jest.Mock).mockResolvedValue(mockEstadisticas);

      const resultado = await prediccionService.obtenerEstadisticasModelos();

      expect(api.get).toHaveBeenCalledWith('predicciones/estadisticas/');
      expect(resultado).toEqual(mockEstadisticas.data);
    });
  });

  describe('Predicciones de polinización con modelo .bin', () => {
    it('debe generar predicción inicial de polinización', async () => {
      (polinizacionPrediccionService.generarPrediccionInicial as jest.Mock)
        .mockResolvedValue(mockPrediccionPolinizacionResponse);

      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        ubicacion: 'laboratorio'
      };

      const resultado = await prediccionService.predecirPolinizacionInicial(datos);

      expect(polinizacionPrediccionService.generarPrediccionInicial)
        .toHaveBeenCalledWith(datos);
      expect(resultado).toEqual(mockPrediccionPolinizacionResponse);
    });

    it('debe refinar predicción de polinización', async () => {
      const mockRefinedResponse = {
        ...mockPrediccionPolinizacionResponse,
        tipo_prediccion: 'refinada',
        confianza: 92
      };

      (polinizacionPrediccionService.refinarPrediccion as jest.Mock)
        .mockResolvedValue(mockRefinedResponse);

      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        fecha_polinizacion: '2024-02-15',
        tipo_polinizacion: 'artificial'
      };

      const resultado = await prediccionService.refinarPrediccionPolinizacion(datos);

      expect(polinizacionPrediccionService.refinarPrediccion)
        .toHaveBeenCalledWith(datos);
      expect(resultado).toEqual(mockRefinedResponse);
    });

    it('debe validar predicción de polinización', async () => {
      const mockValidationResponse = {
        precision: 89.5,
        calidad_prediccion: 'excelente',
        diferencia_dias: 1
      };

      (polinizacionPrediccionService.validarPrediccion as jest.Mock)
        .mockResolvedValue(mockValidationResponse);

      const prediccionOriginal = mockPrediccionPolinizacionResponse;
      const fechaMaduracion = '2024-03-13';

      const resultado = await prediccionService.validarPrediccionPolinizacion(
        prediccionOriginal,
        fechaMaduracion
      );

      expect(polinizacionPrediccionService.validarPrediccion)
        .toHaveBeenCalledWith(prediccionOriginal, fechaMaduracion);
      expect(resultado).toEqual(mockValidationResponse);
    });

    it('debe obtener historial de predicciones de polinización', async () => {
      const mockHistorial = {
        predicciones: [mockPrediccionPolinizacionResponse],
        estadisticas: {
          total_predicciones: 1,
          precision_promedio: 89.5
        }
      };

      (polinizacionPrediccionService.obtenerHistorial as jest.Mock)
        .mockResolvedValue(mockHistorial);

      const filtros = {
        especie: 'cattleya',
        fecha_desde: '2024-01-01',
        limit: 20
      };

      const resultado = await prediccionService.obtenerHistorialPolinizacion(filtros);

      expect(polinizacionPrediccionService.obtenerHistorial)
        .toHaveBeenCalledWith(filtros);
      expect(resultado).toEqual(mockHistorial);
    });

    it('debe obtener historial sin filtros', async () => {
      const mockHistorial = {
        predicciones: [],
        estadisticas: { total_predicciones: 0 }
      };

      (polinizacionPrediccionService.obtenerHistorial as jest.Mock)
        .mockResolvedValue(mockHistorial);

      const resultado = await prediccionService.obtenerHistorialPolinizacion();

      expect(polinizacionPrediccionService.obtenerHistorial)
        .toHaveBeenCalledWith(undefined);
      expect(resultado).toEqual(mockHistorial);
    });

    it('debe realizar predicción completa de polinización', async () => {
      (polinizacionPrediccionService.prediccionCompleta as jest.Mock)
        .mockResolvedValue(mockPrediccionPolinizacionResponse);

      const datos = {
        especie: 'cattleya',
        clima: 'templado',
        fecha_polinizacion: '2024-02-15'
      };

      const resultado = await prediccionService.prediccionPolinizacionCompleta(datos);

      expect(polinizacionPrediccionService.prediccionCompleta)
        .toHaveBeenCalledWith(datos);
      expect(resultado).toEqual(mockPrediccionPolinizacionResponse);
    });

    it('debe obtener estadísticas de predicciones de polinización', async () => {
      const mockEstadisticas = {
        total_predicciones: 25,
        precision_promedio: 87.3,
        especies_mas_predichas: [
          { especie: 'cattleya', cantidad: 8 }
        ]
      };

      (polinizacionPrediccionService.obtenerEstadisticas as jest.Mock)
        .mockResolvedValue(mockEstadisticas);

      const resultado = await prediccionService.obtenerEstadisticasPolinizacion();

      expect(polinizacionPrediccionService.obtenerEstadisticas)
        .toHaveBeenCalled();
      expect(resultado).toEqual(mockEstadisticas);
    });
  });

  describe('Utilidades para predicciones de polinización', () => {
    it('debe validar datos de polinización', () => {
      const mockErrores = ['La especie es requerida'];
      (polinizacionPrediccionService.validarDatosPrediccion as jest.Mock)
        .mockReturnValue(mockErrores);

      const datos = { clima: 'templado' };
      const resultado = prediccionService.validarDatosPolinizacion(datos);

      expect(polinizacionPrediccionService.validarDatosPrediccion)
        .toHaveBeenCalledWith(datos);
      expect(resultado).toEqual(mockErrores);
    });

    it('debe formatear fecha correctamente', () => {
      const fechaFormateada = '15/03/2024';
      (polinizacionPrediccionService.formatearFecha as jest.Mock)
        .mockReturnValue(fechaFormateada);

      const fecha = '2024-03-15';
      const resultado = prediccionService.formatearFecha(fecha);

      expect(polinizacionPrediccionService.formatearFecha)
        .toHaveBeenCalledWith(fecha);
      expect(resultado).toBe(fechaFormateada);
    });

    it('debe calcular días restantes correctamente', () => {
      const diasRestantes = 15;
      (polinizacionPrediccionService.calcularDiasRestantes as jest.Mock)
        .mockReturnValue(diasRestantes);

      const fechaObjetivo = '2024-03-30';
      const resultado = prediccionService.calcularDiasRestantes(fechaObjetivo);

      expect(polinizacionPrediccionService.calcularDiasRestantes)
        .toHaveBeenCalledWith(fechaObjetivo);
      expect(resultado).toBe(diasRestantes);
    });

    it('debe obtener color de confianza correctamente', () => {
      const color = '#4CAF50';
      (polinizacionPrediccionService.obtenerColorConfianza as jest.Mock)
        .mockReturnValue(color);

      const confianza = 85;
      const resultado = prediccionService.obtenerColorConfianza(confianza);

      expect(polinizacionPrediccionService.obtenerColorConfianza)
        .toHaveBeenCalledWith(confianza);
      expect(resultado).toBe(color);
    });

    it('debe obtener color de precisión correctamente', () => {
      const color = '#FF9800';
      (polinizacionPrediccionService.obtenerColorPrecision as jest.Mock)
        .mockReturnValue(color);

      const precision = 75;
      const resultado = prediccionService.obtenerColorPrecision(precision);

      expect(polinizacionPrediccionService.obtenerColorPrecision)
        .toHaveBeenCalledWith(precision);
      expect(resultado).toBe(color);
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores en predicción inicial de polinización', async () => {
      const error = new Error('Error del modelo');
      (polinizacionPrediccionService.generarPrediccionInicial as jest.Mock)
        .mockRejectedValue(error);

      const datos = { especie: 'cattleya' };

      await expect(prediccionService.predecirPolinizacionInicial(datos))
        .rejects.toThrow('Error del modelo');
    });

    it('debe manejar errores en refinamiento de predicción', async () => {
      const error = new Error('Error de validación');
      (polinizacionPrediccionService.refinarPrediccion as jest.Mock)
        .mockRejectedValue(error);

      const datos = { especie: 'cattleya' };

      await expect(prediccionService.refinarPrediccionPolinizacion(datos))
        .rejects.toThrow('Error de validación');
    });

    it('debe manejar errores en validación de predicción', async () => {
      const error = new Error('Error de validación');
      (polinizacionPrediccionService.validarPrediccion as jest.Mock)
        .mockRejectedValue(error);

      const prediccion = mockPrediccionPolinizacionResponse;
      const fecha = '2024-03-15';

      await expect(prediccionService.validarPrediccionPolinizacion(prediccion, fecha))
        .rejects.toThrow('Error de validación');
    });

    it('debe manejar errores en obtención de historial', async () => {
      const error = new Error('Error de base de datos');
      (polinizacionPrediccionService.obtenerHistorial as jest.Mock)
        .mockRejectedValue(error);

      await expect(prediccionService.obtenerHistorialPolinizacion())
        .rejects.toThrow('Error de base de datos');
    });

    it('debe manejar errores en obtención de estadísticas', async () => {
      const error = new Error('Error de estadísticas');
      (polinizacionPrediccionService.obtenerEstadisticas as jest.Mock)
        .mockRejectedValue(error);

      await expect(prediccionService.obtenerEstadisticasPolinizacion())
        .rejects.toThrow('Error de estadísticas');
    });
  });

  describe('Casos edge', () => {
    it('debe manejar datos vacíos en validación', () => {
      (polinizacionPrediccionService.validarDatosPrediccion as jest.Mock)
        .mockReturnValue([]);

      const resultado = prediccionService.validarDatosPolinizacion({});

      expect(resultado).toEqual([]);
    });

    it('debe manejar fecha nula en formateo', () => {
      (polinizacionPrediccionService.formatearFecha as jest.Mock)
        .mockReturnValue('');

      const resultado = prediccionService.formatearFecha('');

      expect(resultado).toBe('');
    });

    it('debe manejar días restantes negativos', () => {
      (polinizacionPrediccionService.calcularDiasRestantes as jest.Mock)
        .mockReturnValue(0);

      const resultado = prediccionService.calcularDiasRestantes('2024-01-01');

      expect(resultado).toBe(0);
    });

    it('debe manejar confianza fuera de rango', () => {
      (polinizacionPrediccionService.obtenerColorConfianza as jest.Mock)
        .mockReturnValue('#F44336');

      const resultado = prediccionService.obtenerColorConfianza(150);

      expect(resultado).toBe('#F44336');
    });
  });

  describe('Integración entre métodos', () => {
    it('debe poder usar predicción inicial seguida de refinamiento', async () => {
      // Predicción inicial
      (polinizacionPrediccionService.generarPrediccionInicial as jest.Mock)
        .mockResolvedValue(mockPrediccionPolinizacionResponse);

      const datosIniciales = { especie: 'cattleya' };
      const prediccionInicial = await prediccionService.predecirPolinizacionInicial(datosIniciales);

      // Refinamiento
      const mockRefinedResponse = {
        ...mockPrediccionPolinizacionResponse,
        tipo_prediccion: 'refinada',
        confianza: 92
      };

      (polinizacionPrediccionService.refinarPrediccion as jest.Mock)
        .mockResolvedValue(mockRefinedResponse);

      const datosRefinamiento = {
        ...datosIniciales,
        fecha_polinizacion: '2024-02-15'
      };

      const prediccionRefinada = await prediccionService.refinarPrediccionPolinizacion(datosRefinamiento);

      expect(prediccionInicial.tipo_prediccion).toBe('inicial');
      expect(prediccionRefinada.tipo_prediccion).toBe('refinada');
      expect(prediccionRefinada.confianza).toBeGreaterThan(prediccionInicial.confianza);
    });
  });
});