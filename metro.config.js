// Configuración Metro optimizada para mejor performance de inicio
const { getDefaultConfig } = require('expo/metro-config');

// Obtener configuración base
const config = getDefaultConfig(__dirname);

// Optimizaciones para desarrollo
config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.enableBabelRCLookup = false;

// Configurar workers basado en CPUs disponibles
const os = require('os');
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  // En desarrollo, usar más workers para builds más rápidos
  config.maxWorkers = Math.max(1, Math.floor(os.cpus().length * 0.8));
  
  // Cache persistente en desarrollo
  config.resetCache = false;
  
  // Optimizaciones de transformación
  config.transformer.experimentalImportSupport = true;
  config.transformer.unstable_allowRequireContext = true;
} else {
  // En producción, configuración más conservadora
  config.maxWorkers = 2;
  config.resetCache = true;
}

// Resolver módulos más rápido
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Cache de resolución de assets
config.resolver.assetExts.push('db', 'sqlite', 'sqlite3');

module.exports = config;