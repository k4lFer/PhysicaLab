// ============================================================
// Graph2D.tsx — Gráfica vectorial 2D interactiva (SVG)
// Capa: Presentación (componente de visualización de fuerzas)
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
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
const P = 60;
const LEGEND_H = 78;

function niceStep(range: number): number {
  const rough = range / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  if (norm < 1.5) return mag;
  if (norm < 3.5) return 2 * mag;
  if (norm < 7.5) return 5 * mag;
  return 10 * mag;
}

function computeTicks(min: number, max: number): number[] {
  const range = max - min;
  if (range === 0) return [min];
  const step = niceStep(range);
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.5; v += step) {
    if (v >= min - step * 0.5 && v <= max + step * 0.5) {
      ticks.push(Math.round(v * 100) / 100);
    }
  }
  return ticks;
}

export function Graph2D({ charges, targetId, netForce, sources }: Graph2DProps) {
  const theme = usePhysicsTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0, panX: 0, panY: 0 });
  const [hoveredCharge, setHoveredCharge] = useState<{ id: number; sx: number; sy: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const target = charges.find(c => c.id === targetId);
  if (!target) return null;

  const xs = charges.map(c => c.x * 100);
  const ys = charges.map(c => c.y * 100);
  const pad = 4;
  let x0 = Math.min(...xs) - pad;
  let x1 = Math.max(...xs) + pad;
  let y0 = Math.min(...ys) - pad;
  let y1 = Math.max(...ys) + pad;
  if (x1 - x0 < 4) { const m = (x0 + x1) / 2; x0 = m - 2; x1 = m + 2; }
  if (y1 - y0 < 4) { const m = (y0 + y1) / 2; y0 = m - 2; y1 = m + 2; }

  const sx = (x: number) => P + ((x - x0) / (x1 - x0)) * (W - 2 * P);
  const sy = (y: number) => H - P - LEGEND_H - ((y - y0) / (y1 - y0)) * (H - 2 * P - LEGEND_H);

  const maxF = Math.max(
    ...sources.map(s => {
      const dx = target.x - s.x;
      const dy = target.y - s.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      return r === 0 ? 0 : COULOMB_K * Math.abs(s.q * target.q) / (r * r);
    }),
    1e-15,
  );
  const plotW = W - 2 * P;
  const plotH = H - 2 * P - LEGEND_H;
  const targetArrowLen = Math.min(plotW, plotH) * 0.2;
  const FS = maxF > 0 ? targetArrowLen / maxF : 1;

  const xTicks = computeTicks(x0, x1);
  const yTicks = computeTicks(y0, y1);

  const tx = sx(target.x * 100);
  const ty = sy(target.y * 100);

  const axisColor = theme.textSecondary;
  const svgW = containerWidth || W;
  const graphH = H - LEGEND_H;
  const adjustedAspect = W / graphH;
  const displayW = Math.min(svgW, Platform.OS === 'web' ? 600 : svgW);
  const displayH = displayW / adjustedAspect;

  const originSvgX = sx(0);
  const originSvgY = sy(0);
  const showOrigin = 0 >= x0 && 0 <= x1 && 0 >= y0 && 0 <= y1;

  const viewRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !viewRef.current) return;
    const el = viewRef.current as unknown as HTMLElement;

    const onWheel = (e: WheelEvent) => {
      const factor = e.deltaY > 0 ? 0.88 : 1 / 0.88;
      setScale(prev => Math.max(0.3, Math.min(5, prev * factor)));
      e.preventDefault();
    };

    const onMouseDown = (e: MouseEvent) => {
      dragRef.current.active = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      dragRef.current.panX = pan.x;
      dragRef.current.panY = pan.y;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current.active) {
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
      }
    };

    const onMouseUp = () => { dragRef.current.active = false; };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragRef.current.active = true;
        dragRef.current.lastX = e.touches[0].clientX;
        dragRef.current.lastY = e.touches[0].clientY;
        dragRef.current.panX = pan.x;
        dragRef.current.panY = pan.y;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current.active && e.touches.length === 1) {
        const dx = e.touches[0].clientX - dragRef.current.lastX;
        const dy = e.touches[0].clientY - dragRef.current.lastY;
        setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
      }
    };

    const onTouchEnd = () => { dragRef.current.active = false; };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [pan]);

  const isDark = theme.background === '#08080f';
  const netMag = Math.sqrt(netForce.x ** 2 + netForce.y ** 2 + netForce.z ** 2);

  const zoomIn = () => setScale(prev => Math.min(5, prev * 1.25));
  const zoomOut = () => setScale(prev => Math.max(0.3, prev / 1.25));
  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  return (
    <View ref={viewRef} onLayout={onLayout} style={{ width: '100%', alignItems: 'center' }}>
      <Svg width={displayW} height={displayH} viewBox={`0 0 ${W} ${H}`}>
        <G transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          {xTicks.map(t => {
            const gx = sx(t);
            return (
              <Line key={`gx${t}`} x1={gx} y1={P} x2={gx} y2={H - LEGEND_H - P}
                stroke={theme.border} strokeWidth={0.5} opacity={0.6} />
            );
          })}
          {yTicks.map(t => {
            const gy = sy(t);
            return (
              <Line key={`gy${t}`} x1={P} y1={gy} x2={W - P} y2={gy}
                stroke={theme.border} strokeWidth={0.5} opacity={0.6} />
            );
          })}

          {showOrigin && (
            <>
              <Line x1={originSvgX - 10} y1={originSvgY} x2={originSvgX + 10} y2={originSvgY}
                stroke={axisColor + '90'} strokeWidth={1} />
              <Line x1={originSvgX} y1={originSvgY - 10} x2={originSvgX} y2={originSvgY + 10}
                stroke={axisColor + '90'} strokeWidth={1} />
            </>
          )}

          <Line x1={P - 8} y1={H - LEGEND_H - P} x2={W - P + 18} y2={H - LEGEND_H - P}
            stroke={axisColor + '80'} strokeWidth={1.8} />
          <Line x1={P} y1={H - LEGEND_H - P + 8} x2={P} y2={P - 18}
            stroke={axisColor + '80'} strokeWidth={1.8} />

          {xTicks.map(t => {
            if (t === 0) return null;
            const gx = sx(t);
            return (
              <G key={`tx${t}`}>
                <Line x1={gx} y1={H - LEGEND_H - P - 4} x2={gx} y2={H - LEGEND_H - P + 4}
                  stroke={axisColor + '80'} strokeWidth={1.2} />
                <SvgText x={gx} y={H - LEGEND_H - P + 18} textAnchor="middle" fill={axisColor}
                  fontSize={12} fontWeight="500">{t}</SvgText>
              </G>
            );
          })}
          {yTicks.map(t => {
            if (t === 0) return null;
            const gy = sy(t);
            return (
              <G key={`ty${t}`}>
                <Line x1={P - 4} y1={gy} x2={P + 4} y2={gy}
                  stroke={axisColor + '80'} strokeWidth={1.2} />
                <SvgText x={P - 10} y={gy + 4} textAnchor="end" fill={axisColor}
                  fontSize={12} fontWeight="500">{t}</SvgText>
              </G>
            );
          })}

          <SvgText x={W - P + 6} y={H - LEGEND_H - P - 8} fill={axisColor} fontSize={16} fontWeight="700">x (cm)</SvgText>
          <SvgText x={P - 4} y={P - 24} fill={axisColor} fontSize={16} fontWeight="700">y (cm)</SvgText>
          {showOrigin && (
            <SvgText x={originSvgX + 8} y={originSvgY + 18} fill={axisColor} fontSize={13} fontWeight="600" opacity={0.7}>O</SvgText>
          )}

          {charges.map(c => {
            const cx = sx(c.x * 100);
            const cy = sy(c.y * 100);
            const isT = c.id === target.id;
            const chargeColor = c.q >= 0 ? theme.positive : theme.negative;
            const isHovered = hoveredCharge?.id === c.id;
            return (
              <G key={c.id}>
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
                  ({c.x * 100}cm, {c.y * 100}cm)
                </SvgText>
                {isHovered && (
                  <G>
                    <Rect x={cx + 18} y={cy - 20} width={170} height={38} rx={6}
                      fill={isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'}
                      stroke={theme.border} strokeWidth={0.5} />
                    <SvgText x={cx + 26} y={cy - 3} fill={axisColor} fontSize={11} fontWeight="600">
                      {c.label}: {formatCharge(c.q)}
                    </SvgText>
                    <SvgText x={cx + 26} y={cy + 12} fill={axisColor} fontSize={11} opacity={0.7}>
                      ({c.x * 100}cm, {c.y * 100}cm)
                    </SvgText>
                  </G>
                )}
              </G>
            );
          })}

          {sources.map(s => {
            const dx = target.x - s.x;
            const dy = target.y - s.y;
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r === 0) return null;
            const Fm = COULOMB_K * Math.abs(s.q * target.q) / (r * r);
            const sg = s.q * target.q > 0 ? 1 : -1;
            const fx = sg * Fm * (dx / r) * FS;
            const fy = sg * Fm * (dy / r) * FS;
            return (
              <G key={s.id}>
                <Line x1={sx(s.x * 100)} y1={sy(s.y * 100)} x2={tx} y2={ty}
                  stroke={theme.border} strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
                <Arrow2D x1={tx} y1={ty} x2={tx + fx} y2={ty - fy}
                  color={theme.componentColor} strokeWidth={2.5}
                  primary={`F${s.label.slice(1)}`} />
              </G>
            );
          })}

          <Arrow2D x1={tx} y1={ty} x2={tx + netForce.x * FS} y2={ty - netForce.y * FS}
            color={theme.netForce} strokeWidth={4.5}
            primary={`Fneta`} />
        </G>

        <Rect x={0} y={H - LEGEND_H} width={W} height={LEGEND_H} rx={0}
          fill={isDark ? '#1a1a2e' : '#f8f9ff'} stroke={theme.border} strokeWidth={1} />
        <SvgText x={16} y={H - LEGEND_H + 20} fill={axisColor} fontSize={13} fontWeight="700">
          F = k·|q₁|·|q₂| / r²  ·  r̂
        </SvgText>
        <Circle cx={16} cy={H - LEGEND_H + 40} r={6} fill={theme.positive} />
        <SvgText x={28} y={H - LEGEND_H + 45} fill={axisColor} fontSize={12} fontWeight="500">Positiva</SvgText>
        <Circle cx={100} cy={H - LEGEND_H + 40} r={6} fill={theme.negative} />
        <SvgText x={112} y={H - LEGEND_H + 45} fill={axisColor} fontSize={12} fontWeight="500">Negativa</SvgText>
        <Circle cx={170} cy={H - LEGEND_H + 40} r={6} fill="none" stroke={theme.netForce} strokeWidth={2} strokeDasharray="4,3" />
        <SvgText x={182} y={H - LEGEND_H + 45} fill={axisColor} fontSize={12} fontWeight="500">Objetivo</SvgText>
        <Line x1={260} y1={H - LEGEND_H + 40} x2={286} y2={H - LEGEND_H + 40} stroke={theme.netForce} strokeWidth={3.5} />
        <SvgText x={292} y={H - LEGEND_H + 45} fill={axisColor} fontSize={12} fontWeight="500">Fneta</SvgText>
        <Line x1={360} y1={H - LEGEND_H + 40} x2={386} y2={H - LEGEND_H + 40} stroke={theme.componentColor} strokeWidth={2.5} />
        <SvgText x={392} y={H - LEGEND_H + 45} fill={axisColor} fontSize={12} fontWeight="500">F</SvgText>
      </Svg>

      <View style={styles.zoomControls}>
        <Pressable onPress={zoomIn} style={[styles.zoomBtn, { backgroundColor: theme.backgroundElement + 'e0', borderColor: theme.border }]}>
          <Text style={[styles.zoomText, { color: theme.text }]}>+</Text>
        </Pressable>
        <Pressable onPress={zoomOut} style={[styles.zoomBtn, { backgroundColor: theme.backgroundElement + 'e0', borderColor: theme.border }]}>
          <Text style={[styles.zoomText, { color: theme.text }]}>−</Text>
        </Pressable>
        <Pressable onPress={resetView} style={[styles.zoomBtn, { backgroundColor: theme.backgroundElement + 'e0', borderColor: theme.border }]}>
          <Text style={[styles.zoomText, { fontSize: 11, color: theme.text }]}>↺</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface Arrow2DProps {
  x1: number; y1: number; x2: number; y2: number;
  color: string; strokeWidth?: number;
  primary?: string; sub?: string; tag?: string;
}

function Arrow2D({ x1, y1, x2, y2, color, strokeWidth = 2, primary, sub, tag }: Arrow2DProps) {
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
      {sub && (
        <SvgText x={lx} y={ly + 15} fill={color} fontSize={11}
          fontWeight="500" textAnchor="start" opacity={0.8}>
          {sub}
        </SvgText>
      )}
      {tag && (
        <SvgText x={lx} y={ly + 28} fill={color} fontSize={10}
          fontWeight="400" textAnchor="start" opacity={0.6}>
          {tag}
        </SvgText>
      )}
    </G>
  );
}

const styles = StyleSheet.create({
  zoomControls: {
    position: 'absolute',
    bottom: 86,
    right: 8,
    gap: 4,
    alignItems: 'center',
  },
  zoomBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  zoomText: { fontSize: 18, fontWeight: '700' },
});
