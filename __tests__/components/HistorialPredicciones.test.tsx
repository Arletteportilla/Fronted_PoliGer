import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { HistorialPredicciones } from '@/components/HistorialPredicciones';
import { prediccionService } from '@/services/prediccion.service';

// Mock del servicio de predicción
jest.mock('@/services/prediccion.service', () => ({
  prediccionService: {
    obtenerHistorialPolinizacion: jest.fn(),
    obtenerEstadisticasPolinizacion: jest.fn(),
    formatearFecha: jest.fn((fecha: string) => {
      return new Date(fecha).toLocaleDateString('es-ES');
    }),
    obtenerColorConfianza: jest.fn((confianza: number) => {
      if (confianza >= 80) return '#4CAF50';
      if (confianza >= 60) return '#FF9800';
      return '#F44336';
    }),
    obtenerColorPrecision: jest.fn((precision: number) => {
      if (precision >= 80) return '#4CAF50';
      if (precision >= 60) return '#FF9800';
      return '#F44336';
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

describe('HistorialPredicciones', () => {
  const mockHistorial = {
    predicciones: [
      {
        id: '1',
        codigo: 'PRED-001',
        especie: 'cattleya',
        dias_estimados: 45,
        confianza: 85,
        precision: 88.5,
        fecha_creacion: '2024-03-01T10:00:00Z',
        fecha_polinizacion: '2024-02-15',
        fecha_estimada_semillas: '2024-03-31',
        tipo_prediccion: 'inicial',
        tipo_prediccion_display: 'Inicial',
        calidad_prediccion: 'buena',
        dias_restantes: 15
      },
      {
        id: '2',
        codigo: 'PRED-002',
        especie: 'phalaenopsis',
        dias_estimados: 38,
        confianza: 92,
        precision: 91.2,
        fecha_creacion: '2024-03-02T14:30:00Z',
        fecha_polinizacion: '2024-02-20',
        fecha_estimada_semillas: '2024-03-29',
        tipo_prediccion: 'refinada',
        tipo_prediccion_display: 'Refinada',
        calidad_prediccion: 'excelente',
        dias_restantes: 0
      }
    ],
    estadisticas: {
      total_predicciones: 2,
      predicciones_validadas: 1,
      precision_promedio: 89.85,
      confianza_promedio: 88.5
    }
  };

  const mockEstadisticas = {
    total_predicciones: 25,
    predicciones_validadas: 18,
    precision_promedio: 87.3,
    confianza_promedio: 84.2,
    especies_mas_predichas: [
      { especie: 'cattleya', cantidad: 8, precision_promedio: 89.1 },
      { especie: 'phalaenopsis', cantidad: 6, precision_promedio: 85.7 },
      { especie: 'dendrobium', cantidad: 4, precision_promedio: 88.9 }
    ],
    distribucion_por_tipo: {
      inicial: 10,
      refinada: 12,
      validada: 3
    },
    modelo_version: '2.1.0',
    modelo_precision: 86.4,
    ultima_actualizacion: '2024-03-15T08:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prediccionService.obtenerHistorialPolinizacion as jest.Mock).mockResolvedValue(mockHistorial);
    (prediccionService.obtenerEstadisticasPolinizacion as jest.Mock).mockResolvedValue(mockEstadisticas);
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente el componente', async () => {
      render(<HistorialPredicciones />);
      
      expect(screen.getByText('Historial de Predicciones')).toBeTruthy();
      
      await waitFor(() => {
        expect(screen.getByText('2 predicciones encontradas')).toBeTruthy();
      });
    });

    it('debe mostrar controles del header', () => {
      render(<HistorialPredicciones />);
      
      // Los controles de filtros y estadísticas deben estar visibles
      expect(screen.getByTestId('filter-button')).toBeTruthy();
      expect(screen.getByTestId('stats-button')).toBeTruthy();
    });

    it('debe cargar historial y estadísticas al montar', async () => {
      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(prediccionService.obtenerHistorialPolinizacion).toHaveBeenCalled();
        expect(prediccionService.obtenerEstadisticasPolinizacion).toHaveBeenCalled();
      });
    });
  });

  describe('Lista de predicciones', () => {
    it('debe mostrar las predicciones correctamente', async () => {
      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(screen.getByText('PRED-001')).toBeTruthy();
        expect(screen.getByText('PRED-002')).toBeTruthy();
        expect(screen.getByText('cattleya')).toBeTruthy();
        expect(screen.getByText('phalaenopsis')).toBeTruthy();
      });
    });

    it('debe mostrar información detallada de cada predicción', async () => {
      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(screen.getByText('45')).toBeTruthy(); // Días estimados
        expect(screen.getByText('85%')).toBeTruthy(); // Confianza
        expect(screen.getByText('88.5%')).toBeTruthy(); // Precisión
        expect(screen.getByText('15d')).toBeTruthy(); // Días restantes
        expect(screen.getByText('Listo')).toBeTruthy(); // Estado completado
      });
    });

    it('debe llamar onPrediccionSeleccionada cuando se selecciona una predicción', async () => {
      const mockOnSelect = jest.fn();
      render(<HistorialPredicciones onPrediccionSeleccionada={mockOnSelect} />);
      
      await waitFor(() => {
        const prediccionCard = screen.getByText('PRED-001');
        fireEvent.press(prediccionCard);
        
        expect(mockOnSelect).toHaveBeenCalledWith(mockHistorial.predicciones[0]);
      });
    });

    it('debe mostrar estado vacío cuando no hay predicciones', async () => {
      (prediccionService.obtenerHistorialPolinizacion as jest.Mock).mockResolvedValue({
        predicciones: [],
        estadisticas: { total_predicciones: 0 }
      });

      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(screen.getByText('Sin predicciones')).toBeTruthy();
        expect(screen.getByText('No se encontraron predicciones con los filtros aplicados')).toBeTruthy();
      });
    });
  });

  describe('Filtros', () => {
    it('debe mostrar panel de filtros cuando se activa', () => {
      render(<HistorialPredicciones />);
      
      const filterButton = screen.getByTestId('filter-button');
      fireEvent.press(filterButton);
      
      expect(screen.getByText('Filtros')).toBeTruthy();
      expect(screen.getByText('Especie')).toBeTruthy();
      expect(screen.getByText('Desde')).toBeTruthy();
      expect(screen.getByText('Hasta')).toBeTruthy();
    });

    it('debe filtrar por especie', async () => {
      render(<HistorialPredicciones />);
      
      const filterButton = screen.getByTestId('filter-button');
      fireEvent.press(filterButton);
      
      const especiePicker = screen.getByTestId('especie-filter-picker');
      fireEvent.press(especiePicker);
      
      await waitFor(() => {
        expect(prediccionService.obtenerHistorialPolinizacion).toHaveBeenCalledWith(
          expect.objectContaining({
            especie: 'test-value'
          })
        );
      });
    });

    it('debe filtrar por fechas', async () => {
      render(<HistorialPredicciones />);
      
      const filterButton = screen.getByTestId('filter-button');
      fireEvent.press(filterButton);
      
      const fechaDesdeButton = screen.getByText('Fecha inicio');
      fireEvent.press(fechaDesdeButton);
      
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.press(datePicker);
      
      await waitFor(() => {
        expect(prediccionService.obtenerHistorialPolinizacion).toHaveBeenCalledWith(
          expect.objectContaining({
            fecha_desde: expect.any(String)
          })
        );
      });
    });

    it('debe limpiar filtros correctamente', async () => {
      render(<HistorialPredicciones />);
      
      const filterButton = screen.getByTestId('filter-button');
      fireEvent.press(filterButton);
      
      const clearButton = screen.getByText('Limpiar');
      fireEvent.press(clearButton);
      
      await waitFor(() => {
        expect(prediccionService.obtenerHistorialPolinizacion).toHaveBeenCalledWith({
          especie: '',
          fecha_desde: '',
          fecha_hasta: '',
          limit: 20
        });
      });
    });

    it('debe cambiar límite de resultados', async () => {
      render(<HistorialPredicciones />);
      
      const filterButton = screen.getByTestId('filter-button');
      fireEvent.press(filterButton);
      
      const limitPicker = screen.getByTestId('limit-picker');
      fireEvent.press(limitPicker);
      
      await waitFor(() => {
        expect(prediccionService.obtenerHistorialPolinizacion).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 'test-value'
          })
        );
      });
    });
  });

  describe('Vista de estadísticas', () => {
    it('debe cambiar a vista de estadísticas', async () => {
      render(<HistorialPredicciones />);
      
      const statsButton = screen.getByTestId('stats-button');
      fireEvent.press(statsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Total')).toBeTruthy();
        expect(screen.getByText('25')).toBeTruthy(); // Total predicciones
        expect(screen.getByText('Validadas')).toBeTruthy();
        expect(screen.getByText('18')).toBeTruthy(); // Predicciones validadas
      });
    });

    it('debe mostrar métricas principales', async () => {
      render(<HistorialPredicciones />);
      
      const statsButton = screen.getByTestId('stats-button');
      fireEvent.press(statsButton);
      
      await waitFor(() => {
        expect(screen.getByText('87.3%')).toBeTruthy(); // Precisión promedio
        expect(screen.getByText('84.2%')).toBeTruthy(); // Confianza promedio
      });
    });

    it('debe mostrar especies más predichas', async () => {
      render(<HistorialPredicciones />);
      
      const statsButton = screen.getByTestId('stats-button');
      fireEvent.press(statsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Especies Más Predichas')).toBeTruthy();
        expect(screen.getByText('8 predicciones')).toBeTruthy();
        expect(screen.getByText('89.1% precisión')).toBeTruthy();
      });
    });

    it('debe mostrar distribución por tipo', async () => {
      render(<HistorialPredicciones />);
      
      const statsButton = screen.getByTestId('stats-button');
      fireEvent.press(statsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Distribución por Tipo')).toBeTruthy();
        expect(screen.getByText('inicial')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy(); // Cantidad inicial
      });
    });

    it('debe mostrar información del modelo', async () => {
      render(<HistorialPredicciones />);
      
      const statsButton = screen.getByTestId('stats-button');
      fireEvent.press(statsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Información del Modelo')).toBeTruthy();
        expect(screen.getByText('2.1.0')).toBeTruthy(); // Versión
        expect(screen.getByText('86.4%')).toBeTruthy(); // Precisión del modelo
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe mostrar error cuando falla la carga del historial', async () => {
      const errorMessage = 'Error de conexión';
      (prediccionService.obtenerHistorialPolinizacion as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(screen.getByText('Error al cargar')).toBeTruthy();
        expect(screen.getByText(errorMessage)).toBeTruthy();
        expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
      });
    });

    it('debe permitir reintentar después de un error', async () => {
      (prediccionService.obtenerHistorialPolinizacion as jest.Mock)
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(mockHistorial);

      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        const retryButton = screen.getByText('Reintentar');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(screen.getByText('PRED-001')).toBeTruthy();
      });
    });
  });

  describe('Refresh control', () => {
    it('debe refrescar datos cuando se hace pull to refresh', async () => {
      render(<HistorialPredicciones />);
      
      // Simular pull to refresh
      const scrollView = screen.getByTestId('historial-scroll-view');
      fireEvent(scrollView, 'refresh');
      
      await waitFor(() => {
        expect(prediccionService.obtenerHistorialPolinizacion).toHaveBeenCalledTimes(2);
        expect(prediccionService.obtenerEstadisticasPolinizacion).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar indicador de carga inicial', () => {
      (prediccionService.obtenerHistorialPolinizacion as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockHistorial), 100))
      );

      render(<HistorialPredicciones />);
      
      expect(screen.getByText('Cargando historial...')).toBeTruthy();
    });

    it('debe mostrar indicador de carga para estadísticas', async () => {
      (prediccionService.obtenerEstadisticasPolinizacion as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockEstadisticas), 100))
      );

      render(<HistorialPredicciones />);
      
      const statsButton = screen.getByTestId('stats-button');
      fireEvent.press(statsButton);
      
      expect(screen.getByText('Cargando estadísticas...')).toBeTruthy();
    });
  });

  describe('Configuración de props', () => {
    it('debe ocultar filtros cuando mostrarFiltros es false', () => {
      render(<HistorialPredicciones mostrarFiltros={false} />);
      
      expect(screen.queryByTestId('filter-button')).toBeNull();
    });

    it('debe ocultar estadísticas cuando mostrarEstadisticas es false', () => {
      render(<HistorialPredicciones mostrarEstadisticas={false} />);
      
      expect(screen.queryByTestId('stats-button')).toBeNull();
    });

    it('no debe cargar estadísticas cuando mostrarEstadisticas es false', () => {
      render(<HistorialPredicciones mostrarEstadisticas={false} />);
      
      expect(prediccionService.obtenerEstadisticasPolinizacion).not.toHaveBeenCalled();
    });
  });

  describe('Funciones de utilidad', () => {
    it('debe usar formatearFecha correctamente', async () => {
      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(prediccionService.formatearFecha).toHaveBeenCalledWith('2024-02-15');
      });
    });

    it('debe usar obtenerColorConfianza correctamente', async () => {
      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(prediccionService.obtenerColorConfianza).toHaveBeenCalledWith(85);
        expect(prediccionService.obtenerColorConfianza).toHaveBeenCalledWith(92);
      });
    });

    it('debe usar obtenerColorPrecision correctamente', async () => {
      render(<HistorialPredicciones />);
      
      await waitFor(() => {
        expect(prediccionService.obtenerColorPrecision).toHaveBeenCalledWith(88.5);
        expect(prediccionService.obtenerColorPrecision).toHaveBeenCalledWith(91.2);
      });
    });
  });

  describe('Debouncing de filtros', () => {
    it('debe aplicar debouncing a los cambios de filtros', async () => {
      jest.useFakeTimers();
      
      render(<HistorialPredicciones />);
      
      const filterButton = screen.getByTestId('filter-button');
      fireEvent.press(filterButton);
      
      const especiePicker = screen.getByTestId('especie-filter-picker');
      
      // Hacer múltiples cambios rápidos
      fireEvent.press(especiePicker);
      fireEvent.press(especiePicker);
      fireEvent.press(especiePicker);
      
      // Avanzar el tiempo para que se ejecute el debounce
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        // Solo debe haberse llamado una vez después del debounce
        expect(prediccionService.obtenerHistorialPolinizacion).toHaveBeenCalledTimes(2); // 1 inicial + 1 después del debounce
      });
      
      jest.useRealTimers();
    });
  });
});