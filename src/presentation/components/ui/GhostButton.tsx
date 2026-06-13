import { Children, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface GhostButtonProps {
  onPress: () => void;
  children: ReactNode;
}

const fs = Platform.OS === 'web';

export function GhostButton({ onPress, children }: GhostButtonProps) {
  const theme = usePhysicsTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.borderLight },
        pressed && { borderColor: theme.accent },
      ]}>
      <View style={styles.inner}>
        {Children.map(children, child =>
          typeof child === 'string' ? <Text style={[styles.text, { color: theme.textSecondary }]}>{child}</Text> : child
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
});
