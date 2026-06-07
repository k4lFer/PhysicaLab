import { useMemo } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import MathjaxFactory from 'react-native-math-view/src/mathjax/MathjaxFactory';

interface MathFormulaProps {
  math: string;
  color?: string;
  style?: ViewStyle;
}

function stripMathJaxAttrs(svg: string): string {
  return svg
    .replace(/ pLevel="[^"]*"/g, '')
    .replace(/ data-\w+(?:-\w+)*="[^"]*"/g, '');
}

const mathjax = MathjaxFactory({ inline: true, em: 11, ex: 5.5 });

export function MathFormula({ math, color, style }: MathFormulaProps) {
  const result = useMemo(() => {
    try {
      const res = mathjax.toSVG(math);
      if ('error' in res) return null;
      return {
        xml: stripMathJaxAttrs(res.svg),
        size: res.size,
      };
    } catch {
      return null;
    }
  }, [math]);

  if (!result) return null;

  return (
    <View style={[styles.wrapper, style]}>
      <SvgXml xml={result.xml} color={color} width={result.size.width} height={result.size.height} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { minHeight: 20, justifyContent: 'center' },
});
