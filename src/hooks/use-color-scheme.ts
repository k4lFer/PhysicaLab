import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useForcedColorScheme } from '../presentation/hooks/useThemeMode';

export function useColorScheme() {
  const forced = useForcedColorScheme();
  if (forced) return forced;

  const system = useSystemColorScheme();
  return system ?? 'light';
}
