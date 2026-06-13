import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';
import { useCoulomb } from '../hooks/useCoulomb';
import { Pill } from '../components/ui/Pill';
import { Chip } from '../components/ui/Chip';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GhostButton } from '../components/ui/GhostButton';
import { ChargeCard } from '../components/ChargeCard';
import { StepLine } from '../components/StepLine';
import { Graph2D } from '../components/Graph2D';
import { Graph3D } from '../components/Graph3D';
import { Icon } from '../components/ui/Icon';
import { MathFormula } from '../components/MathFormula';
import { formatNum } from '@/shared/format';
import type { CoulombResult, CoulombStep } from '@/domain/calculators/CoulombCalculator';
import { PageContainer } from '@/presentation/components/ui/PageContainer';

const MOBILE_BREAKPOINT = 768;
type Tab = 'steps' | 'graph' | 'formulas';

export function CoulombScreen() {
  const theme = usePhysicsTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= MOBILE_BREAKPOINT;
  const {
    mode, switchMode, charges, targetId, setTargetId,
    result, tab: resultTab, setTab, error,
    addCharge, removeCharge, updateCharge, calculate,
  } = useCoulomb();

  const is3D = mode === '3D';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PageContainer wide>
        <View style={styles.modeRow}>
          <View style={[styles.pillGroup, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Pill active={mode === '2D'} onPress={() => switchMode('2D')}>2D</Pill>
            <Pill active={mode === '3D'} onPress={() => switchMode('3D')}>3D</Pill>
          </View>
          <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>
            {is3D ? 'Espacio xyz' : 'Plano xy'}
          </Text>
        </View>

        <View style={[styles.layout, { flexDirection: desktop ? 'row' : 'column' }]}>
          {/* Sidebar — desktop only */}
          {desktop && (
            <View style={styles.sidebar}>
              <View style={styles.sidebarInner}>
                {charges.map(c => (
                  <ChargeCard
                    key={c.id} charge={c} mode={mode} isTarget={c.id === targetId}
                    onUpdate={updateCharge} onRemove={() => removeCharge(c.id)} onSetTarget={() => setTargetId(c.id)}
                  />
                ))}

                <GhostButton onPress={addCharge}>
                  <Icon name="plus" size={14} color={theme.textSecondary} /> Agregar carga
                </GhostButton>

                <View style={styles.targetSection}>
                  <Text style={[styles.targetLabel, { color: theme.textTertiary }]}>Carga objetivo</Text>
                  <View style={styles.chipRow}>
                    {charges.map(c => (
                      <Chip key={c.id} active={targetId === c.id} onPress={() => setTargetId(c.id)}>{c.label}</Chip>
                    ))}
                  </View>
                </View>

                <PrimaryButton onPress={calculate}>
                  <Icon name="calc" size={16} color="#fff" /> Calcular fuerza neta
                </PrimaryButton>

                {error && (
                  <View style={[styles.errorBox, { backgroundColor: theme.positive + '15' }]}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Main content */}
          <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent} nestedScrollEnabled>
            {/* Mobile: charges accordion */}
            {!desktop && (
              <MobileChargesAccordion
                charges={charges} mode={mode} targetId={targetId}
                onUpdate={updateCharge} onRemove={removeCharge}
                onSetTarget={setTargetId} onAdd={addCharge} onCalculate={calculate}
                theme={theme} error={error}
              />
            )}

            {/* Graph */}
            <View style={[styles.graphCard, { borderColor: theme.border }]}>
              <View style={styles.graphContent}>
                {charges.length > 0 && (
                  mode === '2D' ? (
                    <Graph2D
                      charges={charges}
                      targetId={targetId}
                      netForce={result?.netForce ?? { x: 0, y: 0, z: 0 }}
                      sources={charges.filter(c => c.id !== targetId)}
                    />
                  ) : (
                    <Graph3D
                      charges={charges}
                      targetId={targetId}
                      netForce={result?.netForce ?? { x: 0, y: 0, z: 0 }}
                      sources={charges.filter(c => c.id !== targetId)}
                    />
                  )
                )}
              </View>
            </View>

            {/* Results */}
            {result && (
              <ResultView
                result={result}
                tab={resultTab}
                onTabChange={setTab}
                charges={charges}
                mode={mode}
              />
            )}
          </ScrollView>
        </View>
      </PageContainer>
    </View>
  );
}

function MobileChargesAccordion({ charges, mode, targetId, onUpdate, onRemove, onSetTarget, onAdd, onCalculate, theme, error }: {
  charges: any[]; mode: '2D' | '3D'; targetId: number;
  onUpdate: any; onRemove: any; onSetTarget: any; onAdd: any; onCalculate: any;
  theme: any; error: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.accordionCard, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <Pressable onPress={() => setOpen(o => !o)} style={styles.accordionHeader}>
        <View style={open && { transform: [{ rotate: '90deg' }] }}>
          <Icon name="chevron-right" size={16} color={theme.accent} />
        </View>
        <Text style={[styles.accordionTitle, { color: theme.text }]}>Cargas del sistema</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.countText, { color: theme.textTertiary }]}>{charges.length}</Text>
        </View>
      </Pressable>
      {open && (
        <View style={styles.accordionContent}>
          {charges.map(c => (
            <ChargeCard
              key={c.id} charge={c} mode={mode} isTarget={c.id === targetId}
              onUpdate={onUpdate} onRemove={() => onRemove(c.id)} onSetTarget={() => onSetTarget(c.id)}
            />
          ))}
          <GhostButton onPress={onAdd}><Icon name="plus" size={14} color={theme.textSecondary} /> Agregar carga</GhostButton>
          <View style={styles.targetSection}>
            <Text style={[styles.targetLabel, { color: theme.textTertiary }]}>Carga objetivo</Text>
            <View style={styles.chipRow}>
              {charges.map(c => (
                <Chip key={c.id} active={targetId === c.id} onPress={() => onSetTarget(c.id)}>{c.label}</Chip>
              ))}
            </View>
          </View>
          <PrimaryButton onPress={onCalculate}><Icon name="calc" size={16} color="#fff" /> Calcular fuerza neta</PrimaryButton>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: theme.positive + '15' }]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function ResultView({ result, tab, onTabChange, charges, mode }: {
  result: CoulombResult;
  tab: Tab;
  onTabChange: (t: Tab) => void;
  charges: { id: number; x: number; y: number; z: number; q: number; label: string }[];
  mode: '2D' | '3D';
}) {
  const theme = usePhysicsTheme();

  return (
    <View style={[styles.resultSection, { borderColor: theme.border }]}>
      <View style={styles.resultSummary}>
        <Text style={[styles.resultLabel, { color: theme.textTertiary }]}>
          Fuerza neta sobre {result.target.label}
        </Text>
        <View style={styles.resultMainRow}>
          <Text style={[styles.resultValue, { color: theme.accent }]}>
            {formatNum(result.magnitude * 1e6, 4)}
          </Text>
          <Text style={[styles.resultUnit, { color: theme.accent }]}>μN</Text>
        </View>
        <View style={styles.resultMeta}>
          <ResultMetaItem label="Componente x" value={`Fₓ = ${formatNum(result.netForce.x * 1e6, 3)} μN`} color={theme.accent} />
          <ResultMetaItem label="Componente y" value={`Fᵧ = ${formatNum(result.netForce.y * 1e6, 3)} μN`} color={theme.gold} />
          {mode === '3D' && <ResultMetaItem label="Componente z" value={`F₂ = ${formatNum(result.netForce.z * 1e6, 3)} μN`} color={theme.magenta} />}
          <ResultMetaItem label="Ángulo" value={`θ = ${formatNum(result.angleDeg, 2)}°`} color={theme.magenta} />
          <ResultMetaItem label="Magnitud" value={`${formatNum(result.magnitude * 1e6, 4)} μN`} color={theme.accent} />
        </View>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
        {([['steps', 'Paso a paso'], ['graph', 'Gráfica vectorial'], ['formulas', 'Fórmulas']] as const).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => onTabChange(key)}
            style={[styles.tab, { borderBottomColor: tab === key ? theme.accent : 'transparent' }]}>
            <Text style={[styles.tabText, { color: tab === key ? theme.accent : theme.textTertiary }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'steps' && <StepsContent result={result} charges={charges} mode={mode} theme={theme} />}
      {tab === 'graph' && (
        <View style={styles.graphTabContent}>
          {mode === '2D' ? (
            <Graph2D charges={charges} targetId={result.target.id} netForce={result.netForce} sources={result.sources} />
          ) : (
            <Graph3D charges={charges} targetId={result.target.id} netForce={result.netForce} sources={result.sources} />
          )}
        </View>
      )}
      {tab === 'formulas' && <FormulasContent theme={theme} />}
    </View>
  );
}

function ResultMetaItem({ label, value, color }: { label: string; value: string; color: string }) {
  const theme = usePhysicsTheme();
  return (
    <View style={styles.metaItem}>
      <Text style={[styles.metaLabel, { color: theme.textTertiary }]}>{label}</Text>
      <Text style={[styles.metaValue, { color }]}>{value}</Text>
    </View>
  );
}

/* ─── Steps: group by div markers, each group is collapsible ─── */

function groupSteps(steps: CoulombStep[]): { title: string; steps: CoulombStep[] }[] {
  const groups: { title: string; steps: CoulombStep[] }[] = [];
  let current: CoulombStep[] = [];
  let currentTitle = '';

  for (const s of steps) {
    if (s.type === 'div') {
      if (current.length > 0) {
        groups.push({ title: currentTitle, steps: current });
      }
      current = [];
      currentTitle = s.text?.replace(/─+/g, '').trim() || '';
    } else {
      current.push(s);
    }
  }
  if (current.length > 0) {
    groups.push({ title: currentTitle, steps: current });
  }

  return groups;
}

function StepsContent({ result, charges, mode, theme }: {
  result: CoulombResult;
  charges: { id: number; x: number; y: number; z: number; q: number; label: string }[];
  mode: '2D' | '3D';
  theme: any;
}) {
  const groups = useMemo(() => groupSteps(result.steps), [result.steps]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });

  const toggle = useCallback((idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  function formatDist(m: number) {
    return `${formatNum(m * 100, 4)} cm`;
  }

  return (
    <View style={styles.stepsContainer}>
      <View style={[styles.initData, { backgroundColor: theme.backgroundElement }]}>
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

      {groups.map((group, gi) => (
        <View key={gi} style={[styles.stepGroup, { borderColor: theme.border }]}>
          <Pressable
            onPress={() => toggle(gi)}
            style={[styles.stepGroupHeader, { backgroundColor: theme.backgroundElement }]}>
            <View style={expanded[gi] && { transform: [{ rotate: '90deg' }] }}>
              <Icon name="chevron-right" size={14} color={theme.accent} />
            </View>
            <Text style={[styles.stepGroupTitle, { color: theme.text }]}>
              {group.title || `Grupo ${gi + 1}`}
            </Text>
          </Pressable>
          {expanded[gi] && (
            <View style={styles.stepGroupBody}>
              {group.steps.map((s, i) => <StepLine key={i} step={s} />)}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function FormulasContent({ theme }: { theme: any }) {
  const formulas = [
    { latex: 'F = k \\cdot \\dfrac{|q_1 q_2|}{r^2}', label: 'Ley de Coulomb' },
    { latex: '\\mathbf{F}_{\\text{neta}} = \\sum \\mathbf{F}_i', label: 'Principio de superposición' },
    { latex: 'F = \\sqrt{F_x^2 + F_y^2}', label: 'Magnitud resultante' },
    { latex: '\\theta = \\arctan\\!\\left(\\frac{F_y}{F_x}\\right)', label: 'Dirección del vector' },
    { latex: 'k = 8.988 \\times 10^9\\;\\frac{\\mathrm{N}\\cdot\\mathrm{m}^2}{\\mathrm{C}^2}', label: 'Constante de Coulomb' },
  ];

  return (
    <View style={styles.formulasContent}>
      {formulas.map((f, i) => (
        <View key={i} style={styles.formulaRow}>
          <MathFormula math={f.latex} color={theme.text} fontSize={16} />
          <Text style={[styles.formulaLabel, { color: theme.textTertiary }]}>{f.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 0,
  },
  pillGroup: {
    flexDirection: 'row', gap: 2, padding: 2, borderRadius: 8, borderWidth: 1,
  },
  modeLabel: { fontSize: 14, fontWeight: '500' },

  layout: { gap: 20, flex: 1 },

  // Sidebar
  sidebar: { width: 280, maxHeight: 'calc(100vh - 120px)', overflowY: 'scroll' } as any,
  sidebarInner: { gap: 10, paddingBottom: 4 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  countText: { fontSize: 12 },
  targetSection: { marginTop: 4 },
  targetLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  errorBox: { borderRadius: 8, padding: 10, marginTop: 8 },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },

  // Main content
  mainScroll: { flex: 1 } as any,
  mainContent: { gap: 14, paddingBottom: 40 },

  // Mobile accordion
  accordionCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  accordionTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  accordionContent: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },

  // Graph
  graphCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', minHeight: 280 },
  graphContent: { minHeight: 280 },

  // Results
  resultSection: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  resultSummary: { padding: 18, gap: 12 },
  resultLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  resultMainRow: { flexDirection: 'row', alignItems: 'baseline' },
  resultValue: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  resultUnit: { fontSize: 18, fontWeight: '500', marginLeft: 4 },
  resultMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { minWidth: 130 },
  metaLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 14, fontWeight: '600' },

  // Tabs
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, borderBottomWidth: 2, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '500' },

  // Steps
  stepsContainer: { padding: 12, gap: 8 },
  initData: { borderRadius: 10, padding: 12, marginBottom: 6 },
  initDataTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  initRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  initLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  initVal: { fontSize: 12, flex: 2, textAlign: 'right' },
  stepGroup: { borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  stepGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12 },
  stepGroupTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  stepGroupBody: { paddingVertical: 4, paddingHorizontal: 12 },

  // Graph tab
  graphTabContent: { padding: 12 },

  // Formulas
  formulasContent: { padding: 16, gap: 14 },
  formulaRow: { gap: 4 },
  formulaLabel: { fontSize: 13, fontWeight: '400', opacity: 0.7 },
});
