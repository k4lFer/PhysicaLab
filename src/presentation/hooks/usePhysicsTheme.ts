import { useTheme } from '@/hooks/use-theme';
import { Colors } from '@/constants/theme';
import { useForcedColorScheme } from './useThemeMode';

export function usePhysicsTheme() {
  const forced = useForcedColorScheme();
  const base = Colors[forced];

  return {
    ...base,
    accent: '#2563eb',
    positive: '#dc2626',
    negative: '#2563eb',
    netForce: '#2563eb',
    componentColor: '#ca8a04',
    cardBg: base.backgroundElement,
    resultBg: base.backgroundSelected,
    border: base.backgroundSelected,
  };
}
