import type { Charge } from '../entities/Charge';
import { chargeToVector3, chargeSign } from '../entities/Charge';
import type { Vector3 } from '../entities/Vector3';
import { vec3Sub, vec3Mag, vec3Normalize, vec3Scale, vec3Add } from '../entities/Vector3';

const COULOMB_K = 8.988e9;

export interface CoulombStep {
  type: 'header' | 'div' | 'formula' | 'result' | 'error';
  text?: string;
  lbl?: string;
  val?: string;
}

export interface CoulombResult {
  steps: CoulombStep[];
  netForce: Vector3;
  magnitude: number;
  angleDeg: number;
  anglePhiDeg: number | null;
  target: Charge;
  sources: Charge[];
}

function qLatex(q: number): string {
  const nC = Math.abs(q * 1e9);
  const s = q >= 0 ? '' : '-';
  return `${s}${formatNum(nC, 3)}\\;\\mathrm{nC}`;
}

function formatCoulomb(q: number): string {
  const nC = q * 1e9;
  return `${nC >= 0 ? '+' : ''}${formatNum(nC, 3)} nC`;
}

function formatDist(m: number): string {
  return `${formatNum(m * 100, 4)} cm`;
}

function formatNum(n: number, d = 3): string {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(d);
  return parseFloat(n.toFixed(d)).toString();
}

function unitLatex(v: Vector3, is3D: boolean): string {
  const x = formatNum(v.x, 4);
  const y = formatNum(v.y, 4);
  const s = `(${x}\\hat{x} + ${y}\\hat{y}`;
  if (!is3D) return s + ')';
  return s + ` + ${formatNum(v.z, 4)}\\hat{z})`;
}

function shortLabel(label: string): string {
  return label.replace(/^q/, '');
}

