import Head from 'expo-router/head';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from '@/presentation/screens/HomeScreen';

export default function Index() {
  return (
    <>
      <Head>
        <title>Inicio · Physica Lab</title>
      </Head>
      <SafeAreaView style={{ flex: 1 }}>
        <HomeScreen />
      </SafeAreaView>
    </>
  );
}
