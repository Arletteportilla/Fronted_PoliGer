import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PersistentAlertProvider } from '@/contexts/PersistentAlertContext';
import { ConfirmationProvider } from '@/contexts/ConfirmationContext';
import '@/utils/suppressWarnings'; // Suprimir warnings innecesarios

const RootLayoutNav = memo(() => {
  const { token, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // TODOS los hooks deben ejecutarse antes de cualquier return condicional
  const currentPath = useMemo(() => segments.join('/') || 'root', [segments]);

  const handleNavigation = useCallback(() => {
    if (isLoading) return;

    // Sin token → login (excepto pantallas públicas)
    const publicPaths = ['login', 'forgot-password'];
    if (!token && !publicPaths.includes(currentPath)) {
      // Si hay un reset en curso (localStorage), ir a forgot-password
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('poliger_reset_state') : null;
        if (raw) {
          const { ts } = JSON.parse(raw);
          if (Date.now() - ts <= 15 * 60 * 1000) {
            router.replace('/forgot-password' as any);
            return;
          }
          localStorage.removeItem('poliger_reset_state');
        }
      } catch {}
      router.replace('/login');
      return;
    }

    if (token) {
      const debeCambiar = user?.debe_cambiar_password === true;

      // Tiene contraseña temporal pendiente → forzar pantalla de cambio
      if (debeCambiar && currentPath !== 'cambiar-password') {
        router.replace('/cambiar-password' as any);
        return;
      }

      // Ya cambió su contraseña pero sigue en esa pantalla → tabs
      if (!debeCambiar && currentPath === 'cambiar-password') {
        router.replace('/(tabs)');
        return;
      }

      // Login/forgot-password con sesión válida → tabs
      if (currentPath === 'login' || currentPath === 'root' || currentPath === 'forgot-password') {
        router.replace('/(tabs)');
      }
    }
  }, [token, isLoading, user, currentPath, router]);

  const LoadingComponent = useMemo(() => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  ), []);

  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  // useEffect siempre debe ejecutarse
  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  // Ahora sí podemos hacer returns condicionales
  if (isLoading) {
    return LoadingComponent;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={screenOptions} />
      <Stack.Screen name="login" options={screenOptions} />
      <Stack.Screen name="cambiar-password" options={screenOptions} />
      <Stack.Screen name="forgot-password" options={screenOptions} />
      <Stack.Screen name="diagnostic" options={screenOptions} />
      <Stack.Screen name="+not-found" options={screenOptions} />
    </Stack>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <NavigationThemeProvider value={DefaultTheme}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SidebarProvider>
              <PersistentAlertProvider>
                <ConfirmationProvider>
                  <RootLayoutNav />
                </ConfirmationProvider>
              </PersistentAlertProvider>
            </SidebarProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </NavigationThemeProvider>
  );
}
