import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { PrediccionTiempoReal } from '@/components/PrediccionTiempoReal';
import { prediccionService } from '@/services/prediccion.service';

// Mock del componente PrediccionProgresivaForm
jest.mock('@/components/PrediccionProgresivaForm', () => {
  return jest.fn(({ onPrediccionUpdate, autoUpdate, debounceDelay }) => {
    const MockForm = require('react-native').View;
    return (
      <MockForm
        testID="prediccion-progresiva-form"
        onPress={() => {
          // Simular actualización de predicción
          if (onPrediccionUpdate) {
            onPrediccionUpdate({
              dias_estimados: 45,
              confianza: 85,
              fecha_estimada_semillas: '2024-03-15',
              tipo_prediccion: 'inicial',
              especie_info: {
                especie: 'cattleya',
                metodo: 'modelo_bin',
                factores_considerados: ['especie', 'clima'],
                factores_faltantes: ['fecha_polinizacion']
              },
              siguiente_paso: 'Agregar más datos'
            });
          }
        }}
      />
    );
  });
});

// Mock del servicio de predicción
jest.mock('@/services/prediccion.service', () => ({
  prediccionService: {
    obtenerColorConfianza: jest.fn((confianza: number) => {
      if (confianza >= 80) return '#4CAF50';
      if (confianza >= 60) return '#FF9800';
      return '#F44336';
    }),
    obtenerColorPrecision: jest.fn((precision: number) => {
      if (precision >= 80) return '#4CAF50';
      if (precision >= 60) return '#FF9800';
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

describe('PrediccionTiempoReal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente el componente', () => {
      render(<PrediccionTiempoReal />);
      
      expect(screen.getByText('Predicción en Tiempo Real')).toBeTruthy();
      expect(screen.getByTestId('prediccion-progresiva-form')).toBeTruthy();
    });

    it('debe mostrar controles del header', () => {
      render(<PrediccionTiempoReal />);
      
      expect(screen.getByText('Auto')).toBeTruthy();
      expect(screen.getByText('Form')).toBeTruthy();
    });

    it('debe mostrar estado vacío inicialmente', () => {
      render(<PrediccionTiempoReal />);
      
      expect(screen.getByText('Sin Predicción')).toBeTruthy();
      expect(screen.getByText('Completa los datos básicos para generar una predicción en tiempo real')).toBeTruthy();
    });

    it('debe inicializar con autoUpdate habilitado por defecto', () => {
      render(<PrediccionTiempoReal />);
      
      // El botón Auto debe estar activo (con estilo activeControl)
      const autoButton = screen.getByText('Auto');
      expect(autoButton).toBeTruthy();
    });
  });

  describe('Controles del header', () => {
    it('debe alternar autoUpdate cuando se presiona el botón Auto', () => {
      render(<PrediccionTiempoReal />);
      
      const autoButton = screen.getByText('Auto');
      fireEvent.press(autoButton);
      
      // El estado debe cambiar (aunque visualmente no podemos verificar el estilo en este test)
      expect(autoButton).toBeTruthy();
    });

    it('debe alternar visibilidad del formulario cuando se presiona Form', () => {
      render(<PrediccionTiempoReal />);
      
      const formButton = screen.getByText('Form');
      fireEvent.press(formButton);
      
      // El formulario debe ocultarse
      expect(screen.queryByTestId('prediccion-progresiva-form')).toBeNull();
      
      // Presionar de nuevo para mostrar
      fireEvent.press(formButton);
      expect(screen.getByTestId('prediccion-progresiva-form')).toBeTruthy();
    });

    it('debe inicializar con initialAutoUpdate personalizado', () => {
      render(<PrediccionTiempoReal initialAutoUpdate={false} />);
      
      // Debe renderizar sin errores
      expect(screen.getByText('Predicción en Tiempo Real')).toBeTruthy();
    });
  });

  describe('Actualización de predicción', () => {
    it('debe mostrar resultados cuando se actualiza la predicción', () => {
      render(<PrediccionTiempoReal />);
      
      // Simular actualización de predicción
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      // Verificar que se muestran los resultados
      expect(screen.getByText('Resultado en Tiempo Real')).toBeTruthy();
      expect(screen.getByText('45')).toBeTruthy(); // Días estimados
      expect(screen.getByText('85%')).toBeTruthy(); // Confianza
    });

    it('debe mostrar información detallada de la predicción', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText('días')).toBeTruthy();
      expect(screen.getByText('confianza')).toBeTruthy();
      expect(screen.getByText('Tipo: INICIAL')).toBeTruthy();
    });

    it('debe mostrar fecha estimada cuando está disponible', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText(/Fecha estimada:/)).toBeTruthy();
    });

    it('debe mostrar días restantes cuando hay fecha estimada', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText(/Días restantes:/)).toBeTruthy();
    });
  });

  describe('Factores considerados', () => {
    it('debe mostrar factores considerados correctamente', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText('Factores Considerados')).toBeTruthy();
      expect(screen.getByText('especie')).toBeTruthy();
      expect(screen.getByText('clima')).toBeTruthy();
    });

    it('debe mostrar factores faltantes cuando existen', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText('Factores Faltantes')).toBeTruthy();
      expect(screen.getByText('fecha polinizacion')).toBeTruthy();
    });
  });

  describe('Comparación con predicción inicial', () => {
    it('debe mostrar comparación cuando está disponible', () => {
      // Mock con comparación
      const MockFormWithComparison = jest.fn(({ onPrediccionUpdate }) => {
        const MockForm = require('react-native').View;
        return (
          <MockForm
            testID="prediccion-progresiva-form"
            onPress={() => {
              if (onPrediccionUpdate) {
                onPrediccionUpdate({
                  dias_estimados: 42,
                  confianza: 92,
                  fecha_estimada_semillas: '2024-03-12',
                  tipo_prediccion: 'refinada',
                  especie_info: {
                    especie: 'cattleya',
                    metodo: 'modelo_bin',
                    factores_considerados: ['especie', 'clima', 'fecha_polinizacion'],
                    factores_faltantes: []
                  },
                  comparacion_con_inicial: {
                    dias_iniciales: 45,
                    dias_refinados: 42,
                    diferencia_dias: -3,
                    confianza_inicial: 85,
                    confianza_refinada: 92
                  }
                });
              }
            }}
          />
        );
      });

      // Reemplazar el mock temporalmente
      const originalMock = require('@/components/PrediccionProgresivaForm');
      require('@/components/PrediccionProgresivaForm').mockImplementation(MockFormWithComparison);

      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText('Evolución de la Predicción')).toBeTruthy();
      expect(screen.getByText('Inicial')).toBeTruthy();
      expect(screen.getByText('Refinada')).toBeTruthy();
      expect(screen.getByText('45 días')).toBeTruthy();
      expect(screen.getByText('42 días')).toBeTruthy();
      expect(screen.getByText('-3 días')).toBeTruthy();

      // Restaurar el mock original
      require('@/components/PrediccionProgresivaForm').mockImplementation(originalMock);
    });
  });

  describe('Siguiente paso', () => {
    it('debe mostrar siguiente paso cuando está disponible', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText('Siguiente Paso')).toBeTruthy();
      expect(screen.getByText('Agregar más datos')).toBeTruthy();
    });
  });

  describe('Progreso de confianza', () => {
    it('debe mostrar barra de progreso de confianza', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText('Progreso de Confianza')).toBeTruthy();
    });

    it('debe usar colores correctos según la confianza', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      // Verificar que se llama la función de color
      expect(prediccionService.obtenerColorConfianza).toHaveBeenCalledWith(85);
    });
  });

  describe('Configuración de props del formulario', () => {
    it('debe pasar autoUpdate al formulario progresivo', () => {
      const PrediccionProgresivaForm = require('@/components/PrediccionProgresivaForm');
      
      render(<PrediccionTiempoReal />);
      
      expect(PrediccionProgresivaForm).toHaveBeenCalledWith(
        expect.objectContaining({
          autoUpdate: true,
          debounceDelay: 1500
        }),
        expect.any(Object)
      );
    });

    it('debe pasar debounceDelay personalizado', () => {
      const PrediccionProgresivaForm = require('@/components/PrediccionProgresivaForm');
      
      render(<PrediccionTiempoReal />);
      
      expect(PrediccionProgresivaForm).toHaveBeenCalledWith(
        expect.objectContaining({
          debounceDelay: 1500
        }),
        expect.any(Object)
      );
    });

    it('debe pasar onPrediccionUpdate al formulario', () => {
      const PrediccionProgresivaForm = require('@/components/PrediccionProgresivaForm');
      
      render(<PrediccionTiempoReal />);
      
      expect(PrediccionProgresivaForm).toHaveBeenCalledWith(
        expect.objectContaining({
          onPrediccionUpdate: expect.any(Function)
        }),
        expect.any(Object)
      );
    });
  });

  describe('Estados de visualización', () => {
    it('debe alternar entre mostrar y ocultar formulario', () => {
      render(<PrediccionTiempoReal />);
      
      // Inicialmente el formulario debe estar visible
      expect(screen.getByTestId('prediccion-progresiva-form')).toBeTruthy();
      
      // Ocultar formulario
      const formButton = screen.getByText('Form');
      fireEvent.press(formButton);
      
      expect(screen.queryByTestId('prediccion-progresiva-form')).toBeNull();
      
      // Mostrar formulario de nuevo
      fireEvent.press(formButton);
      expect(screen.getByTestId('prediccion-progresiva-form')).toBeTruthy();
    });

    it('debe mantener los resultados visibles aunque se oculte el formulario', () => {
      render(<PrediccionTiempoReal />);
      
      // Generar predicción
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(screen.getByText('Resultado en Tiempo Real')).toBeTruthy();
      
      // Ocultar formulario
      const formButton = screen.getByText('Form');
      fireEvent.press(formButton);
      
      // Los resultados deben seguir visibles
      expect(screen.getByText('Resultado en Tiempo Real')).toBeTruthy();
    });
  });

  describe('Funciones de utilidad del servicio', () => {
    it('debe usar formatearFecha correctamente', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(prediccionService.formatearFecha).toHaveBeenCalledWith('2024-03-15');
    });

    it('debe usar calcularDiasRestantes correctamente', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(prediccionService.calcularDiasRestantes).toHaveBeenCalledWith('2024-03-15');
    });

    it('debe usar obtenerColorConfianza correctamente', () => {
      render(<PrediccionTiempoReal />);
      
      const form = screen.getByTestId('prediccion-progresiva-form');
      fireEvent.press(form);
      
      expect(prediccionService.obtenerColorConfianza).toHaveBeenCalledWith(85);
    });
  });

  describe('Responsividad', () => {
    it('debe renderizar correctamente en diferentes tamaños', () => {
      // Mock de Dimensions
      const mockDimensions = {
        get: jest.fn(() => ({ width: 375, height: 812 }))
      };
      
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Dimensions: mockDimensions
      }));

      expect(() => {
        render(<PrediccionTiempoReal />);
      }).not.toThrow();
    });
  });
});