import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import type { Charge } from '@/domain/entities/Charge';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface Graph3DProps {
  charges: Charge[];
  targetId: number;
  netForce: { x: number; y: number; z: number };
  sources: Charge[];
}

export function Graph3DNative(props: Graph3DProps) {
  const theme = usePhysicsTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>
        Vista 3D
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        disponible en versión web
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 390,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
  },
});
