import { Platform, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface ChipProps { active: boolean; onPress: () => void; children: string }

const fs = Platform.OS === 'web';

export function Chip({ active, onPress, children }: ChipProps) {
  const theme = usePhysicsTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { borderColor: active ? theme.accent : theme.border },
        active && { backgroundColor: theme.accent + '15' },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.text, { color: active ? theme.accent : theme.textSecondary }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: fs ? 6 : 5, paddingHorizontal: fs ? 18 : 14, borderRadius: 9999, borderWidth: 1 },
  pressed: { opacity: 0.7 } as ViewStyle,
  text: { fontSize: fs ? 14 : 12 },
});
