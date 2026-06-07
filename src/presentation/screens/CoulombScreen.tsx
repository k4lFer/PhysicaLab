import { useCallback } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useCoulomb } from '../hooks/useCoulomb';
import { TopBar } from '../components/ui/TopBar';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Chip } from '../components/ui/Chip';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GhostButton } from '../components/ui/GhostButton';
import { ChargeCard } from '../components/ChargeCard';
import { StepLine } from '../components/StepLine';
import { Graph2D } from '../components/Graph2D';
import { Graph3D } from '../components/Graph3D';
import { formatNum } from '@/shared/format';

function formatDist(m: number): string {
  return `${formatNum(m * 100, 4)} cm`;
}
import type { CoulombResult } from '@/domain/calculators/CoulombCalculator';
import { router } from 'expo-router';
import { PageContainer } from '@/presentation/components/ui/PageContainer';
import { useThemeMode } from '@/presentation/hooks/useThemeMode';

export function CoulombScreen() {
  const theme = usePhysicsTheme();
  const { mode: themeMode, toggle: toggleTheme } = useThemeMode();
  const {
    mode, switchMode, charges, targetId, setTargetId,
    result, tab, setTab, error,
    addCharge, removeCharge, updateCharge, calculate,
  } = useCoulomb();

  const goBack = useCallback(() => router.back(), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar
        title="Ley de Coulomb"
        onBack={goBack}
        right={
          <Pressable onPress={toggleTheme} hitSlop={8}>
            <Text style={{ fontSize: Platform.OS === 'web' ? 18 : 16, color: theme.textSecondary }}>
              {themeMode === 'light' ? '🌙' : '☀️'}
            </Text>
          </Pressable>
        }
      />
      <PageContainer>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.modeRow}>
            {(['2D', '3D'] as const).map(m => (
              <Pill key={m} active={mode === m} onPress={() => switchMode(m)}>{m}</Pill>
            ))}
            <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>
              {mode === '2D' ? 'Plano xy' : 'Espacio xyz'}
            </Text>
          </View>

          <SectionLabel>CARGAS DEL SISTEMA</SectionLabel>
          {charges.map(c => (
            <ChargeCard
              key={c.id} charge={c} mode={mode} isTarget={c.id === targetId}
              onUpdate={updateCharge} onRemove={() => removeCharge(c.id)} onSetTarget={() => setTargetId(c.id)}
            />
          ))}
          <GhostButton onPress={addCharge}>+ Añadir carga</GhostButton>

          <SectionLabel>CARGA OBJETIVO</SectionLabel>
          <View style={styles.chipRow}>
            {charges.map(c => (
              <Chip key={c.id} active={targetId === c.id} onPress={() => setTargetId(c.id)}>{c.label}</Chip>
            ))}
          </View>

          <PrimaryButton onPress={calculate}>CALCULAR FUERZA NETA</PrimaryButton>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: theme.positive + '15' }]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {result && <ResultView result={result} tab={tab} onTabChange={setTab} charges={charges} mode={mode} />}
        </ScrollView>
      </PageContainer>
    </View>
  );
}

