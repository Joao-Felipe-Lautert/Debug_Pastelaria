import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';
    const inAdminGroup = segments[0] === 'admin';

    if (!user) {
      // Se não estiver logado e não estiver na tela de login, vai para login
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else {
      // Se estiver logado
      if (user.adm === true) {
        // Se for ADM e não estiver na tela de admin, vai para admin
        if (!inAdminGroup) {
          console.log('Redirecionando ADM para /admin');
          router.replace('/admin');
        }
      } else {
        // Se for usuário comum e estiver em telas restritas (login ou admin), vai para home
        if (inAuthGroup || inAdminGroup) {
          console.log('Redirecionando Usuário para /(tabs)');
          router.replace('/(tabs)');
        }
      }
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="cart" options={{ presentation: 'modal', headerShown: true, title: 'Carrinho' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
