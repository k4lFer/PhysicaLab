// ============================================================
// MathFormula.tsx — Renderizador LaTeX → SVG
// Capa: Presentación (componente de visualización de fórmulas)
// ============================================================

import { useMemo } from 'react';
import { Text, View, ViewStyle, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import MathjaxFactory from 'react-native-math-view/src/mathjax/MathjaxFactory';

interface MathFormulaProps {
  math: string;
  color?: string;
  style?: ViewStyle;
  fontSize?: number;
}

// Limpia atributos internos de MathJax del SVG generado
function stripMathJaxAttrs(svg: string): string {
  return svg
    .replace(/ pLevel="[^"]*"/g, '')
    .replace(/ data-\w+(?:-\w+)*="[^"]*"/g, '');
}

const defaultMathjax = MathjaxFactory({ inline: true, em: 14, ex: 7 });

export function MathFormula({ math, color, style, fontSize }: MathFormulaProps) {
  const result = useMemo(() => {
    try {
      const mj = fontSize
        ? MathjaxFactory({ inline: true, em: fontSize, ex: fontSize / 2 })
        : defaultMathjax;
      const res = mj.toSVG(math);
      if ('error' in res) return null;
      return {
        xml: stripMathJaxAttrs(res.svg),
        size: res.size,
      };
    } catch {
      return null;
    }
  }, [math, fontSize]);

  if (!result) {
    return (
      <Text style={{ color, fontSize: fontSize ?? 14, fontFamily: 'monospace' }}>{math}</Text>
    );
  }

  return (
    <View style={[styles.wrapper, { minHeight: fontSize ? fontSize + 10 : 24 }, style]}>
      <SvgXml xml={result.xml} color={color} width={result.size.width} height={result.size.height} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { justifyContent: 'center' },
});