export function calculateCoulombForce(
  charges: Charge[],
  targetId: number,
  mode: '2D' | '3D'
): CoulombResult | null {
  const target = charges.find(c => c.id === targetId);
  if (!target) return null;

  const is3D = mode === '3D';
  const sources = charges.filter(c => c.id !== targetId);
  const steps: CoulombStep[] = [];
  let netForce: Vector3 = { x: 0, y: 0, z: 0 };

  const tgtShort = shortLabel(target.label);
  const targetPosStr = `(${formatDist(target.x)}, ${formatDist(target.y)}${is3D ? `, ${formatDist(target.z)}` : ''})`;

  steps.push({ type: 'header', text: `Modo: ${mode}  ·  k = 8.988 × 10⁹ N·m²/C²` });
  steps.push({
    type: 'header',
    text: `Objetivo: ${target.label} = ${formatCoulomb(target.q)}  en  ${targetPosStr}`,
  });

  steps.push({
    type: 'formula',
    lbl: 'Ley de Coulomb',
    val: `\\vec{F} = \\dfrac{k \\cdot |q_{1}| \\cdot |q_{2}|}{r^{2}} \\; \\hat{r}`,
  });

  sources.forEach((src, idx) => {
    const n = idx + 1;
    const dr = vec3Sub(chargeToVector3(target), chargeToVector3(src));
    const r = is3D ? vec3Mag(dr) : Math.sqrt(dr.x * dr.x + dr.y * dr.y);

    const srcShort = shortLabel(src.label);
    const pairLabel = `${srcShort}${tgtShort}`;

    steps.push({ type: 'div', text: `── Paso ${n}:  ${src.label} → ${target.label} ──` });

    if (r === 0) {
      steps.push({ type: 'error', text: `⚠ ${src.label} y ${target.label} están en la misma posición (r = 0)` });
      return;
    }

    const srcPosStr = `(${formatDist(src.x)}, ${formatDist(src.y)}${is3D ? `, ${formatDist(src.z)}` : ''})`;
    const rCm = formatNum(r * 100, 4);
    const rM = formatNum(r, 4);

    const dxCm = formatNum(dr.x * 100, 1);
    const dyCm = formatNum(dr.y * 100, 1);
    const dzCm = is3D ? formatNum(dr.z * 100, 1) : '';

    const drLatex = is3D
      ? `(${dxCm}\\hat{x} + ${dyCm}\\hat{y} + ${dzCm}\\hat{z})\\;\\mathrm{cm}`
      : `(${dxCm}\\hat{x} + ${dyCm}\\hat{y})\\;\\mathrm{cm}`;

    const rSqExpr = is3D
      ? `(${dxCm})^{2} + (${dyCm})^{2} + (${dzCm})^{2}`
      : `(${dxCm})^{2} + (${dyCm})^{2}`;

    steps.push({
      type: 'formula',
      lbl: `${n}.1  Δr`,
      val: `\\Delta\\mathbf{r}_{${pairLabel}} = \\mathbf{r}_{${tgtShort}} - \\mathbf{r}_{${srcShort}} = ${drLatex}`,
    });

    steps.push({
      type: 'formula',
      lbl: `${n}.2  r`,
      val: `r_{${pairLabel}} = |\\Delta\\mathbf{r}_{${pairLabel}}| = \\sqrt{${rSqExpr}} = ${rCm}\\;\\mathrm{cm}`,
    });

    const dir = vec3Normalize(is3D ? dr : { x: dr.x, y: dr.y, z: 0 });
    const unitStr = unitLatex(dir, is3D);

    const dLatex = is3D
      ? `(${formatNum(dr.x * 100, 1)}\\hat{x} + ${formatNum(dr.y * 100, 1)}\\hat{y} + ${formatNum(dr.z * 100, 1)}\\hat{z})\\;\\mathrm{cm}`
      : `(${formatNum(dr.x * 100, 1)}\\hat{x} + ${formatNum(dr.y * 100, 1)}\\hat{y})\\;\\mathrm{cm}`;

    steps.push({
      type: 'formula',
      lbl: `${n}.3  r̂`,
      val: `\\hat{r}_{${pairLabel}} = \\dfrac{\\Delta\\mathbf{r}_{${pairLabel}}}{r_{${pairLabel}}} = \\dfrac{${dLatex}}{${rCm}\\;\\mathrm{cm}} = ${unitStr}`,
    });

    const signProd = chargeSign(src) * chargeSign(target);
    const kind = signProd > 0 ? 'Repulsiva' : 'Atractiva';

    const signSymbolSrc = chargeSign(src) > 0 ? '+' : '-';
    const signSymbolTgt = chargeSign(target) > 0 ? '+' : '-';

    steps.push({
      type: 'formula',
      lbl: `${n}.4  Signos`,
      val: `q_{${srcShort}} \\cdot q_{${tgtShort}} = (${signSymbolSrc}) \\cdot (${signSymbolTgt}) ${signProd > 0 ? '>' : '<'} 0  \\;\\Longrightarrow\\;  \\text{${kind}}`,
    });

    const forceMag = COULOMB_K * Math.abs(src.q * target.q) / (r * r);
    const sign = signProd > 0 ? 1 : -1;
    const forceVec = vec3Scale(dir, sign * forceMag);

    netForce = vec3Add(netForce, forceVec);

    const q1L = qLatex(src.q);
    const q2L = qLatex(target.q);
    const fMagStr = formatNum(forceMag * 1e6, 4);

    const forceLabel = `\\vec{F}_{${srcShort}\\to${tgtShort}}`;

    steps.push({
      type: 'formula',
      lbl: `${n}.5  |F|`,
      val: `|${forceLabel}| = \\dfrac{k \\cdot |${q1L}| \\cdot |${q2L}|}{r_{${pairLabel}}^{2}}`,
    });

    steps.push({
      type: 'result',
      lbl: '=',
      val: `${fMagStr}\\;\\mu\\mathrm{N}  \\quad (\\text{${signProd > 0 ? 'repulsiva' : 'atractiva'}})`,

    });

    const compStr = is3D
      ? `(${formatNum(forceVec.x * 1e6, 3)}\\hat{x} + ${formatNum(forceVec.y * 1e6, 3)}\\hat{y} + ${formatNum(forceVec.z * 1e6, 3)}\\hat{z})\\;\\mu\\mathrm{N}`
      : `(${formatNum(forceVec.x * 1e6, 3)}\\hat{x} + ${formatNum(forceVec.y * 1e6, 3)}\\hat{y})\\;\\mu\\mathrm{N}`;

    const dirLabel = sign > 0 ? `+\\hat{r}_{${pairLabel}}` : `-\\hat{r}_{${pairLabel}}`;

    steps.push({
      type: 'formula',
      lbl: `${n}.6  Componentes`,
      val: `${forceLabel} = ${fMagStr}\\;\\mu\\mathrm{N} \\cdot (${dirLabel}) = ${compStr}`,
    });
  });

  const mag = vec3Mag(netForce);
  const theta = (Math.atan2(netForce.y, netForce.x) * 180) / Math.PI;
  const phi = is3D ? (Math.atan2(netForce.z, Math.sqrt(netForce.x * netForce.x + netForce.y * netForce.y)) * 180) / Math.PI : null;

  steps.push({ type: 'div', text: '── Superposición vectorial  ∑ Fᵢ ──' });

  const fxStr = formatNum(netForce.x * 1e6, 3);
  const fyStr = formatNum(netForce.y * 1e6, 3);

  steps.push({
    type: 'formula',
    lbl: 'F_x neta',
    val: `F_{x\\text{neta}} = \\sum F_{xi} = ${fxStr}\\;\\mu\\mathrm{N}`,
  });

  steps.push({
    type: 'formula',
    lbl: 'F_y neta',
    val: `F_{y\\text{neta}} = \\sum F_{yi} = ${fyStr}\\;\\mu\\mathrm{N}`,
  });

  if (is3D) {
    const fzStr = formatNum(netForce.z * 1e6, 3);
    steps.push({
      type: 'formula',
      lbl: 'F_z neta',
      val: `F_{z\\text{neta}} = \\sum F_{zi} = ${fzStr}\\;\\mu\\mathrm{N}`,
    });
  }

  const netStr = is3D
    ? `(${formatNum(netForce.x * 1e6, 3)}\\hat{x} + ${formatNum(netForce.y * 1e6, 3)}\\hat{y} + ${formatNum(netForce.z * 1e6, 3)}\\hat{z})\\;\\mu\\mathrm{N}`
    : `(${formatNum(netForce.x * 1e6, 3)}\\hat{x} + ${formatNum(netForce.y * 1e6, 3)}\\hat{y})\\;\\mu\\mathrm{N}`;

  steps.push({
    type: 'formula',
    lbl: '∑ Fᵢ =',
    val: netStr,
  });

  const rSqExpr = is3D
    ? `(${fxStr})^{2} + (${fyStr})^{2} + (${formatNum(netForce.z * 1e6, 3)})^{2}`
    : `(${fxStr})^{2} + (${fyStr})^{2}`;

  steps.push({
    type: 'formula',
    lbl: '|F_neta|',
    val: `|\\mathbf{F}_{\\text{neta}}| = \\sqrt{${rSqExpr}} = ${formatNum(mag * 1e6, 4)}\\;\\mu\\mathrm{N}`,
  });

  steps.push({
    type: 'result',
    lbl: 'Resultado',
    val: `${formatNum(mag * 1e6, 4)}\\;\\mu\\mathrm{N}`,
  });

  steps.push({
    type: 'formula',
    lbl: 'Dirección θ',
    val: `\\theta = \\arctan\\!\\left(\\frac{F_{y\\text{neta}}}{F_{x\\text{neta}}}\\right) = \\arctan\\!\\left(\\frac{${fyStr}}{${fxStr}}\\right) = ${formatNum(theta, 2)}^{\\circ} \\; (\\text{respecto a } +x)`,
  });

  if (phi !== null) {
    const fzStr = formatNum(netForce.z * 1e6, 3);
    const fxySq = `\\sqrt{F_{x\\text{neta}}^{2}+F_{y\\text{neta}}^{2}}`;
    const fxyNum = `\\sqrt{(${fxStr})^{2}+(${fyStr})^{2}}`;
    steps.push({
      type: 'formula',
      lbl: 'Dirección φ',
      val: `\\phi = \\arctan\\!\\left(\\frac{F_{z\\text{neta}}}{${fxySq}}\\right) = \\arctan\\!\\left(\\frac{${fzStr}}{${fxyNum}}\\right) = ${formatNum(phi, 2)}^{\\circ} \\; (\\text{respecto a } xy)`,
    });
  }

  const quadLabel = (() => {
    if (netForce.x >= 0 && netForce.y >= 0) return '\\text{Primer cuadrante }(+x,\\,+y)';
    if (netForce.x < 0 && netForce.y >= 0) return '\\text{Segundo cuadrante }(-x,\\,+y)';
    if (netForce.x < 0 && netForce.y < 0) return '\\text{Tercer cuadrante }(-x,\\,-y)';
    return '\\text{Cuarto cuadrante }(+x,\\,-y)';
  })();

  steps.push({
    type: 'formula',
    lbl: 'Cuadrante',
    val: quadLabel,
  });

  return { steps, netForce, magnitude: mag, angleDeg: theta, anglePhiDeg: phi, target, sources };
}
