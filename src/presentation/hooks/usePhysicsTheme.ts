// ============================================================
// usePhysicsTheme.ts — Hook de tema (claro/oscuro)
// Capa: Presentación (acceso a colores semánticos)
// ============================================================

import { Colors } from '@/constants/theme';
import { useForcedColorScheme } from './useThemeMode';

// Retorna los colores del tema activo con alias semánticos
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
