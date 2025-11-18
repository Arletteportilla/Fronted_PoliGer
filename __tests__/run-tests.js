#!/usr/bin/env node

/**
 * Script para ejecutar tests de predicción de polinización
 * Uso: node __tests__/run-tests.js [opciones]
 */

/* eslint-env node */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const isCI = process.env.CI === 'true';

// Configurar opciones de Jest según el entorno
let jestCommand = 'npx jest';

if (args.includes('--watch')) {
  jestCommand += ' --watch';
} else if (args.includes('--coverage')) {
  jestCommand += ' --coverage';
} else if (isCI) {
  jestCommand += ' --ci --coverage --watchAll=false';
}

// Filtrar tests específicos si se proporciona
const testFilter = args.find(arg => arg.startsWith('--testNamePattern='));
if (testFilter) {
  jestCommand += ` ${testFilter}`;
}

// Filtrar archivos específicos
const fileFilter = args.find(arg => arg.startsWith('--testPathPattern='));
if (fileFilter) {
  jestCommand += ` ${fileFilter}`;
}

// Ejecutar solo tests de predicción de polinización si se especifica
if (args.includes('--prediccion-only')) {
  jestCommand += ' --testPathPattern="(PrediccionPolinizacion|PrediccionProgresiva|PrediccionTiempoReal|HistorialPredicciones|usePrediccionProgresiva|validacionPrediccion|prediccion\\.service)"';
}

console.log('🧪 Ejecutando tests de predicción de polinización...');
console.log(`Comando: ${jestCommand}`);
console.log('');

try {
  execSync(jestCommand, { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('');
  console.log('✅ Tests completados exitosamente');
  
  if (args.includes('--coverage')) {
    console.log('📊 Reporte de cobertura generado en: coverage/');
  }
  
} catch (error) {
  console.error('');
  console.error('❌ Tests fallaron');
  console.error('Código de salida:', error.status);
  process.exit(error.status || 1);
}