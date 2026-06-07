import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface NumericInputProps {
  label: string; value: string; onChange: (val: string) => void; accent?: boolean;
}

const fs = Platform.OS === 'web';

export function NumericInput({ label, value, onChange, accent }: NumericInputProps) {
  const theme = usePhysicsTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.background,
            borderColor: accent ? theme.accent : theme.border,
            color: theme.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2, minWidth: fs ? 80 : 72, flex: 1 },
  label: { fontSize: fs ? 12 : 10, fontWeight: '500' },
  input: {
    borderWidth: 1, borderRadius: 6, paddingVertical: fs ? 8 : 6, paddingHorizontal: 8,
    fontSize: fs ? 15 : 13, width: '100%',
  },
});
