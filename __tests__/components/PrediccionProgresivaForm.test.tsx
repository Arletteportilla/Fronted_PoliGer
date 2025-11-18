import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { PrediccionProgresivaForm } from '@/components/PrediccionProgresivaForm';
import { usePrediccionProgresiva } from '@/hooks/usePrediccionProgresiva';

// Mock del hook personalizado
jest.mock('@/hooks/usePrediccionProgresiva');

// Mock de DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  return jest.fn(({ onChange, value }) => {
    const MockDateTimePicker = require('react-native').View;
    return (
      <MockDateTimePicker
        testID="date-picker"
        onPress={() => onChange && onChange({}, value)}
      />
    );
  });
});

// Mock de Picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: ({ children, onValueChange, selectedValue, testID }: any) => {
    const MockPicker = require('react-native').View;
    return (
      <MockPicker
        testID={testID}
        onPress={() => onValueChange && onValueChange('test-value')}
      >
        {children}
      </MockPicker>
    );
  }
}));

// Mock del servicio de predicción
jest.mock('@/services/prediccion.service', () => ({
  prediccionService: {
    formatearFecha: jest.fn((fecha: string) => {
      return new Date(fecha).toLocaleDateString('es-ES');
    })
  }
}));

describe('PrediccionProgresivaForm', () => {
  const mockHookReturn = {
    prediccion: null,
    loading: false,
    error: null,
    hasChanges: false,
    lastUpdate: null,
    formData: {
      especie: '',
      genero: '',
      clima: '',
      ubicacion: '',
      fecha_polinizacion: '',
      tipo_polinizacion: '',
      condiciones_climaticas: undefined
    },
    updateField: jest.fn(),
    updateCondicionesClimaticas: jest.fn(),
    forceUpdate: jest.fn(),
    clearForm: jest.fn(),
    getValidationState: jest.fn(() => ({
      isValid: false,
      errors: ['La especie es requerida'],
      canPredict: false
    })),
    getFormProgress: jest.fn(() => ({
      percentage: 25,
      filledFields: 2,
      totalFields: 8
    })),
    isAutoUpdating: false,
    canPredict: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockHookReturn);
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente el componente', () => {
      render(<PrediccionProgresivaForm />);
      
      expect(screen.getByText('Predicción Progresiva')).toBeTruthy();
      expect(screen.getByText('Datos Básicos')).toBeTruthy();
      expect(screen.getByText('Fechas y Tipo de Polinización')).toBeTruthy();
      expect(screen.getByText('Condiciones Climáticas Detalladas')).toBeTruthy();
    });

    it('debe mostrar la barra de progreso correctamente', () => {
      render(<PrediccionProgresivaForm />);
      
      expect(screen.getByText('25% completado (2/8 campos)')).toBeTruthy();
    });

    it('debe mostrar errores de validación', () => {
      render(<PrediccionProgresivaForm />);
      
      expect(screen.getByText('Campos requeridos:')).toBeTruthy();
      expect(screen.getByText('La especie es requerida')).toBeTruthy();
    });
  });

  describe('Interacciones del formulario', () => {
    it('debe llamar updateField cuando se cambia la especie', () => {
      render(<PrediccionProgresivaForm />);
      
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent.press(especiePicker);
      
      expect(mockHookReturn.updateField).toHaveBeenCalledWith('especie', 'test-value');
    });

    it('debe llamar updateField cuando se cambia el clima', () => {
      render(<PrediccionProgresivaForm />);
      
      const climaPicker = screen.getByTestId('clima-picker');
      fireEvent.press(climaPicker);
      
      expect(mockHookReturn.updateField).toHaveBeenCalledWith('clima', 'test-value');
    });

    it('debe llamar updateField cuando se cambia la ubicación', () => {
      render(<PrediccionProgresivaForm />);
      
      const ubicacionPicker = screen.getByTestId('ubicacion-picker');
      fireEvent.press(ubicacionPicker);
      
      expect(mockHookReturn.updateField).toHaveBeenCalledWith('ubicacion', 'test-value');
    });
  });

  describe('Secciones expandibles', () => {
    it('debe expandir y contraer la sección de datos básicos', () => {
      render(<PrediccionProgresivaForm />);
      
      const basicosHeader = screen.getByText('Datos Básicos');
      fireEvent.press(basicosHeader);
      
      // La sección debe seguir visible ya que está expandida por defecto
      expect(screen.getByText('Especie *')).toBeTruthy();
    });

    it('debe expandir la sección de fechas', () => {
      render(<PrediccionProgresivaForm />);
      
      const fechasHeader = screen.getByText('Fechas y Tipo de Polinización');
      fireEvent.press(fechasHeader);
      
      // Después de expandir, debe mostrar los campos
      expect(screen.getByText('Fecha de Polinización')).toBeTruthy();
      expect(screen.getByText('Tipo de Polinización')).toBeTruthy();
    });

    it('debe expandir la sección de condiciones climáticas', () => {
      render(<PrediccionProgresivaForm />);
      
      const condicionesHeader = screen.getByText('Condiciones Climáticas Detalladas');
      fireEvent.press(condicionesHeader);
      
      expect(screen.getByText('Temperatura (°C)')).toBeTruthy();
      expect(screen.getByPlaceholderText('25')).toBeTruthy(); // Temperatura promedio
    });
  });

  describe('Fecha de polinización', () => {
    it('debe mostrar selector de fecha cuando se presiona el botón', () => {
      // Mock con sección de fechas expandida
      const mockWithExpandedDates = {
        ...mockHookReturn,
        formData: {
          ...mockHookReturn.formData,
          fecha_polinizacion: '2024-03-15'
        }
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockWithExpandedDates);

      render(<PrediccionProgresivaForm />);
      
      // Expandir sección de fechas
      const fechasHeader = screen.getByText('Fechas y Tipo de Polinización');
      fireEvent.press(fechasHeader);
      
      const fechaButton = screen.getByText('15/3/2024'); // Fecha formateada
      fireEvent.press(fechaButton);
      
      expect(screen.getByTestId('date-picker')).toBeTruthy();
    });

    it('debe actualizar la fecha cuando se selecciona', () => {
      render(<PrediccionProgresivaForm />);
      
      // Expandir sección de fechas
      const fechasHeader = screen.getByText('Fechas y Tipo de Polinización');
      fireEvent.press(fechasHeader);
      
      const fechaButton = screen.getByText('Seleccionar fecha');
      fireEvent.press(fechaButton);
      
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.press(datePicker);
      
      expect(mockHookReturn.updateField).toHaveBeenCalledWith(
        'fecha_polinizacion',
        expect.any(String)
      );
    });
  });

  describe('Condiciones climáticas detalladas', () => {
    beforeEach(() => {
      render(<PrediccionProgresivaForm />);
      
      // Expandir sección de condiciones climáticas
      const condicionesHeader = screen.getByText('Condiciones Climáticas Detalladas');
      fireEvent.press(condicionesHeader);
    });

    it('debe actualizar temperatura promedio', () => {
      const temperaturaInput = screen.getByPlaceholderText('25');
      fireEvent.changeText(temperaturaInput, '28');
      
      expect(mockHookReturn.updateCondicionesClimaticas).toHaveBeenCalledWith(
        'temperatura',
        { promedio: 28 }
      );
    });

    it('debe actualizar temperatura mínima', () => {
      const tempMinimaInput = screen.getByPlaceholderText('18');
      fireEvent.changeText(tempMinimaInput, '20');
      
      expect(mockHookReturn.updateCondicionesClimaticas).toHaveBeenCalledWith(
        'temperatura',
        { minima: 20 }
      );
    });

    it('debe actualizar temperatura máxima', () => {
      const tempMaximaInput = screen.getByPlaceholderText('32');
      fireEvent.changeText(tempMaximaInput, '35');
      
      expect(mockHookReturn.updateCondicionesClimaticas).toHaveBeenCalledWith(
        'temperatura',
        { maxima: 35 }
      );
    });

    it('debe actualizar humedad', () => {
      const humedadInput = screen.getByPlaceholderText('70');
      fireEvent.changeText(humedadInput, '80');
      
      expect(mockHookReturn.updateCondicionesClimaticas).toHaveBeenCalledWith(
        'humedad',
        80
      );
    });

    it('debe actualizar precipitación', () => {
      const precipitacionInput = screen.getByPlaceholderText('50');
      fireEvent.changeText(precipitacionInput, '60.5');
      
      expect(mockHookReturn.updateCondicionesClimaticas).toHaveBeenCalledWith(
        'precipitacion',
        60.5
      );
    });
  });

  describe('Estados de carga y actualización', () => {
    it('debe mostrar estado de carga', () => {
      const mockLoading = {
        ...mockHookReturn,
        loading: true,
        isAutoUpdating: true
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockLoading);

      render(<PrediccionProgresivaForm />);
      
      expect(screen.getByText('Actualizando automáticamente...')).toBeTruthy();
    });

    it('debe mostrar cambios pendientes', () => {
      const mockWithChanges = {
        ...mockHookReturn,
        hasChanges: true,
        loading: false
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockWithChanges);

      render(<PrediccionProgresivaForm autoUpdate={true} />);
      
      expect(screen.getByText('Cambios pendientes...')).toBeTruthy();
    });

    it('debe mostrar estado actualizado', () => {
      const mockUpdated = {
        ...mockHookReturn,
        prediccion: { dias_estimados: 45 },
        hasChanges: false,
        loading: false,
        lastUpdate: new Date('2024-03-15T10:30:00')
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockUpdated);

      render(<PrediccionProgresivaForm />);
      
      expect(screen.getByText(/Actualizado/)).toBeTruthy();
    });

    it('debe mostrar errores', () => {
      const mockWithError = {
        ...mockHookReturn,
        error: 'Error de conexión'
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockWithError);

      render(<PrediccionProgresivaForm />);
      
      expect(screen.getByText('Error de conexión')).toBeTruthy();
    });
  });

  describe('Botones de acción', () => {
    it('debe mostrar botón de actualización manual cuando autoUpdate está deshabilitado', () => {
      render(<PrediccionProgresivaForm autoUpdate={false} />);
      
      expect(screen.getByText('Actualizar Predicción')).toBeTruthy();
    });

    it('debe llamar forceUpdate cuando se presiona actualizar manualmente', () => {
      const mockCanPredict = {
        ...mockHookReturn,
        canPredict: true
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockCanPredict);

      render(<PrediccionProgresivaForm autoUpdate={false} />);
      
      const updateButton = screen.getByText('Actualizar Predicción');
      fireEvent.press(updateButton);
      
      expect(mockHookReturn.forceUpdate).toHaveBeenCalled();
    });

    it('debe deshabilitar botón de actualización cuando no se puede predecir', () => {
      render(<PrediccionProgresivaForm autoUpdate={false} />);
      
      const updateButton = screen.getByText('Actualizar Predicción');
      expect(updateButton.props.disabled).toBe(true);
    });

    it('debe llamar clearForm cuando se presiona limpiar', () => {
      render(<PrediccionProgresivaForm />);
      
      const clearButton = screen.getByText('Limpiar Formulario');
      fireEvent.press(clearButton);
      
      expect(mockHookReturn.clearForm).toHaveBeenCalled();
    });
  });

  describe('Progreso del formulario', () => {
    it('debe mostrar progreso actualizado cuando cambian los campos', () => {
      const mockWithProgress = {
        ...mockHookReturn,
        getFormProgress: jest.fn(() => ({
          percentage: 75,
          filledFields: 6,
          totalFields: 8
        }))
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockWithProgress);

      render(<PrediccionProgresivaForm />);
      
      expect(screen.getByText('75% completado (6/8 campos)')).toBeTruthy();
    });

    it('debe mostrar checkmarks en campos completados', () => {
      const mockWithData = {
        ...mockHookReturn,
        formData: {
          ...mockHookReturn.formData,
          especie: 'cattleya',
          clima: 'templado'
        }
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockWithData);

      render(<PrediccionProgresivaForm />);
      
      // Los checkmarks se muestran junto a los labels cuando hay datos
      expect(screen.getByText('Especie *')).toBeTruthy();
      expect(screen.getByText('Clima')).toBeTruthy();
    });
  });

  describe('Configuración de props', () => {
    it('debe usar debounceDelay personalizado', () => {
      render(<PrediccionProgresivaForm debounceDelay={2000} />);
      
      expect(usePrediccionProgresiva).toHaveBeenCalledWith(
        expect.objectContaining({
          debounceDelay: 2000
        })
      );
    });

    it('debe llamar onPrediccionUpdate cuando se proporciona', () => {
      const mockOnUpdate = jest.fn();
      
      render(<PrediccionProgresivaForm onPrediccionUpdate={mockOnUpdate} />);
      
      expect(usePrediccionProgresiva).toHaveBeenCalledWith(
        expect.objectContaining({
          onPrediccionUpdate: mockOnUpdate
        })
      );
    });

    it('debe configurar autoUpdate correctamente', () => {
      render(<PrediccionProgresivaForm autoUpdate={false} />);
      
      expect(usePrediccionProgresiva).toHaveBeenCalledWith(
        expect.objectContaining({
          autoUpdate: false
        })
      );
    });
  });

  describe('Animaciones', () => {
    it('debe renderizar sin errores con animaciones', () => {
      const mockWithAnimation = {
        ...mockHookReturn,
        loading: true,
        getFormProgress: jest.fn(() => ({
          percentage: 50,
          filledFields: 4,
          totalFields: 8
        }))
      };
      (usePrediccionProgresiva as jest.Mock).mockReturnValue(mockWithAnimation);

      expect(() => {
        render(<PrediccionProgresivaForm />);
      }).not.toThrow();
    });
  });
});