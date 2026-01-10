/**
 * Suprime warnings innecesarios en producción
 */

// Suprimir warning de useNativeDriver en web
const originalWarn = console.warn;

console.warn = (...args: any[]) => {
  const message = args[0];

  // Lista de warnings a suprimir
  const suppressedWarnings = [
    'useNativeDriver',
    'RCTAnimation',
    'Animated',
  ];

  // Si el warning contiene alguna de las palabras clave, no mostrarlo
  if (typeof message === 'string') {
    const shouldSuppress = suppressedWarnings.some(warning =>
      message.includes(warning)
    );

    if (shouldSuppress) {
      return;
    }
  }

  // Llamar al warn original para otros warnings
  originalWarn.apply(console, args);
};

// Exportar para uso si es necesario
export {};
