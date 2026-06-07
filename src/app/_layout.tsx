import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { ThemeProvider } from '@/presentation/hooks/useThemeMode';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="coulomb" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </ThemeProvider>
  );
}
