import { Platform } from 'react-native';
import { logger } from '@/services/logger';

/**
 * Exporta un elemento SVG como imagen PNG
 */
export const exportSVGToPNG = async (
  svgElement: SVGElement,
  fileName: string = 'grafica.png'
): Promise<void> => {
  if (Platform.OS !== 'web') {
    logger.warn('La exportación de gráficas solo está disponible en web');
    return;
  }

  try {
    // Obtener el SVG como string
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo crear el contexto del canvas');
    }

    // Configurar tamaño del canvas
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();

    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar SVG
      ctx.drawImage(img, 0, 0);

      // Descargar como PNG
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = fileName;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  } catch (error) {
    console.error('Error al exportar SVG a PNG:', error);
    alert('Error al descargar la imagen. Por favor, intenta de nuevo.');
  }
};

/**
 * Exporta un contenedor HTML (incluyendo SVG) como imagen PNG
 */
export const exportContainerToPNG = async (
  containerId: string,
  fileName: string = 'grafica.png',
  backgroundColor: string = '#ffffff'
): Promise<void> => {
  if (Platform.OS !== 'web') {
    logger.warn('La exportación de gráficas solo está disponible en web');
    return;
  }

  try {
    const element = document.getElementById(containerId);

    if (!element) {
      console.error('No se encontró el elemento con ID:', containerId);
      return;
    }

    // Usar html2canvas dinámicamente
    const html2canvas = await import('html2canvas').then(m => m.default);

    const canvas = await html2canvas(element, {
      backgroundColor,
      scale: 2, // Mayor calidad
      logging: false,
    });

    // Descargar como PNG
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    });
  } catch (error) {
    console.error('Error al exportar contenedor a PNG:', error);
    alert('Error al descargar la imagen. Por favor, intenta de nuevo.');
  }
};

/**
 * Descarga la gráfica directamente como PNG
 */
export const downloadChartAsPNG = (
  containerId: string,
  baseFileName: string = 'grafica'
): void => {
  if (Platform.OS !== 'web') {
    logger.warn('La exportación de gráficas solo está disponible en web');
    alert('La descarga de gráficas solo está disponible en web');
    return;
  }

  exportContainerToPNG(containerId, `${baseFileName}.png`);
};
