import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Platform, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import type { Charge } from '@/domain/entities/Charge';
import { COULOMB_K } from '@/shared/constants';
import { formatCharge } from '@/shared/format';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface Graph3DProps {
  charges: Charge[];
  targetId: number;
  netForce: { x: number; y: number; z: number };
  sources: Charge[];
}

const W = 600;
const H = 440;
const P = 50;

function isoX(x: number, z: number): number {
  return (x - z) * 0.707;
}

function isoY(x: number, y: number, z: number): number {
  return -y + (x + z) * 0.408;
}

function formatNum(n: number, d = 3): string {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(d);
  return parseFloat(n.toFixed(d)).toString();
}

export function Graph3D({ charges, targetId, netForce, sources }: Graph3DProps) {
  const theme = usePhysicsTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredCharge, setHoveredCharge] = useState<{ id: number; sx: number; sy: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const target = charges.find(c => c.id === targetId);
  if (!target) return null;

  const cm = (v: number) => v * 100;
  const proj = (c: { x: number; y: number; z: number }) => ({
    px: isoX(cm(c.x), cm(c.z)),
    py: isoY(cm(c.x), cm(c.y), cm(c.z)),
  });

  const allP = charges.map(proj);
  const pxs = allP.map(p => p.px);
  const pys = allP.map(p => p.py);
  const pad = 6;
  let x0 = Math.min(...pxs) - pad;
  let x1 = Math.max(...pxs) + pad;
  let y0 = Math.min(...pys) - pad;
  let y1 = Math.max(...pys) + pad;
  const range = Math.max(x1 - x0, y1 - y0, 6);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  x0 = cx - range / 2;
  x1 = cx + range / 2;
  y0 = cy - range / 2;
  y1 = cy + range / 2;

  const plotW = W - 2 * P;
  const plotH = H - 2 * P;
  const sx = (v: number) => P + ((v - x0) / (x1 - x0)) * plotW;
  const sy = (v: number) => H - P - ((v - y0) / (y1 - y0)) * plotH;

  const targetProj = proj(target);
  const tx = sx(targetProj.px);
  const ty = sy(targetProj.py);

  const maxF = Math.max(
    ...sources.map(s => {
      const dx = target.x - s.x;
      const dy = target.y - s.y;
      const dz = target.z - s.z;
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      return r === 0 ? 0 : COULOMB_K * Math.abs(s.q * target.q) / (r * r);
    }),
    1e-15,
  );
  const targetArrowLen = Math.min(plotW, plotH) * 0.2;
  const FS = maxF > 0 ? targetArrowLen / maxF : 1;

  const axisColor = theme.textSecondary;
  const isDark = theme.text === '#ffffff';

  const svgW = containerWidth || W;
  const graphH = H;
  const adjustedAspect = W / graphH;
  const displayW = Math.min(svgW, Platform.OS === 'web' ? 600 : svgW);
  const displayH = displayW / adjustedAspect;

  const arrowEnd = (fx: number, fy: number, fz: number) => {
    const endCmX = cm(target.x) + fx * FS * (x1 - x0) / plotW;
    const endCmY = cm(target.y) + fy * FS * (y1 - y0) / plotH;
    const endCmZ = cm(target.z) + fz * FS * (x1 - x0) / plotW;
    return {
      x2: sx(isoX(endCmX, endCmZ)),
      y2: sy(isoY(endCmX, endCmY, endCmZ)),
    };
  };

  return (
    <View onLayout={onLayout} style={{ width: '100%', alignItems: 'center' }}>
      <Svg width={displayW} height={displayH} viewBox={`0 0 ${W} ${H}`}>
        <G>
          <Line x1={P - 8} y1={H - P} x2={W - P + 18} y2={H - P}
            stroke={axisColor + '60'} strokeWidth={1.2} />
          <SvgText x={W - P + 6} y={H - P - 6} fill={axisColor} fontSize={14} fontWeight="700" opacity={0.7}>x</SvgText>
          <Line x1={P} y1={H - P + 8} x2={P} y2={P - 18}
            stroke={axisColor + '60'} strokeWidth={1.2} />
          <SvgText x={P - 6} y={P - 22} fill={axisColor} fontSize={14} fontWeight="700" opacity={0.7}>y</SvgText>
          <Line x1={P} y1={H - P} x2={P - 30} y2={H - P + 28}
            stroke={axisColor + '50'} strokeWidth={1} strokeDasharray="4,3" />
          <SvgText x={P - 34} y={H - P + 24} fill={axisColor} fontSize={14} fontWeight="700" opacity={0.7}>z</SvgText>

          <SvgText x={W / 2} y={P / 2 + 4} textAnchor="middle" fill={axisColor} fontSize={12} fontWeight="600" opacity={0.5}>
            Vista 3D — proyección isométrica
          </SvgText>

          {charges.map(c => {
            const { px, py } = proj(c);
            const cx = sx(px);
            const cy = sy(py);
            const isT = c.id === target.id;
            const chargeColor = c.q >= 0 ? theme.positive : theme.negative;
            const isHovered = hoveredCharge?.id === c.id;
            return (
              <G key={c.id}>
                <Line x1={sx(isoX(cm(c.x), 0))} y1={sy(isoY(cm(c.x), 0, cm(c.z)))} x2={cx} y2={cy}
                  stroke={axisColor + '30'} strokeWidth={0.8} strokeDasharray="2,3" />
                <Line x1={sx(isoX(cm(c.x), cm(c.z)))} y1={sy(isoY(cm(c.x), cm(c.y), cm(c.z)))} x2={cx} y2={cy}
                  stroke={axisColor + '30'} strokeWidth={0.8} strokeDasharray="2,3" />
                {isT && (
                  <Circle cx={cx} cy={cy} r={22} fill="none" stroke={theme.netForce} strokeWidth={2} strokeDasharray="4,3" opacity={0.5} />
                )}
                <Circle cx={cx} cy={cy} r={isHovered ? 16 : 13} fill={chargeColor}
                  stroke={isDark ? '#fff' : '#000'} strokeWidth={isHovered ? 2.5 : 1.5}
                  {...({ onMouseEnter: () => setHoveredCharge({ id: c.id, sx: cx, sy: cy }), onMouseLeave: () => setHoveredCharge(null) } as any)}
                  style={{ cursor: 'pointer' }} />
                <SvgText x={cx} y={cy + 5} textAnchor="middle" fill="#fff" fontSize={16} fontWeight="800" alignmentBaseline="central">
                  {c.q >= 0 ? '+' : '−'}
                </SvgText>
                <SvgText x={cx} y={cy - 24} textAnchor="middle" fill={axisColor} fontSize={14} fontWeight="700">{c.label}</SvgText>
                <SvgText x={cx} y={cy + 34} textAnchor="middle" fill={chargeColor} fontSize={12} fontWeight="600">{formatCharge(c.q)}</SvgText>
                <SvgText x={cx} y={cy + 46} textAnchor="middle" fill={axisColor} fontSize={11} opacity={0.7}>
                  ({formatNum(cm(c.x))}cm, {formatNum(cm(c.y))}cm, {formatNum(cm(c.z))}cm)
                </SvgText>
                {isHovered && (
                  <G>
                    <Rect x={cx + 18} y={cy - 20} width={Platform.OS === 'web' ? 200 : 200} height={38} rx={6}
                      fill={isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'}
                      stroke={theme.border} strokeWidth={0.5} />
                    <SvgText x={cx + 26} y={cy - 3} fill={axisColor} fontSize={11} fontWeight="600">
                      {c.label}: {formatCharge(c.q)}
                    </SvgText>
                    <SvgText x={cx + 26} y={cy + 12} fill={axisColor} fontSize={11} opacity={0.7}>
                      ({formatNum(cm(c.x))}, {formatNum(cm(c.y))}, {formatNum(cm(c.z))}) cm
                    </SvgText>
                  </G>
                )}
              </G>
            );
          })}

          {sources.map(s => {
            const dx = target.x - s.x;
            const dy = target.y - s.y;
            const dz = target.z - s.z;
            const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (r === 0) return null;
            const Fm = COULOMB_K * Math.abs(s.q * target.q) / (r * r);
            const sg = s.q * target.q > 0 ? 1 : -1;
            const fx = sg * Fm * (dx / r);
            const fy = sg * Fm * (dy / r);
            const fz = sg * Fm * (dz / r);
            const end = arrowEnd(fx, fy, fz);
            return (
              <G key={s.id}>
                <Line x1={sx(isoX(cm(s.x), cm(s.z)))} y1={sy(isoY(cm(s.x), cm(s.y), cm(s.z)))} x2={tx} y2={ty}
                  stroke={theme.border} strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
                <Arrow3D x1={tx} y1={ty} x2={end.x2} y2={end.y2}
                  color={theme.componentColor} strokeWidth={2.5}
                  primary={`F${s.label.slice(1)}`} />
              </G>
            );
          })}

          {(() => {
            const end = arrowEnd(netForce.x, netForce.y, netForce.z);
            return (
              <Arrow3D x1={tx} y1={ty} x2={end.x2} y2={end.y2}
                color={theme.netForce} strokeWidth={4.5}
                primary={`Fneta`} />
            );
          })()}
        </G>
      </Svg>
    </View>
  );
}

interface Arrow3DProps {
  x1: number; y1: number; x2: number; y2: number;
  color: string; strokeWidth?: number;
  primary?: string;
}

function Arrow3D({ x1, y1, x2, y2, color, strokeWidth = 2, primary }: Arrow3DProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 6) return null;
  const ux = dx / len;
  const uy = dy / len;
  const headLen = Math.min(18, len * 0.35);
  const hl = headLen;
  const hw = headLen * 0.42;
  const labelOff = 16;
  const lx = x2 + ux * labelOff + (primary ? -uy * 14 : 0);
  const ly = y2 + uy * labelOff + (primary ? ux * 14 : 0);

  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" />
      <Polygon points={`${x2},${y2} ${x2 - hl * ux + hw * uy},${y2 - hl * uy - hw * ux} ${x2 - hl * ux - hw * uy},${y2 - hl * uy + hw * ux}`}
        fill={color} />
      {primary && (
        <SvgText x={lx} y={ly} fill={color} fontSize={13} fontWeight="700"
          textAnchor="start" opacity={0.95}>
          {primary}
        </SvgText>
      )}
    </G>
  );
}
