import { Platform, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface PrimaryButtonProps { onPress: () => void; children: string }

const fs = Platform.OS === 'web';

export function PrimaryButton({ onPress, children }: PrimaryButtonProps) {
  const theme = usePhysicsTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.accent },
        pressed && styles.pressed,
      ]}>
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: '100%', paddingVertical: fs ? 15 : 13, borderRadius: 8, marginTop: 4 },
  pressed: { opacity: 0.8 } as ViewStyle,
  text: { color: '#ffffff', fontSize: fs ? 15 : 13, fontWeight: '600', textAlign: 'center' },
});
