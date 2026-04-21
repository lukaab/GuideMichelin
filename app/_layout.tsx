import { useRouter, useSegments } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';

function RootRedirect() {
  const { authUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!authUser && !inAuth) {
      router.replace('/(auth)');
    } else if (authUser && inAuth) {
      router.replace('/(tabs)');
    }
  }, [authUser, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E' }}>
        <ActivityIndicator size="large" color="#E2231A" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootRedirect />
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
