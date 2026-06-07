import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface GhostButtonProps {
  onPress: () => void;
  children: string;
}

export function GhostButton({ onPress, children }: GhostButtonProps) {
  const theme = usePhysicsTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.border },
        pressed && { opacity: 0.6 },
      ]}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 9,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 4,
  },
  text: { fontSize: 12, textAlign: 'center' },
});
