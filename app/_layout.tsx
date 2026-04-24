import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';

function RootLayoutNav() {
  const { authUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!authUser && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (authUser && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [authUser, loading, segments, router]);

  if (loading) return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="results" />
      <Stack.Screen
        name="advanced-filters"
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen name="restaurants/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
