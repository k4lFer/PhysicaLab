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

const SUBSCRIPT = '₀₁₂₃₄₅₆₇₈₉';
function tsub(n: number): string {
  return String(n).split('').map(d => SUBSCRIPT[+d]).join('');
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

  steps.push({ type: 'header', text: `Modo: ${mode}  ·  k = 8.988 × 10⁹ N·m²/C²` });
  steps.push({
    type: 'header',
    text: `Objetivo: ${target.label} = ${formatCoulomb(target.q)}  en  (${formatDist(target.x)}, ${formatDist(target.y)}${is3D ? `, ${formatDist(target.z)}` : ''})`,
  });

  sources.forEach((src, idx) => {
    const n = idx + 1;
    const dr = vec3Sub(chargeToVector3(target), chargeToVector3(src));
    const r = is3D ? vec3Mag(dr) : Math.sqrt(dr.x * dr.x + dr.y * dr.y);
    const dz = is3D ? dr.z : 0;

    steps.push({ type: 'div', text: `── Paso ${n}: ${src.label} → ${target.label} ──` });

    if (r === 0) {
      steps.push({ type: 'error', text: `⚠ ${src.label} y ${target.label} superpuestos` });
      return;
    }

    const dir = vec3Normalize(is3D ? dr : { x: dr.x, y: dr.y, z: 0 });
    const forceMag = COULOMB_K * Math.abs(src.q * target.q) / (r * r);
    const sign = chargeSign(src) * chargeSign(target) > 0 ? 1 : -1;
    const kind = sign > 0 ? 'Repulsiva ↔' : 'Atractiva ↗';
    const forceVec = vec3Scale(dir, sign * forceMag);

    netForce = vec3Add(netForce, forceVec);

    const dStr = is3D
      ? `(${formatDist(dr.x)}, ${formatDist(dr.y)}, ${formatDist(dr.z)})`
      : `(${formatDist(dr.x)}, ${formatDist(dr.y)})`;
    const rStr = is3D
      ? `√(Δx²+Δy²+Δz²) = ${formatNum(r * 100, 4)} cm`
      : `√(Δx²+Δy²) = ${formatNum(r * 100, 4)} cm`;
    const dirStr = is3D
      ? `(${formatNum(dir.x, 4)}, ${formatNum(dir.y, 4)}, ${formatNum(dir.z, 4)})`
      : `(${formatNum(dir.x, 4)}, ${formatNum(dir.y, 4)})`;
    const compStr = is3D
      ? `(${formatNum(forceVec.x * 1e6, 3)} x̂ + ${formatNum(forceVec.y * 1e6, 3)} ŷ + ${formatNum(forceVec.z * 1e6, 3)} ẑ) µN`
      : `(${formatNum(forceVec.x * 1e6, 3)} x̂ + ${formatNum(forceVec.y * 1e6, 3)} ŷ) µN`;

    steps.push({ type: 'formula', lbl: `${n}.1  Δr`, val: dStr });
    steps.push({ type: 'formula', lbl: `${n}.2  |r|`, val: rStr });
    steps.push({ type: 'formula', lbl: `${n}.3  r̂`, val: dirStr });
    steps.push({
      type: 'formula',
      lbl: `${n}.4  |F|`,
      val: `k·|${formatCoulomb(src.q)}|·|${formatCoulomb(target.q)}|/r² = ${formatNum(forceMag * 1e6, 4)} µN  [${kind}]`,
    });
    steps.push({ type: 'formula', lbl: `${n}.5  Componentes`, val: compStr });
  });

  const mag = vec3Mag(netForce);
  const theta = (Math.atan2(netForce.y, netForce.x) * 180) / Math.PI;
  const phi = is3D ? (Math.atan2(netForce.z, Math.sqrt(netForce.x * netForce.x + netForce.y * netForce.y)) * 180) / Math.PI : null;

  steps.push({ type: 'div', text: '── Superposición vectorial  ∑ Fᵢ ──' });
  const netStr = is3D
    ? `(${formatNum(netForce.x * 1e6, 3)} x̂ + ${formatNum(netForce.y * 1e6, 3)} ŷ + ${formatNum(netForce.z * 1e6, 3)} ẑ) µN`
    : `(${formatNum(netForce.x * 1e6, 3)} x̂ + ${formatNum(netForce.y * 1e6, 3)} ŷ) µN`;
  steps.push({ type: 'formula', lbl: 'F_neta', val: netStr });
  steps.push({ type: 'result', lbl: '|F_neta|', val: `${formatNum(mag * 1e6, 4)} µN` });
  steps.push({
    type: 'result',
    lbl: 'Dirección',
    val: `θ = ${formatNum(theta, 2)}°${phi !== null ? `  ·  φ = ${formatNum(phi, 2)}°` : ''}`,
  });

  return { steps, netForce, magnitude: mag, angleDeg: theta, anglePhiDeg: phi, target, sources };
}
