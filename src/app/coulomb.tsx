import Head from 'expo-router/head';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoulombScreen } from '@/presentation/screens/CoulombScreen';

export default function Coulomb() {
  return (
    <>
      <Head>
        <title>Ley de Coulomb · Physica Lab</title>
      </Head>
      <SafeAreaView style={{ flex: 1 }}>
        <CoulombScreen />
      </SafeAreaView>
    </>
  );
}
