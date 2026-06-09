import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/presentation/hooks/useThemeMode';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Head>
        <title>Physica Lab</title>
      </Head>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Inicio' }} />
        <Stack.Screen name="coulomb" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </ThemeProvider>
  );
}
