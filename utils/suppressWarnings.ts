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
    '"shadow*" style props are deprecated',
    '"textShadow*" style props are deprecated',
    'props.pointerEvents is deprecated',
    'transform-origin',
    'transformOrigin',
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

// Suprimir errores de consola que son ruido de React Native Web (no afectan funcionalidad)
const originalError = console.error;

console.error = (...args: any[]) => {
  const message = args[0];

  const suppressedErrors = [
    'Unexpected text node',
    'A text node cannot be a child',
  ];

  if (typeof message === 'string') {
    const shouldSuppress = suppressedErrors.some(err => message.includes(err));
    if (shouldSuppress) return;
  }

  originalError.apply(console, args);
};

// Exportar para uso si es necesario
export {};
