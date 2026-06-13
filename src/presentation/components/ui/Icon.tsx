import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

type IconName = 'atom' | 'lightning' | 'sun' | 'moon' | 'plus' | 'x' | 'calc' | 'chevron-right' | 'check' | 'home' | 'info' | 'menu' | 'graph' | 'book' | 'github' | 'layers' | 'compass' | 'target';

const PATHS: Record<IconName, { viewBox: string; paths: string[]; circles?: { cx: number; cy: number; r: number }[]; rects?: { x: number; y: number; w: number; h: number; rx?: number }[]; ellipses?: { cx: number; cy: number; rx: number; ry: number; rot?: number }[] }> = {
  atom: {
    viewBox: '0 0 24 24',
    circles: [{ cx: 12, cy: 12, r: 3 }],
    ellipses: [
      { cx: 12, cy: 12, rx: 10, ry: 4, rot: 30 },
      { cx: 12, cy: 12, rx: 10, ry: 4, rot: -30 },
      { cx: 12, cy: 12, rx: 10, ry: 4, rot: 90 },
    ],
    paths: [],
  },
  lightning: { viewBox: '0 0 24 24', paths: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'] },
  sun: { viewBox: '0 0 24 24', circles: [{ cx: 12, cy: 12, r: 5 }], paths: ['M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'] },
  moon: { viewBox: '0 0 24 24', paths: ['M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'] },
  plus: { viewBox: '0 0 24 24', paths: ['M12 5v14M5 12h14'] },
  x: { viewBox: '0 0 24 24', paths: ['M18 6L6 18M6 6l12 12'] },
  calc: { viewBox: '0 0 24 24', rects: [{ x: 4, y: 2, w: 16, h: 20, rx: 2 }], paths: ['M8 6h8M8 10h8M8 14h4M8 18h4'] },
  'chevron-right': { viewBox: '0 0 24 24', paths: ['M9 18l6-6-6-6'] },
  check: { viewBox: '0 0 24 24', paths: ['M20 6L9 17l-5-5'] },
  home: { viewBox: '0 0 24 24', paths: ['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10'] },
  info: { viewBox: '0 0 24 24', circles: [{ cx: 12, cy: 12, r: 10 }], paths: ['M12 16v-4M12 8h.01'] },
  menu: { viewBox: '0 0 24 24', paths: ['M3 12h18M3 6h18M3 18h18'] },
  graph: { viewBox: '0 0 24 24', paths: ['M3 3v18h18', 'M7 16l4-8 4 4 4-6'] },
  book: { viewBox: '0 0 24 24', paths: ['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'] },
  github: { viewBox: '0 0 24 24', paths: ['M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z'] },
  layers: { viewBox: '0 0 24 24', paths: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'] },
  compass: { viewBox: '0 0 24 24', circles: [{ cx: 12, cy: 12, r: 10 }], paths: ['M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z'] },
  target: { viewBox: '0 0 24 24', circles: [{ cx: 12, cy: 12, r: 3 }, { cx: 12, cy: 12, r: 8 }, { cx: 12, cy: 12, r: 11 }], paths: [] },
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = '#8888a8' }: IconProps) {
  const icon = PATHS[name];
  if (!icon) return null;
  return (
    <Svg width={size} height={size} viewBox={icon.viewBox} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <G>
        {icon.paths.map((d, i) => <Path key={i} d={d} />)}
        {icon.circles?.map((c, i) => <Circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} />)}
        {icon.rects?.map((r, i) => <Rect key={`r${i}`} x={r.x} y={r.y} width={r.w} height={r.h} rx={r.rx ?? 0} />)}
        {icon.ellipses?.map((e, i) => (
          <Ellipse
            key={`e${i}`}
            cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry}
            transform={`rotate(${e.rot ?? 0} ${e.cx} ${e.cy})`}
          />
        ))}
      </G>
    </Svg>
  );
}
