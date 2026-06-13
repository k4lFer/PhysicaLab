import { Colors } from '@/constants/theme';
import { useForcedColorScheme } from './useThemeMode';

export function usePhysicsTheme() {
  const forced = useForcedColorScheme();
  const base = Colors[forced];

  return {
    ...base,
    accent: base.accent,
    positive: base.positive,
    negative: base.negative,
    netForce: base.accent,
    componentColor: base.gold,
    cardBg: base.backgroundElement,
    resultBg: base.backgroundSelected,
    border: base.border,
  };
}
