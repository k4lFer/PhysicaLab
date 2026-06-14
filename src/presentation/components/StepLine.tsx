// ============================================================
// StepLine.tsx — Renderizador de pasos del cálculo
// Capa: Presentación (componente atómico de visualización)
// ============================================================

import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MathFormula } from './MathFormula';
import type { CoulombStep } from '@/domain/calculators/CoulombCalculator';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface StepLineProps { step: CoulombStep }

// Convierte texto plano con símbolos Unicode a sintaxis LaTeX
function toLatex(s: string): string {
  if (/\\dfrac|\\mathrm|\\hat|\\bm/.test(s)) {
    return s
      .replace(/°/g, '^{\\circ} ')
      .replace(/·/g, '\\cdot ')
      .replace(/×/g, '\\times ')
      .trim();
  }
  return s
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/Δx/g, '\\Delta x').replace(/Δy/g, '\\Delta y').replace(/Δz/g, '\\Delta z')
    .replace(/Δ(?!\w)/g, '\\Delta ')
    .replace(/·/g, '\\cdot ')
    .replace(/×/g, '\\times ')
    .replace(/π/g, '\\pi ').replace(/θ/g, '\\theta ').replace(/φ/g, '\\phi ').replace(/λ/g, '\\lambda ')
    .replace(/∑/g, '\\sum ')
    .replace(/°/g, '^{\\circ} ')
    .replace(/²/g, '^{2}').replace(/³/g, '^{3}')
    .replace(/⁰/g, '^{0}').replace(/¹/g, '^{1}').replace(/⁴/g, '^{4}')
    .replace(/⁵/g, '^{5}').replace(/⁶/g, '^{6}').replace(/⁷/g, '^{7}')
    .replace(/⁸/g, '^{8}').replace(/⁹/g, '^{9}')
    .replace(/₀/g, '_{0}').replace(/₁/g, '_{1}').replace(/₂/g, '_{2}').replace(/₃/g, '_{3}')
    .replace(/₄/g, '_{4}').replace(/₅/g, '_{5}').replace(/₆/g, '_{6}').replace(/₇/g, '_{7}')
    .replace(/₈/g, '_{8}').replace(/₉/g, '_{9}')
    .replace(/x̂/g, '\\hat{x}').replace(/ŷ/g, '\\hat{y}').replace(/ẑ/g, '\\hat{z}')
    .replace(/r̂/g, '\\hat{r}')
    .replace(/F_neta/g, 'F_{\\text{neta}}')
    .replace(/µN/g, '\\mu\\mathrm{N}')
    .replace(/nC/g, '\\mathrm{nC}').replace(/cm/g, '\\mathrm{cm}')
    .replace(/\[(.+?)\]/g, '\\mathrm{[$1]}')
    .replace(/↔/g, '\\leftrightarrow ').replace(/↗/g, '\\nearrow ')
    .trim();
}

export function StepLine({ step }: StepLineProps) {
  const theme = usePhysicsTheme();

  if (step.type === 'div') {
    return (
      <View style={[styles.divider, { borderBottomColor: theme.border }]}>
        <Text style={[styles.dividerText, { color: theme.textSecondary }]}>{step.text}</Text>
      </View>
    );
  }

  if (step.type === 'header') {
    return <Text style={[styles.header, { color: theme.textSecondary }]}>{step.text}</Text>;
  }

  if (step.type === 'error') {
    return (
      <View style={[styles.errorBox, { backgroundColor: theme.positive + '15' }]}>
        <Text style={styles.errorText}>{step.text}</Text>
      </View>
    );
  }

  const formulaFontSize = Platform.OS === 'web' ? 16 : 14;
  const resultFontSize = Platform.OS === 'web' ? 18 : 16;

  if (step.type === 'result') {
    return (
      <View style={[styles.resultBox, { backgroundColor: theme.resultBg }]}>
        <Text style={[styles.resultLabel, { color: theme.text }]}>{step.lbl}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mathScroll}>
          <MathFormula math={toLatex(step.val!)} color={theme.accent} fontSize={resultFontSize} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.row, { borderBottomColor: theme.border + '40' }]}>
      <Text style={[styles.lbl, { color: theme.textSecondary }]}>{step.lbl}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mathScroll}>
        <MathFormula math={toLatex(step.val!)} color={theme.text} fontSize={formulaFontSize} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { paddingVertical: 8, borderBottomWidth: 1, marginBottom: 5 },
  dividerText: { fontSize: 15, fontWeight: '500' },
  header: { fontSize: 15, paddingVertical: 3, fontStyle: 'italic' },
  errorBox: { borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10, marginVertical: 4 },
  errorText: { fontSize: 15, color: '#dc2626', fontWeight: '500' },
  resultBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginTop: 8,
  },
  resultLabel: { fontSize: 17, fontWeight: '600', flex: 1 },
  row: { paddingVertical: 8, borderBottomWidth: 0.5 },
  lbl: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  mathScroll: { flex: 1 },
});
