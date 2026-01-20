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
import '@/utils/suppressWarnings'; // Suprimir warnings innecesarios
import { logger } from '@/services/logger';

const RootLayoutNav = memo(() => {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // TODOS los hooks deben ejecutarse antes de cualquier return condicional
  const currentPath = useMemo(() => segments.join('/') || 'root', [segments]);
  
  const handleNavigation = useCallback(() => {
    if (isLoading) return;

    logger.debug(' Navigation check:', { token: !!token, currentPath, isLoading });

    // Si no hay token, redirigir a login (excepto si ya estamos en login)
    if (!token && currentPath !== 'login' && currentPath !== 'register') {
      logger.info('🚀 Redirecting to login - no token');
      router.replace('/login');
    }
    // Si hay token y estamos en login, redirigir a tabs
    else if (token && (currentPath === 'login' || currentPath === 'register')) {
      logger.info('🚀 Redirecting to tabs - has token');
      router.replace('/(tabs)');
    }
    // Si hay token y estamos en root, redirigir a tabs
    else if (token && currentPath === 'root') {
      logger.info('🚀 Redirecting to tabs - root with token');
      router.replace('/(tabs)');
    }
  }, [token, isLoading, currentPath, router]);

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

  if (segments[0] === '(tabs)') {
    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={screenOptions} />
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={screenOptions} />
      <Stack.Screen name="register" options={screenOptions} />
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
                <RootLayoutNav />
              </PersistentAlertProvider>
            </SidebarProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </NavigationThemeProvider>
  );
}
