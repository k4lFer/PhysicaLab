import { SafeAreaView } from 'react-native-safe-area-context';
import { CoulombScreen } from '@/presentation/screens/CoulombScreen';

export default function Coulomb() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CoulombScreen />
    </SafeAreaView>
  );
}
