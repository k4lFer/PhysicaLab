import { Platform, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface PillProps { active: boolean; onPress: () => void; children: string }

const fs = Platform.OS === 'web';

export function Pill({ active, onPress, children }: PillProps) {
  const theme = usePhysicsTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: active ? theme.accent : 'transparent',
          borderColor: active ? theme.accent : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.text, { color: active ? '#fff' : theme.textSecondary }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: fs ? 6 : 5, paddingHorizontal: fs ? 26 : 20, borderRadius: 6, borderWidth: 1 },
  pressed: { opacity: 0.7 } as ViewStyle,
  text: { fontSize: fs ? 15 : 13, fontWeight: '600' },
});
