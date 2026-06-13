import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/presentation/hooks/useThemeMode';
import { TopNavBar } from '@/presentation/components/ui/TopNavBar';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

function LayoutContent() {
  const theme = usePhysicsTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopNavBar />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="coulomb" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Head>
        <title>Physica Lab</title>
      </Head>
      <StatusBar style="auto" />
      <LayoutContent />
    </ThemeProvider>
  );
}
