import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, themeMode, setThemeMode, colors } = useTheme();

  const handlePress = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  const getIcon = () => {
    if (themeMode === 'light') return 'sunny';
    if (themeMode === 'dark') return 'moon';
    return 'phone-portrait';
  };

  const getLabel = () => {
    if (themeMode === 'light') return 'Claro';
    if (themeMode === 'dark') return 'Oscuro';
    return 'Sistema';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background.secondary }]}
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary.main }]}>
        <Ionicons name={getIcon()} size={20} color={colors.text.inverse} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>Tema</Text>
        <Text style={[styles.value, { color: colors.text.primary }]}>{getLabel()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});
