// ============================================================
// ChargeCard.tsx — Tarjeta de edición de una carga puntual
// Capa: Presentación (componente de entrada de datos)
// ============================================================

import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Charge } from '@/domain/entities/Charge';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';
import { Chip } from './ui/Chip';
import { NumericInput } from './ui/NumericInput';

interface ChargeCardProps {
  charge: Charge; mode: '2D' | '3D'; isTarget: boolean;
  onUpdate: (id: number, field: string, raw: string) => void;
  onRemove: () => void; onSetTarget: () => void;
}

const fs = Platform.OS === 'web';

// Convierte valor interno (C, m) a display (nC, cm)
function fmt(v: number, scale: number): string {
  return parseFloat((v * scale).toFixed(10)).toString();
}

export function ChargeCard({ charge, mode, isTarget, onUpdate, onRemove, onSetTarget }: ChargeCardProps) {
  const theme = usePhysicsTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: isTarget ? theme.accent : theme.border }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: charge.q >= 0 ? theme.positive : theme.negative }]}>
          {charge.label}
        </Text>
        <View style={styles.actions}>
          <Chip active={isTarget} onPress={onSetTarget}>{isTarget ? 'objetivo' : 'marcar'}</Chip>
          <Pressable onPress={onRemove} style={styles.remove} hitSlop={8}>
            <Text style={{ color: theme.positive, fontSize: fs ? 18 : 16 }}>✕</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.grid}>
        <NumericInput label="q (nC)" value={fmt(charge.q, 1e9)} onChange={v => onUpdate(charge.id, 'q', v)} accent />
        <NumericInput label="x (cm)" value={fmt(charge.x, 100)} onChange={v => onUpdate(charge.id, 'x', v)} />
        <NumericInput label="y (cm)" value={fmt(charge.y, 100)} onChange={v => onUpdate(charge.id, 'y', v)} />
        {mode === '3D' && (
          <NumericInput label="z (cm)" value={fmt(charge.z, 100)} onChange={v => onUpdate(charge.id, 'z', v)} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 7 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontWeight: '700', fontSize: fs ? 16 : 14, minWidth: 30 },
  actions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  remove: { paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
