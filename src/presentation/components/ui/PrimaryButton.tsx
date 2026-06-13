import { Children, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface PrimaryButtonProps {
  onPress: () => void;
  children: ReactNode;
}

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
      <View style={styles.inner}>
        {Children.map(children, child =>
          typeof child === 'string' ? <Text style={styles.text}>{child}</Text> : child
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: '100%', paddingVertical: fs ? 13 : 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85 } as ViewStyle,
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { color: '#ffffff', fontSize: fs ? 15 : 14, fontWeight: '700', textAlign: 'center' },
});
