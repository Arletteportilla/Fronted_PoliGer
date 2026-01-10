/**
 * Script para reemplazar console.log por logger
 *
 * Uso: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuración
const EXCLUDE_DIRS = ['node_modules', 'dist', '.expo', '.expo-shared', 'scripts'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx'];

// Patrones de reemplazo
const replacements = [
  // console.log con emojis específicos
  { pattern: /console\.log\((['"`])🔍/g, replacement: "logger.debug($1" },
  { pattern: /console\.log\((['"`])✅/g, replacement: "logger.success($1" },
  { pattern: /console\.log\((['"`])🔄/g, replacement: "logger.start($1" },
  { pattern: /console\.log\((['"`])📡/g, replacement: "logger.api($1" },
  { pattern: /console\.log\((['"`])ℹ️/g, replacement: "logger.info($1" },
  { pattern: /console\.log\((['"`])❌/g, replacement: "logger.error($1" },
  { pattern: /console\.log\((['"`])⚠️/g, replacement: "logger.warn($1" },

  // console.log genérico -> logger.info
  { pattern: /console\.log\(/g, replacement: "logger.info(" },

  // console.warn -> logger.warn
  { pattern: /console\.warn\(/g, replacement: "logger.warn(" },

  // console.error se mantiene igual (o usar logger.error)
  // { pattern: /console\.error\(/g, replacement: "logger.error(" },

  // console.debug -> logger.debug
  { pattern: /console\.debug\(/g, replacement: "logger.debug(" },
];

// Importar logger si no existe
const loggerImport = "import { logger } from '@/services/logger';";

function shouldProcessFile(filePath) {
  // Excluir directorios
  for (const dir of EXCLUDE_DIRS) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
      return false;
    }
  }

  // Solo procesar extensiones específicas
  const ext = path.extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

function addLoggerImport(content, filePath) {
  // Si ya tiene el import, no agregarlo
  if (content.includes("from '@/services/logger'") || content.includes('from "@/services/logger"')) {
    return content;
  }

  // Si no usa logger, no agregar import
  if (!content.includes('logger.')) {
    return content;
  }

  // Buscar la última línea de import
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    } else if (lines[i].trim() && !lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('/*')) {
      break;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, loggerImport);
    return lines.join('\n');
  }

  // Si no hay imports, agregar al inicio
  return loggerImport + '\n\n' + content;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Aplicar reemplazos
    for (const { pattern, replacement } of replacements) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }
    }

    // Si se modificó, agregar import de logger
    if (modified) {
      content = addLoggerImport(content, filePath);
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Buscando archivos TypeScript...');

  // Buscar todos los archivos .ts y .tsx
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: EXCLUDE_DIRS.map(dir => `**/${dir}/**`),
    cwd: path.join(__dirname, '..'),
    absolute: true
  });

  console.log(`📁 Encontrados ${files.length} archivos`);

  let processedCount = 0;
  let modifiedCount = 0;

  for (const file of files) {
    if (shouldProcessFile(file)) {
      processedCount++;
      if (processFile(file)) {
        modifiedCount++;
        console.log(`✅ Modificado: ${path.relative(process.cwd(), file)}`);
      }
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`   Archivos procesados: ${processedCount}`);
  console.log(`   Archivos modificados: ${modifiedCount}`);
  console.log(`   Archivos sin cambios: ${processedCount - modifiedCount}`);
  console.log('\n✅ ¡Completado!');
}

main();
