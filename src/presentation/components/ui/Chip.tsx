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
        {
          borderColor: active ? theme.accent + '4d' : theme.border,
          backgroundColor: active ? theme.accent + '1a' : theme.backgroundElement,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.text, { color: active ? theme.accent : theme.textSecondary }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: fs ? 5 : 4, paddingHorizontal: fs ? 16 : 14, borderRadius: 9999, borderWidth: 1 },
  pressed: { opacity: 0.7 } as ViewStyle,
  text: { fontSize: fs ? 13 : 12, fontWeight: '500' },
});