function ResultView({ result, tab, onTabChange, charges, mode }: {
  result: CoulombResult;
  tab: 'steps' | 'graph';
  onTabChange: (t: 'steps' | 'graph') => void;
  charges: { id: number; x: number; y: number; z: number; q: number; label: string }[];
  mode: '2D' | '3D';
}) {
  const theme = usePhysicsTheme();

  return (
    <View style={styles.resultSection}>
      <View style={[styles.summary, { backgroundColor: theme.resultBg }]}>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
          Fuerza neta sobre {result.target.label}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>
            {formatNum(result.magnitude * 1e6, 4)}
          </Text>
          <Text style={[styles.summaryUnit, { color: theme.accent }]}>µN</Text>
        </View>
        <Text style={[styles.summaryAngle, { color: theme.textSecondary }]}>
          θ = {formatNum(result.angleDeg, 2)}°{result.anglePhiDeg !== null ? `  ·  φ = ${formatNum(result.anglePhiDeg, 2)}°` : ''}
        </Text>
        <Text style={[styles.summaryVec, { color: theme.text }]}>
          ({formatNum(result.netForce.x * 1e6, 3)} x̂ + {formatNum(result.netForce.y * 1e6, 3)} ŷ
          {mode === '3D' ? ` + ${formatNum(result.netForce.z * 1e6, 3)} ẑ` : ''}) µN
        </Text>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
        {([['steps', 'Paso a paso'], ['graph', 'Gráfica']] as const).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => onTabChange(key)}
            style={[styles.tab, { borderBottomColor: tab === key ? theme.accent : 'transparent' }]}>
            <Text style={[styles.tabText, { color: tab === key ? theme.accent : theme.textSecondary }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'steps' ? (
        <View style={[styles.stepsBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ScrollView style={styles.stepsScroll} nestedScrollEnabled>
            <View style={[styles.initData, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.initDataTitle, { color: theme.text }]}>Datos iniciales</Text>
              {charges.map(c => (
                <View key={c.id} style={styles.initRow}>
                  <Text style={[styles.initLabel, { color: c.id === result.target.id ? theme.accent : theme.textSecondary }]}>
                    {c.label}{c.id === result.target.id ? ' (objetivo)' : ''}
                  </Text>
                  <Text style={[styles.initVal, { color: theme.text }]}>
                    q = {c.q >= 0 ? '+' : ''}{formatNum(c.q * 1e9, 3)} nC
                    {'  '}r = ({formatDist(c.x)}, {formatDist(c.y)}{mode === '3D' ? `, ${formatDist(c.z)}` : ''})
                  </Text>
                </View>
              ))}
            </View>
            {result.steps.map((s, i) => <StepLine key={i} step={s} />)}
          </ScrollView>
        </View>
      ) : (
        <View style={[styles.graphBox, { borderColor: theme.border }]}>
          {mode === '2D' ? (
            <Graph2D charges={charges} targetId={result.target.id} netForce={result.netForce} sources={result.sources} />
          ) : (
            <Graph3D charges={charges} targetId={result.target.id} netForce={result.netForce} sources={result.sources} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: Platform.OS === 'web' ? 14 : 10, paddingHorizontal: 16 },
  modeLabel: { fontSize: Platform.OS === 'web' ? 13 : 11 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 10, paddingHorizontal: 16 },
  errorBox: { borderRadius: 8, padding: 12, marginTop: 10, marginHorizontal: 16 },
  errorText: { color: '#dc2626', fontSize: Platform.OS === 'web' ? 14 : 12, fontWeight: '500' },
  resultSection: { marginTop: 14, paddingHorizontal: 16 },
  summary: { borderRadius: 10, padding: 16, alignItems: 'center' },
  summaryLabel: { fontSize: Platform.OS === 'web' ? 12 : 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  summaryRow: { flexDirection: 'row', alignItems: 'baseline' },
  summaryValue: { fontSize: Platform.OS === 'web' ? 38 : 32, fontWeight: '700', lineHeight: Platform.OS === 'web' ? 44 : 36 },
  summaryUnit: { fontSize: Platform.OS === 'web' ? 16 : 14, fontWeight: '600', marginLeft: 3 },
  summaryAngle: { fontSize: Platform.OS === 'web' ? 14 : 12, marginVertical: 3 },
  summaryVec: { fontSize: Platform.OS === 'web' ? 13 : 11, fontFamily: 'monospace', marginTop: 2 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 14 },
  tab: { flex: 1, paddingVertical: Platform.OS === 'web' ? 12 : 9, borderBottomWidth: 2, alignItems: 'center' },
  tabText: { fontSize: Platform.OS === 'web' ? 14 : 12, fontWeight: '500' },
  stepsBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 10, maxHeight: 500 },
  stepsScroll: { maxHeight: 480 },
  initData: { borderRadius: 8, padding: 10, marginBottom: 10 },
  initDataTitle: { fontSize: Platform.OS === 'web' ? 13 : 11, fontWeight: '700', marginBottom: 6 },
  initRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  initLabel: { fontSize: Platform.OS === 'web' ? 12 : 10, fontWeight: '600', flex: 1 },
  initVal: { fontSize: Platform.OS === 'web' ? 12 : 10, fontFamily: 'monospace', flex: 2, textAlign: 'right' },
  graphBox: { marginTop: 10, borderRadius: 10, overflow: 'hidden', borderWidth: 1 },
});
