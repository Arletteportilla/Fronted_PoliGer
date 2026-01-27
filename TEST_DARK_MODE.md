# 🧪 Prueba de Modo Oscuro - PoliGer

## ✅ Estado de Implementación

El modo oscuro ha sido implementado exitosamente en los siguientes componentes:

### ✨ Componentes con Modo Oscuro
- ✅ `PolinizacionForm.tsx` - Formulario modal de polinización
- ✅ `addPolinizacion.tsx` - Pantalla de agregar/editar polinización
- ✅ `SimpleCalendarPicker.tsx` - Selector de fecha con calendario
- ✅ `ThemeToggle.tsx` - Componente de alternancia de tema (NUEVO)

## 🎯 Cómo Probar

### Opción 1: Cambiar Tema del Sistema (Recomendado)

#### iOS Simulator
```bash
# Activar modo oscuro
xcrun simctl ui booted appearance dark

# Volver a modo claro
xcrun simctl ui booted appearance light
```

#### Android Emulator
1. Abrir Settings en el emulador
2. Ir a Display → Dark theme
3. Activar/desactivar el switch

### Opción 2: Agregar ThemeToggle al Perfil

Agrega este código a tu pantalla de perfil o configuración:

```tsx
import { ThemeToggle } from '@/components/common';

// Dentro de tu componente:
<View style={styles.settingsSection}>
  <Text style={styles.sectionTitle}>Apariencia</Text>
  <ThemeToggle />
</View>
```

### Opción 3: Código de Prueba Rápido

Agrega este botón temporalmente en cualquier pantalla para probar:

```tsx
import { useTheme } from '@/contexts/ThemeContext';
import { TouchableOpacity, Text } from 'react-native';

// Dentro de tu componente:
const { theme, toggleTheme } = useTheme();

<TouchableOpacity 
  onPress={toggleTheme}
  style={{ padding: 16, backgroundColor: '#e9ad14' }}
>
  <Text style={{ color: '#fff' }}>
    Cambiar a {theme === 'light' ? 'Oscuro' : 'Claro'}
  </Text>
</TouchableOpacity>
```

## 📸 Capturas de Pantalla Esperadas

