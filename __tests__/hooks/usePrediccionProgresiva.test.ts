import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePrediccionProgresiva } from '@/hooks/usePrediccionProgresiva';
import { prediccionService } from '@/services/prediccion.service';

// Mock del servicio de predicción
jest.mock('@/services/prediccion.service', () => ({
  prediccionService: {
    predecirPolinizacionInicial: jest.fn(),
    refinarPrediccionPolinizacion: jest.fn(),
    validarDatosPolinizacion: jest.fn()
  }
}));

// Mock de timers para debouncing
jest.useFakeTimers();

describe('usePrediccionProgresiva', () => {
  const mockPrediccionResponse = {
    dias_estimados: 45,
    confianza: 85,
    fecha_estimada_semillas: '2024-03-15',
    tipo_prediccion: 'inicial',
    especie_info: {
      especie: 'cattleya',
      metodo: 'modelo_bin',
      factores_considerados: ['especie', 'clima'],
      factores_faltantes: ['fecha_polinizacion']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    (prediccionService.validarDatosPolinizacion as jest.Mock).mockReturnValue([]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con estado vacío', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      expect(result.current.prediccion).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasChanges).toBe(false);
      expect(result.current.lastUpdate).toBeNull();
      expect(result.current.formData.especie).toBe('');
    });

    it('debe inicializar con opciones personalizadas', () => {
      const mockOnUpdate = jest.fn();
      const mockOnError = jest.fn();

      const { result } = renderHook(() => 
        usePrediccionProgresiva({
          debounceDelay: 2000,
          autoUpdate: false,
          onPrediccionUpdate: mockOnUpdate,
          onError: mockOnError
        })
      );

      expect(result.current.prediccion).toBeNull();
      expect(result.current.formData).toBeDefined();
    });
  });

  describe('updateField', () => {
    it('debe actualizar un campo del formulario', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      expect(result.current.formData.especie).toBe('cattleya');
      expect(result.current.hasChanges).toBe(true);
    });

    it('debe actualizar múltiples campos', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateField('especie', 'cattleya');
        result.current.updateField('clima', 'templado');
        result.current.updateField('ubicacion', 'laboratorio');
      });

      expect(result.current.formData.especie).toBe('cattleya');
      expect(result.current.formData.clima).toBe('templado');
      expect(result.current.formData.ubicacion).toBe('laboratorio');
    });

    it('debe limpiar errores al actualizar campos', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      // Simular un error previo
      act(() => {
        result.current.updateField('especie', ''); // Esto podría causar error de validación
      });

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('updateCondicionesClimaticas', () => {
    it('debe actualizar condiciones climáticas simples', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateCondicionesClimaticas('humedad', 75);
      });

      expect(result.current.formData.condiciones_climaticas?.humedad).toBe(75);
      expect(result.current.hasChanges).toBe(true);
    });

    it('debe actualizar temperatura como objeto anidado', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateCondicionesClimaticas('temperatura', { promedio: 25 });
      });

      expect(result.current.formData.condiciones_climaticas?.temperatura?.promedio).toBe(25);

      act(() => {
        result.current.updateCondicionesClimaticas('temperatura', { minima: 18 });
      });

      expect(result.current.formData.condiciones_climaticas?.temperatura?.promedio).toBe(25);
      expect(result.current.formData.condiciones_climaticas?.temperatura?.minima).toBe(18);
    });

    it('debe actualizar múltiples condiciones climáticas', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateCondicionesClimaticas('humedad', 75);
        result.current.updateCondicionesClimaticas('precipitacion', 50.5);
        result.current.updateCondicionesClimaticas('estacion', 'primavera');
      });

      expect(result.current.formData.condiciones_climaticas?.humedad).toBe(75);
      expect(result.current.formData.condiciones_climaticas?.precipitacion).toBe(50.5);
      expect(result.current.formData.condiciones_climaticas?.estacion).toBe('primavera');
    });
  });

  describe('Validación', () => {
    it('debe validar datos correctamente', () => {
      (prediccionService.validarDatosPolinizacion as jest.Mock).mockReturnValue(['La especie es requerida']);

      const { result } = renderHook(() => usePrediccionProgresiva());

      const validationState = result.current.getValidationState();

      expect(validationState.isValid).toBe(false);
      expect(validationState.errors).toEqual(['La especie es requerida']);
      expect(validationState.canPredict).toBe(false);
    });

    it('debe indicar cuando los datos son válidos', () => {
      (prediccionService.validarDatosPolinizacion as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      const validationState = result.current.getValidationState();

      expect(validationState.isValid).toBe(true);
      expect(validationState.errors).toEqual([]);
      expect(validationState.canPredict).toBe(true);
    });
  });

  describe('Progreso del formulario', () => {
    it('debe calcular progreso correctamente', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      let progress = result.current.getFormProgress();
      expect(progress.percentage).toBe(0);
      expect(progress.filledFields).toBe(0);

      act(() => {
        result.current.updateField('especie', 'cattleya');
        result.current.updateField('clima', 'templado');
      });

      progress = result.current.getFormProgress();
      expect(progress.filledFields).toBe(2);
      expect(progress.percentage).toBeGreaterThan(0);
    });

    it('debe incluir condiciones climáticas en el progreso', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateField('especie', 'cattleya');
        result.current.updateCondicionesClimaticas('temperatura', { promedio: 25 });
        result.current.updateCondicionesClimaticas('humedad', 75);
      });

      const progress = result.current.getFormProgress();
      expect(progress.filledFields).toBe(3);
    });
  });

  describe('Predicción automática con debouncing', () => {
    it('debe generar predicción automáticamente después del debounce', async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);

      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 1000 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      expect(result.current.hasChanges).toBe(true);

      // Avanzar el tiempo para que se ejecute el debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(prediccionService.predecirPolinizacionInicial).toHaveBeenCalledWith({
          especie: 'cattleya',
          clima: '',
          ubicacion: ''
        });
      });

      expect(result.current.prediccion).toEqual(mockPrediccionResponse);
      expect(result.current.hasChanges).toBe(false);
    });

    it('debe usar refinamiento cuando hay datos adicionales', async () => {
      (prediccionService.refinarPrediccionPolinizacion as jest.Mock).mockResolvedValue(mockPrediccionResponse);

      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 500 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
        result.current.updateField('fecha_polinizacion', '2024-02-15');
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(prediccionService.refinarPrediccionPolinizacion).toHaveBeenCalledWith(
          expect.objectContaining({
            especie: 'cattleya',
            fecha_polinizacion: '2024-02-15'
          })
        );
      });
    });

    it('no debe generar predicción si no hay especie', async () => {
      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 500 
        })
      );

      act(() => {
        result.current.updateField('clima', 'templado');
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(prediccionService.predecirPolinizacionInicial).not.toHaveBeenCalled();
    });

    it('debe cancelar debounce anterior cuando hay nuevos cambios', async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);

      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 1000 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      // Avanzar parcialmente el tiempo
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Hacer otro cambio antes de que se complete el debounce
      act(() => {
        result.current.updateField('clima', 'templado');
      });

      // Avanzar el tiempo restante del primer debounce
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // No debe haberse llamado aún
      expect(prediccionService.predecirPolinizacionInicial).not.toHaveBeenCalled();

      // Avanzar el tiempo completo del segundo debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(prediccionService.predecirPolinizacionInicial).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('forceUpdate', () => {
    it('debe forzar actualización inmediata', async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);

      const { result } = renderHook(() => usePrediccionProgresiva());

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      act(() => {
        result.current.forceUpdate();
      });

      await waitFor(() => {
        expect(prediccionService.predecirPolinizacionInicial).toHaveBeenCalled();
      });

      expect(result.current.prediccion).toEqual(mockPrediccionResponse);
    });

    it('debe cancelar debounce pendiente al forzar actualización', async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);

      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 2000 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      // Forzar actualización antes del debounce
      act(() => {
        result.current.forceUpdate();
      });

      await waitFor(() => {
        expect(prediccionService.predecirPolinizacionInicial).toHaveBeenCalledTimes(1);
      });

      // Avanzar el tiempo del debounce original
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // No debe haberse llamado de nuevo
      expect(prediccionService.predecirPolinizacionInicial).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearForm', () => {
    it('debe limpiar todos los datos del formulario', () => {
      const { result } = renderHook(() => usePrediccionProgresiva());

      // Llenar algunos datos
      act(() => {
        result.current.updateField('especie', 'cattleya');
        result.current.updateField('clima', 'templado');
        result.current.updateCondicionesClimaticas('humedad', 75);
      });

      expect(result.current.formData.especie).toBe('cattleya');
      expect(result.current.formData.condiciones_climaticas?.humedad).toBe(75);

      // Limpiar formulario
      act(() => {
        result.current.clearForm();
      });

      expect(result.current.formData.especie).toBe('');
      expect(result.current.formData.clima).toBe('');
      expect(result.current.formData.condiciones_climaticas).toBeUndefined();
      expect(result.current.prediccion).toBeNull();
      expect(result.current.hasChanges).toBe(false);
    });

    it('debe cancelar timers pendientes al limpiar', () => {
      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 1000 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      act(() => {
        result.current.clearForm();
      });

      // Avanzar el tiempo
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(prediccionService.predecirPolinizacionInicial).not.toHaveBeenCalled();
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores de validación', () => {
      (prediccionService.validarDatosPolinizacion as jest.Mock).mockReturnValue(['Error de validación']);

      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 500 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.error).toBe('Error de validación');
      expect(result.current.loading).toBe(false);
    });

    it('debe manejar errores del servicio', async () => {
      const errorMessage = 'Error de conexión';
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const mockOnError = jest.fn();
      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          onError: mockOnError 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      act(() => {
        result.current.forceUpdate();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });
  });

  describe('Callbacks', () => {
    it('debe llamar onPrediccionUpdate cuando se genera predicción', async () => {
      const mockOnUpdate = jest.fn();
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);

      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          onPrediccionUpdate: mockOnUpdate 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      act(() => {
        result.current.forceUpdate();
      });

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(mockPrediccionResponse);
      });
    });

    it('debe llamar onError cuando hay errores', async () => {
      const mockOnError = jest.fn();
      const errorMessage = 'Error de prueba';
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          onError: mockOnError 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      act(() => {
        result.current.forceUpdate();
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });
  });

  describe('Estados computados', () => {
    it('debe calcular isAutoUpdating correctamente', () => {
      const { result } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true 
        })
      );

      expect(result.current.isAutoUpdating).toBe(false);

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      expect(result.current.isAutoUpdating).toBe(true);
    });

    it('debe calcular canPredict correctamente', () => {
      (prediccionService.validarDatosPolinizacion as jest.Mock).mockReturnValue(['Error']);

      const { result } = renderHook(() => usePrediccionProgresiva());

      expect(result.current.canPredict).toBe(false);

      (prediccionService.validarDatosPolinizacion as jest.Mock).mockReturnValue([]);

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      expect(result.current.canPredict).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('debe limpiar timers al desmontar', () => {
      const { result, unmount } = renderHook(() => 
        usePrediccionProgresiva({ 
          autoUpdate: true, 
          debounceDelay: 1000 
        })
      );

      act(() => {
        result.current.updateField('especie', 'cattleya');
      });

      unmount();

      // Avanzar el tiempo después del desmontaje
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(prediccionService.predecirPolinizacionInicial).not.toHaveBeenCalled();
    });
  });
});