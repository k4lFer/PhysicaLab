import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Platform, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { Charge } from '@/domain/entities/Charge';
import { COULOMB_K } from '@/shared/constants';
import { formatCharge } from '@/shared/format';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface Graph2DProps {
  charges: Charge[];
  targetId: number;
  netForce: { x: number; y: number; z: number };
  sources: Charge[];
}

const W = 600;
const H = 550;
const P = 70;
const ASPECT = W / H;

export function Graph2D({ charges, targetId, netForce, sources }: Graph2DProps) {
  const theme = usePhysicsTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const target = charges.find(c => c.id === targetId);
  if (!target) return null;

  const xs = charges.map(c => c.x * 100);
  const ys = charges.map(c => c.y * 100);
  const x0 = Math.min(...xs) - 3;
  const x1 = Math.max(...xs) + 7;
  const y0 = Math.min(...ys) - 3;
  const y1 = Math.max(...ys) + 7;

  const sx = (x: number) => P + ((x - x0) / (x1 - x0)) * (W - 2 * P);
  const sy = (y: number) => H - P - ((y - y0) / (y1 - y0)) * (H - 2 * P);

  const maxF = Math.max(
    ...sources.map(s => {
      const dx = target.x - s.x;
      const dy = target.y - s.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      return r === 0 ? 0 : COULOMB_K * Math.abs(s.q * target.q) / (r * r);
    }),
    1e-15,
  );
  const FS = 100 / maxF;
  const tx = sx(target.x * 100);
  const ty = sy(target.y * 100);

  const axisColor = theme.textSecondary;
  const svgW = containerWidth || W;
  const svgH = svgW / ASPECT;

  const displayW = Math.min(svgW, Platform.OS === 'web' ? 600 : svgW);
  const displayH = displayW / ASPECT;

  return (
    <View onLayout={onLayout} style={{ width: '100%', alignItems: 'center' }}>
      <Svg width={displayW} height={displayH} viewBox={`0 0 ${W} ${H}`}>
        {[0, 1, 2, 3, 4].map(i => {
          const gx = P + (i / 4) * (W - 2 * P);
          const gy = P + (i / 4) * (H - 2 * P);
          return (
            <G key={i}>
              <Line x1={gx} y1={P} x2={gx} y2={H - P} stroke={theme.border} strokeWidth={1} />
              <Line x1={P} y1={gy} x2={W - P} y2={gy} stroke={theme.border} strokeWidth={1} />
            </G>
          );
        })}
        <Line x1={P - 6} y1={H - P} x2={W - P + 14} y2={H - P} stroke={axisColor + '60'} strokeWidth={1.5} />
        <Line x1={P} y1={H - P + 6} x2={P} y2={P - 14} stroke={axisColor + '60'} strokeWidth={1.5} />
        <SvgText x={W - P + 16} y={H - P + 6} fill={axisColor} fontSize={16} fontWeight="600">x</SvgText>
        <SvgText x={P - 6} y={P - 16} fill={axisColor} fontSize={16} fontWeight="600">y</SvgText>

        {sources.map(s => {
          const dx = target.x - s.x;
          const dy = target.y - s.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          if (r === 0) return null;
          const Fm = COULOMB_K * Math.abs(s.q * target.q) / (r * r);
          const sg = s.q * target.q > 0 ? 1 : -1;
          return (
            <Arrow2D key={s.id} x1={tx} y1={ty} x2={tx + sg * Fm * (dx / r) * FS} y2={ty - sg * Fm * (dy / r) * FS}
              color={theme.componentColor} label={`F(${s.label})`} />
          );
        })}

        <Arrow2D x1={tx} y1={ty} x2={tx + netForce.x * FS} y2={ty - netForce.y * FS}
          color={theme.netForce} strokeWidth={4} label="Fneta" />

        {charges.map(c => {
          const cx = sx(c.x * 100);
          const cy = sy(c.y * 100);
          const isT = c.id === target.id;
          const chargeColor = c.q >= 0 ? theme.positive : theme.negative;
          return (
            <G key={c.id}>
              {isT && (
                <Circle cx={cx} cy={cy} r={22} fill="none" stroke={theme.netForce} strokeWidth={2} strokeDasharray="4,3" opacity={0.5} />
              )}
              <Circle cx={cx} cy={cy} r={12} fill={chargeColor} />
              <SvgText x={cx} y={cy + 5} textAnchor="middle" fill="#fff" fontSize={15} fontWeight="700" alignmentBaseline="central">
                {c.q >= 0 ? '+' : '−'}
              </SvgText>
              <SvgText x={cx} y={cy - 22} textAnchor="middle" fill={axisColor} fontSize={13} fontWeight="600">{c.label}</SvgText>
              <SvgText x={cx} y={cy + 32} textAnchor="middle" fill={chargeColor} fontSize={11}>{formatCharge(c.q)}</SvgText>
            </G>
          );
        })}

        <Circle cx={P + 6} cy={32} r={7} fill={theme.positive} />
        <SvgText x={P + 18} y={37} fill={axisColor} fontSize={12}>positiva</SvgText>
        <Circle cx={P + 100} cy={32} r={7} fill={theme.negative} />
        <SvgText x={P + 112} y={37} fill={axisColor} fontSize={12}>negativa</SvgText>
        <Line x1={P + 200} y1={32} x2={P + 224} y2={32} stroke={theme.netForce} strokeWidth={3} />
        <SvgText x={P + 230} y={37} fill={axisColor} fontSize={12}>Fneta</SvgText>
        <Line x1={P + 290} y1={32} x2={P + 314} y2={32} stroke={theme.componentColor} strokeWidth={3} />
        <SvgText x={P + 320} y={37} fill={axisColor} fontSize={12}>Fᵢ</SvgText>
      </Svg>
    </View>
  );
}

interface Arrow2DProps {
  x1: number; y1: number; x2: number; y2: number;
  color: string; strokeWidth?: number; label?: string;
}

function Arrow2D({ x1, y1, x2, y2, color, strokeWidth = 2, label }: Arrow2DProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 6) return null;
  const ux = dx / len;
  const uy = dy / len;
  const a = 12;
  const ax = a * ux;
  const ay = a * uy;
  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeWidth} />
      <Polygon points={`${x2},${y2} ${x2 - ax + a * 0.4 * uy},${y2 - ay - a * 0.4 * ux} ${x2 - ax - a * 0.4 * uy},${y2 - ay + a * 0.4 * ux}`} fill={color} />
      {label && <SvgText x={x2 + 8} y={y2 - 8} fill={color} fontSize={13} fontWeight="600">{label}</SvgText>}
    </G>
  );
}
