# Implementación de Modo Oscuro en PoliGer

## 🌙 Resumen

Se ha implementado soporte completo para modo oscuro en los formularios de polinización de la aplicación PoliGer. El sistema de temas es dinámico y responde automáticamente al tema del sistema operativo del dispositivo.

## 📁 Archivos Modificados

### Componentes Actualizados
1. **`components/forms/PolinizacionForm.tsx`**
   - Convertido a usar colores dinámicos del tema
   - Soporte completo para modo oscuro
   - Todos los elementos visuales (fondos, textos, bordes, iconos) se adaptan al tema

2. **`app/(tabs)/addPolinizacion.tsx`**
   - Convertido a usar colores dinámicos del tema
   - Modal responsive con soporte de tema oscuro
   - Todos los campos de formulario adaptados al tema

3. **`components/common/SimpleCalendarPicker.tsx`**
   - Convertido a usar colores dinámicos del tema
   - Labels, inputs y modal adaptados al tema
   - Calendario completamente funcional en modo oscuro

### Componente Nuevo
4. **`components/common/ThemeToggle.tsx`**
   - Componente de alternancia de tema
   - Tres modos: Claro, Oscuro, Sistema
   - Listo para usar en pantallas de configuración o perfil

## 🎨 Sistema de Colores

El sistema utiliza el archivo `utils/colors.ts` que define:

### Colores del Tema Oscuro
- **Fondos:**
  - Primary: `#1e293b` (slate-800)
  - Secondary: `#0f172a` (slate-900)
  - Tertiary: `#334155` (slate-700)

- **Textos:**
  - Primary: `#f1f5f9` (slate-100)
  - Secondary: `#cbd5e1` (slate-300)
  - Tertiary: `#94a3b8` (slate-400)

- **Bordes:**
  - Light: `#475569`
  - Default: `#334155`
  - Medium: `#475569`
  - Dark: `#64748b`

## 🔧 Cómo Usar

### Cambiar el Tema Manualmente

1. **Agregar el ThemeToggle a tu Perfil:**

```tsx
import { ThemeToggle } from '@/components/common/ThemeToggle';

// En tu componente de configuración/perfil:
<ThemeToggle />
```

2. **Usar el Hook useTheme en Componentes:**

```tsx
import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>
        Tema actual: {theme}
      </Text>
    </View>
  );
}
```

3. **Crear Estilos Dinámicos:**

```tsx
const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
  },
  text: {
    color: colors.text.primary,
  },
});

// En el componente:
const { colors } = useTheme();
const styles = createStyles(colors);
```

## 🧪 Probar el Modo Oscuro

### En iOS
1. **Simulator:** Settings → Developer → Dark Appearance
2. **Dispositivo Real:** Settings → Display & Brightness → Appearance → Dark

### En Android
1. **Emulator:** Settings → Display → Dark theme
2. **Dispositivo Real:** Settings → Display → Dark theme

### Forzar Modo Oscuro en la App
```tsx
// En cualquier componente:
const { setThemeMode } = useTheme();

// Modo oscuro
setThemeMode('dark');

// Modo claro
setThemeMode('light');

// Seguir el sistema
setThemeMode('system');
```

## 📝 Características Implementadas

✅ **Fondos Adaptativos**
- Modales y overlays
- Contenedores de formulario
- Secciones y subsecciones

✅ **Textos Adaptativos**
- Títulos y subtítulos
- Labels y placeholders
- Textos de botones
- Mensajes de error

✅ **Inputs Adaptativos**
- Campos de texto
- Pickers/Selectores
- Calendarios
- Dropdowns de autocompletado

✅ **Elementos Interactivos**
- Botones primarios y secundarios
- Iconos
- Bordes y separadores
- Estados hover/pressed

✅ **Componentes Especiales**
- Predicción ML (resultados)
- Mensajes de error
- Indicadores de carga
- Autocompletado de códigos y ubicaciones

## 🎯 Mejores Prácticas

1. **Siempre usar el hook `useTheme`** en lugar de colores hardcodeados
2. **Crear estilos dinámicos** con la función `createStyles`
3. **Usar las constantes de color** del objeto `colors` retornado por `getColors()`
4. **Mantener consistencia** en los colores entre componentes
5. **Probar en ambos temas** antes de hacer commit

## 📦 Componentes Pendientes (Opcional)

Si deseas extender el modo oscuro a otros componentes:

1. Listas de germinaciones
2. Pantallas de reportes
3. Notificaciones
4. Dashboard principal
5. Formularios de germinación

Para cada uno, sigue el mismo patrón:
1. Importar `useTheme`
2. Obtener el objeto `colors`
3. Convertir `StyleSheet.create` a una función `createStyles(colors)`
4. Reemplazar colores hardcodeados con valores del tema

## 🐛 Troubleshooting

### El tema no cambia
- Verificar que `ThemeProvider` esté en el `_layout.tsx` raíz
- Revisar que el componente use el hook `useTheme`

### Colores no se ven bien en modo oscuro
- Verificar que todos los colores usen valores del objeto `colors`
- Revisar contrastes de texto sobre fondos

### El picker no se ve en modo oscuro
- En Android, algunos componentes nativos tienen limitaciones
- Considerar usar una biblioteca custom de picker si es necesario

## 📚 Referencias

- Sistema de colores: `utils/colors.ts`
- Contexto de tema: `contexts/ThemeContext.tsx`
- Hook de tema: `hooks/useColorScheme.ts`

## 🎉 Resultado

Los formularios de polinización ahora tienen un aspecto moderno y profesional en modo oscuro, con excelente contraste y legibilidad. El tema se adapta automáticamente al tema del sistema o puede ser controlado manualmente por el usuario.
