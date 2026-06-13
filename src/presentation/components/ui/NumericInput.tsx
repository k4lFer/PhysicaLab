import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface NumericInputProps {
  label: string; value: string; onChange: (val: string) => void; accent?: boolean;
}

const fs = Platform.OS === 'web';

export function NumericInput({ label, value, onChange, accent }: NumericInputProps) {
  const theme = usePhysicsTheme();
  const [text, setText] = useState(value);
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setText(value);
  }, [value]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textTertiary }]}>{label}</Text>
      <TextInput
        value={text}
        onChangeText={v => {
          setText(v);
          editing.current = true;
          onChange(v);
        }}
        onBlur={() => { editing.current = false; }}
        onFocus={() => { editing.current = true; }}
        keyboardType="numeric"
        placeholderTextColor={theme.textTertiary}
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: accent ? theme.accent + '4d' : theme.border,
            color: theme.text,
          },
          Platform.OS === 'web' && { outlineStyle: 'none' } as any,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2, minWidth: fs ? 80 : 72, flex: 1 },
  label: { fontSize: fs ? 11 : 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    borderWidth: 1, borderRadius: 6, paddingVertical: fs ? 7 : 5, paddingHorizontal: 10,
    fontSize: fs ? 14 : 13, width: '100%', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
});
