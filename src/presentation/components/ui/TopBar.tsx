import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface TopBarProps {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}

export function TopBar({ title, onBack, right }: TopBarProps) {
  const theme = usePhysicsTheme();
  return (
    <View style={[styles.container, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
      <Pressable onPress={onBack} style={styles.back} hitSlop={8}>
        <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
      </Pressable>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  back: { paddingRight: 10, paddingVertical: 2 },
  backText: { fontSize: 22, fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  right: { width: 36, alignItems: 'flex-end' },
});