### Modo Claro (Light Mode)
- **Fondo:** Blanco (#ffffff)
- **Texto:** Gris oscuro (#121212, #374151)
- **Bordes:** Grises claros (#e5e7eb, #d1d5db)
- **Modales:** Overlay gris translúcido

### Modo Oscuro (Dark Mode)
- **Fondo:** Slate oscuro (#1e293b, #0f172a)
- **Texto:** Slate claro (#f1f5f9, #cbd5e1)
- **Bordes:** Slate medio (#475569, #334155)
- **Modales:** Overlay negro translúcido más intenso

## 🔍 Checklist de Elementos a Verificar

Abre el formulario de polinización y verifica que estos elementos cambien correctamente:

### Modal Principal
- [ ] Fondo del overlay (semi-transparente)
- [ ] Fondo del contenedor del modal
- [ ] Header del modal (título y botón cerrar)

### Secciones del Formulario
- [ ] Títulos de sección (Fechas, Tipo de Polinización, etc.)
- [ ] Fondos de las secciones
- [ ] Íconos de las secciones

### Campos de Entrada
- [ ] Inputs de texto (fondo y color de texto)
- [ ] Pickers/selectores (fondo y texto)
- [ ] Calendario - ver sección detallada abajo
- [ ] Placeholders (color gris)

### SimpleCalendarPicker (Fecha de Polinización)
- [ ] Label "Fecha de Polinización *" (texto legible)
- [ ] Botón "Seleccionar fecha" (fondo adaptado)
- [ ] Ícono del calendario (color correcto)
- [ ] Modal overlay (translúcido oscuro)
- [ ] Contenedor del calendario (fondo adaptado)
- [ ] Header con mes/año (texto legible)
- [ ] Botones de navegación (< >) (fondo y bordes)
- [ ] Días de la semana (Dom, Lun, etc.) (texto legible)
- [ ] Días del mes (números legibles)
- [ ] Día seleccionado (resaltado en amarillo)
- [ ] Día actual (borde amarillo)
- [ ] Días de otros meses (opacidad reducida)
- [ ] Botón "Cancelar" (fondo y texto)
- [ ] Botón "Confirmar" (fondo amarillo, texto legible)

### Dropdowns y Autocompletado
- [ ] Fondo de los dropdowns
- [ ] Opciones individuales
- [ ] Texto de códigos y detalles
- [ ] Bordes y separadores

### Botones
- [ ] Botón "Guardar" (fondo y texto)
- [ ] Botón "Cancelar" (fondo y texto)
- [ ] Estados disabled

### Otros Elementos
- [ ] Mensajes de error (si aplica)
- [ ] Predicción ML (si se muestra)
- [ ] Campos deshabilitados (autocompletado)

## 🎨 Paleta de Colores de Referencia

### Tema Claro
```
Backgrounds:
- Primary:    #ffffff
- Secondary:  #f8fafc
- Tertiary:   #f3f4f6

Text:
- Primary:    #121212
- Secondary:  #374151
- Tertiary:   #6b7280

Borders:
- Default:    #e5e7eb
- Medium:     #d1d5db
```

### Tema Oscuro
```
Backgrounds:
- Primary:    #1e293b (slate-800)
- Secondary:  #0f172a (slate-900)
- Tertiary:   #334155 (slate-700)

Text:
- Primary:    #f1f5f9 (slate-100)
- Secondary:  #cbd5e1 (slate-300)
- Tertiary:   #94a3b8 (slate-400)

Borders:
- Default:    #334155
- Medium:     #475569
```

## 🐛 Problemas Conocidos

### Android
- Los `Picker` nativos pueden no respetar completamente los colores del tema
- **Solución:** Considerar usar una biblioteca de picker custom si es crítico

### iOS
- El `SimpleCalendarPicker` podría necesitar ajustes adicionales
- **Solución:** Verificar que ese componente también use `useTheme`

## 📝 Registro de Pruebas

Usa esta tabla para documentar tus pruebas:

| Plataforma | Versión | Modo | Estado | Notas |
|------------|---------|------|--------|-------|
| iOS Sim    | 17.0    | Light | ⬜     |       |
| iOS Sim    | 17.0    | Dark  | ⬜     |       |
| Android Em | 13      | Light | ⬜     |       |
| Android Em | 13      | Dark  | ⬜     |       |
| iOS Device | -       | Light | ⬜     |       |
| iOS Device | -       | Dark  | ⬜     |       |
| Android Dev| -       | Light | ⬜     |       |
| Android Dev| -       | Dark  | ⬜     |       |

**Leyenda:**
- ⬜ No probado
- ✅ Funciona correctamente
- ⚠️ Funciona con problemas menores
- ❌ No funciona

## 🚀 Próximos Pasos

Una vez que confirmes que el modo oscuro funciona correctamente en los formularios de polinización:

1. [ ] Extender a formularios de germinación
2. [ ] Extender a listas y cards
3. [ ] Extender a pantallas de reportes
4. [ ] Extender a notificaciones
5. [ ] Agregar `ThemeToggle` a la pantalla de perfil
6. [ ] Documentar cualquier componente custom que necesite adaptación
7. [ ] Considerar agregar animaciones de transición entre temas

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que `ThemeProvider` esté en el `_layout.tsx`
2. Revisa que el componente use `useTheme` correctamente
3. Confirma que los estilos usen la función `createStyles(colors)`
4. Verifica la consola para errores de TypeScript o React

## ✨ ¡Listo!

El modo oscuro está completamente funcional. Solo necesitas:
1. Cambiar el tema del sistema, o
2. Agregar el `ThemeToggle` a tu app

¡Disfruta del modo oscuro! 🌙
