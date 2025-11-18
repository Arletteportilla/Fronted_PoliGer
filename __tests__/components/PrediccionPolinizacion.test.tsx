// Test deshabilitado - componente PrediccionPolinizacion eliminado durante limpieza
/*
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PrediccionPolinizacion } from '@/components/polinizaciones';
import { prediccionService } from '@/services/prediccion.service';

// Mock del servicio de predicción
jest.mock('@/services/prediccion.service', () => ({
  prediccionService: {
    predecirPolinizacionInicial: jest.fn(),
    refinarPrediccionPolinizacion: jest.fn(),
    validarPrediccionPolinizacion: jest.fn(),
    obtenerColorConfianza: jest.fn((confianza: number) => {
      if (confianza >= 80) return '#4CAF50';
      if (confianza >= 60) return '#FF9800';
      return '#F44336';
    }),
    formatearFecha: jest.fn((fecha: string) => {
      return new Date(fecha).toLocaleDateString('es-ES');
    }),
    calcularDiasRestantes: jest.fn((fecha: string) => {
      const hoy = new Date();
      const fechaObjetivo = new Date(fecha);
      const diferencia = Math.ceil((fechaObjetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, diferencia);
    })
  }
}));

// Mock de Alert
jest.spyOn(Alert, 'alert');

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
  Picker: {
    Item: ({ children, ...props }: any) => {
      const MockPickerItem = require('react-native').View;
      return <MockPickerItem {...props}>{children}</MockPickerItem>;
    }
  }
}));

describe('PrediccionPolinizacion', () => {
  const mockPrediccionResponse = {
    dias_estimados: 45,
    confianza: 85,
    fecha_estimada_semillas: '2024-03-15',
    tipo_prediccion: 'inicial',
    especie_info: {
      especie: 'cattleya',
      metodo: 'modelo_bin',
      factores_considerados: ['especie', 'clima'],
      factores_faltantes: ['fecha_polinizacion', 'condiciones_climaticas']
    },
    siguiente_paso: 'Agregar fecha de polinización para mejorar precisión'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente el componente', () => {
      render(<PrediccionPolinizacion />);
      
      expect(screen.getByText('Predicción de Polinización')).toBeTruthy();
      expect(screen.getByText('Datos Básicos')).toBeTruthy();
      expect(screen.getByText('Especie *')).toBeTruthy();
      expect(screen.getByText('Generar Predicción Inicial')).toBeTruthy();
    });

    it('debe mostrar todos los campos del formulario básico', () => {
      render(<PrediccionPolinizacion />);
      
      expect(screen.getByText('Especie *')).toBeTruthy();
      expect(screen.getByText('Clima')).toBeTruthy();
      expect(screen.getByText('Ubicación')).toBeTruthy();
    });

    it('debe tener el botón de limpiar formulario', () => {
      render(<PrediccionPolinizacion />);
      
      const clearButton = screen.getByTestId('clear-button');
      expect(clearButton).toBeTruthy();
    });
  });

  describe('Predicción inicial', () => {
    it('debe generar predicción inicial exitosamente', async () => {
      const mockOnPrediccionGenerada = jest.fn();
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);

      render(<PrediccionPolinizacion onPrediccionGenerada={mockOnPrediccionGenerada} />);
      
      // Seleccionar especie
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent(especiePicker, 'onValueChange', 'cattleya');
      
      // Hacer clic en generar predicción
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(prediccionService.predecirPolinizacionInicial).toHaveBeenCalledWith({
          especie: 'cattleya',
          clima: undefined,
          ubicacion: undefined
        });
      });

      expect(mockOnPrediccionGenerada).toHaveBeenCalledWith(mockPrediccionResponse);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Predicción Generada',
        'Predicción inicial creada. Días estimados: 45. Confianza: 85%'
      );
    });

    it('debe mostrar error si no se selecciona especie', async () => {
      render(<PrediccionPolinizacion />);
      
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'La especie es requerida para generar la predicción'
      );
    });

    it('debe manejar errores del servicio', async () => {
      const errorMessage = 'Error de conexión';
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<PrediccionPolinizacion />);
      
      // Seleccionar especie
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent(especiePicker, 'onValueChange', 'cattleya');
      
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
      });
    });
  });

  describe('Refinamiento de predicción', () => {
    beforeEach(async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);
      
      const component = render(<PrediccionPolinizacion />);
      
      // Generar predicción inicial primero
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent(especiePicker, 'onValueChange', 'cattleya');
      
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Refinar Predicción')).toBeTruthy();
      });
    });

    it('debe mostrar sección de refinamiento después de predicción inicial', () => {
      expect(screen.getByText('Refinar Predicción')).toBeTruthy();
      expect(screen.getByText('Fecha de Polinización')).toBeTruthy();
      expect(screen.getByText('Tipo de Polinización')).toBeTruthy();
    });

    it('debe refinar predicción con datos adicionales', async () => {
      const mockRefinedResponse = {
        ...mockPrediccionResponse,
        dias_estimados: 42,
        confianza: 92,
        tipo_prediccion: 'refinada'
      };
      
      (prediccionService.refinarPrediccionPolinizacion as jest.Mock).mockResolvedValue(mockRefinedResponse);

      // Seleccionar tipo de polinización
      const tipoPolinizacionPicker = screen.getByTestId('tipo-polinizacion-picker');
      fireEvent(tipoPolinizacionPicker, 'onValueChange', 'artificial');

      // Hacer clic en refinar
      const refineButton = screen.getByText('Refinar Predicción');
      fireEvent.press(refineButton);

      await waitFor(() => {
        expect(prediccionService.refinarPrediccionPolinizacion).toHaveBeenCalledWith(
          expect.objectContaining({
            especie: 'cattleya',
            tipo_polinizacion: 'artificial'
          })
        );
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Predicción Refinada',
        'Predicción actualizada. Días estimados: 42. Confianza: 92%'
      );
    });

    it('debe mostrar condiciones climáticas detalladas cuando se expande', () => {
      const toggleButton = screen.getByText('Condiciones Climáticas Detalladas');
      fireEvent.press(toggleButton);

      expect(screen.getByText('Temperatura (°C)')).toBeTruthy();
      expect(screen.getByPlaceholderText('25')).toBeTruthy(); // Temperatura promedio
      expect(screen.getByPlaceholderText('70')).toBeTruthy(); // Humedad
    });
  });

  describe('Validación de predicción', () => {
    beforeEach(async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);
      (prediccionService.refinarPrediccionPolinizacion as jest.Mock).mockResolvedValue({
        ...mockPrediccionResponse,
        tipo_prediccion: 'refinada'
      });
      
      render(<PrediccionPolinizacion />);
      
      // Generar y refinar predicción
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent(especiePicker, 'onValueChange', 'cattleya');
      
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      await waitFor(() => {
        const refineButton = screen.getByText('Refinar Predicción');
        fireEvent.press(refineButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Validar Predicción')).toBeTruthy();
      });
    });

    it('debe mostrar sección de validación después de refinamiento', () => {
      expect(screen.getByText('Validar Predicción')).toBeTruthy();
      expect(screen.getByText('Fecha de Maduración Real')).toBeTruthy();
    });

    it('debe validar predicción con fecha de maduración', async () => {
      const mockValidationResponse = {
        precision: 88.5,
        calidad_prediccion: 'buena',
        diferencia_dias: 2
      };
      
      (prediccionService.validarPrediccionPolinizacion as jest.Mock).mockResolvedValue(mockValidationResponse);

      // Seleccionar fecha de maduración (simulado)
      const fechaMaduracionButton = screen.getByText('Seleccionar fecha');
      fireEvent.press(fechaMaduracionButton);

      // Simular selección de fecha
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.press(datePicker);

      // Hacer clic en validar
      const validateButton = screen.getByText('Validar Predicción');
      fireEvent.press(validateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Predicción Validada',
          'Precisión: 88.5%. Calidad: buena. Diferencia: 2 días.'
        );
      });
    });
  });

  describe('Resultados de predicción', () => {
    beforeEach(async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);
      
      render(<PrediccionPolinizacion />);
      
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent(especiePicker, 'onValueChange', 'cattleya');
      
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Resultado de Predicción')).toBeTruthy();
      });
    });

    it('debe mostrar resultados de predicción correctamente', () => {
      expect(screen.getByText('Resultado de Predicción')).toBeTruthy();
      expect(screen.getByText('45 días')).toBeTruthy();
      expect(screen.getByText('85%')).toBeTruthy();
      expect(screen.getByText('Tipo: Inicial')).toBeTruthy();
    });

    it('debe mostrar detalles de la predicción', () => {
      expect(screen.getByText('Detalles de la Predicción')).toBeTruthy();
      expect(screen.getByText('cattleya')).toBeTruthy();
      expect(screen.getByText('modelo_bin')).toBeTruthy();
    });

    it('debe mostrar factores considerados y faltantes', () => {
      expect(screen.getByText('especie, clima')).toBeTruthy();
      expect(screen.getByText('fecha_polinizacion, condiciones_climaticas')).toBeTruthy();
    });

    it('debe mostrar siguiente paso', () => {
      expect(screen.getByText('Agregar fecha de polinización para mejorar precisión')).toBeTruthy();
    });
  });

  describe('Funcionalidad de limpiar formulario', () => {
    it('debe limpiar todos los campos del formulario', async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockResolvedValue(mockPrediccionResponse);
      
      render(<PrediccionPolinizacion />);
      
      // Llenar algunos campos
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent(especiePicker, 'onValueChange', 'cattleya');
      
      // Generar predicción
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Resultado de Predicción')).toBeTruthy();
      });

      // Limpiar formulario
      const clearButton = screen.getByTestId('clear-button');
      fireEvent.press(clearButton);

      // Verificar que no hay resultados
      expect(screen.queryByText('Resultado de Predicción')).toBeNull();
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar indicador de carga durante predicción inicial', async () => {
      (prediccionService.predecirPolinizacionInicial as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPrediccionResponse), 100))
      );

      render(<PrediccionPolinizacion />);
      
      const especiePicker = screen.getByTestId('especie-picker');
      fireEvent(especiePicker, 'onValueChange', 'cattleya');
      
      const generateButton = screen.getByText('Generar Predicción Inicial');
      fireEvent.press(generateButton);

      // Verificar que el botón está deshabilitado durante la carga
      expect(generateButton.props.disabled).toBe(true);

      await waitFor(() => {
        expect(generateButton.props.disabled).toBe(false);
      });
    });
  });

  describe('Colores de confianza', () => {
    it('debe usar colores correctos según el nivel de confianza', () => {
      render(<PrediccionPolinizacion />);
      
      // Verificar que se llama la función de color de confianza
      expect(prediccionService.obtenerColorConfianza).toBeDefined();
      
      // Probar diferentes niveles
      expect(prediccionService.obtenerColorConfianza(90)).toBe('#4CAF50'); // Verde para alta confianza
      expect(prediccionService.obtenerColorConfianza(70)).toBe('#FF9800'); // Naranja para media confianza
      expect(prediccionService.obtenerColorConfianza(40)).toBe('#F44336'); // Rojo para baja confianza
    });
  });
});
*/