import { Platform, StyleSheet, Text, type TextProps } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

export function SectionLabel({ style, children, ...rest }: TextProps) {
  const theme = usePhysicsTheme();
  return (
    <Text style={[{ color: theme.textTertiary }, styles.label, style]} {...rest}>
      {children}
    </Text>
  );
}

const fs = Platform.OS === 'web';
const styles = StyleSheet.create({
  label: { fontSize: fs ? 13 : 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
});
