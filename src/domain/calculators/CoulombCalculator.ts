// ============================================================
// CoulombCalculator.ts — Implementación de la Ley de Coulomb
// Capa: Dominio (reglas de negocio de la física)
// ============================================================

import type { Charge } from '../entities/Charge';
import { chargeToVector3, chargeSign } from '../entities/Charge';
import type { Vector3 } from '../entities/Vector3';
import { vec3Sub, vec3Mag, vec3Normalize, vec3Scale, vec3Add } from '../entities/Vector3';

// Constante de Coulomb: k = 8.988 × 10⁹ N·m²/C²
const COULOMB_K = 8.988e9;

// Cada paso del cálculo se representa con un tipo y contenido (texto, lbl, val)
export interface CoulombStep {
  type: 'header' | 'div' | 'formula' | 'result' | 'error';
  text?: string;
  lbl?: string;
  val?: string;
}

// Resultado completo: pasos (para mostrar), vector fuerza neta, magnitud, ángulos, cargas involucradas
export interface CoulombResult {
  steps: CoulombStep[];
  netForce: Vector3;
  magnitude: number;
  angleDeg: number;
  anglePhiDeg: number | null;
  target: Charge;
  sources: Charge[];
}

// Convierte carga a string LaTeX: ±X.XXX nC
function qLatex(q: number): string {
  const nC = Math.abs(q * 1e9);
  const s = q >= 0 ? '' : '-';
  return `${s}${formatNum(nC, 3)}\\;\\mathrm{nC}`;
}

// Formatea carga para mostrar: +X.XXX nC o -X.XXX nC
function formatCoulomb(q: number): string {
  const nC = q * 1e9;
  return `${nC >= 0 ? '+' : ''}${formatNum(nC, 3)} nC`;
}

// Formatea distancia de metros a centímetros
function formatDist(m: number): string {
  return `${formatNum(m * 100, 4)} cm`;
}

// Formatea número: notación fija o científica según magnitud
function formatNum(n: number, d = 3): string {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(d);
  return parseFloat(n.toFixed(d)).toString();
}

// Genera string LaTeX de vector unitario: (x̂ + ŷ) o (x̂ + ŷ + ẑ) según modo
function unitLatex(v: Vector3, is3D: boolean): string {
  const x = formatNum(v.x, 4);
  const y = formatNum(v.y, 4);
  const s = `(${x}\\hat{x} + ${y}\\hat{y}`;
  if (!is3D) return s + ')';
  return s + ` + ${formatNum(v.z, 4)}\\hat{z})`;
}

// Extrae el subíndice numérico de una etiqueta tipo "q₁" → "1"
function shortLabel(label: string): string {
  return label.replace(/^q/, '');
}

// ============================================================
// Función principal: calcula la fuerza neta sobre una carga
// Parámetros:
//   charges  → lista de todas las cargas del sistema
//   targetId → ID de la carga sobre la que se calcula la fuerza
//   mode     → '2D' (plano xy) o '3D' (espacio xyz)
// Retorna:
//   CoulombResult con pasos, vector neto, magnitud y ángulos
//   null si no se encuentra la carga objetivo
// ============================================================
export function calculateCoulombForce(
  charges: Charge[],
  targetId: number,
  mode: '2D' | '3D'
): CoulombResult | null {
  // Busca la carga objetivo; si no existe, retorna null
  const target = charges.find(c => c.id === targetId);
  if (!target) return null;

  const is3D = mode === '3D';
  const sources = charges.filter(c => c.id !== targetId); // todas las demás cargas son fuentes
  const steps: CoulombStep[] = [];
  let netForce: Vector3 = { x: 0, y: 0, z: 0 };            // acumulador de fuerza neta

  const tgtShort = shortLabel(target.label);
  const targetPosStr = `(${formatDist(target.x)}, ${formatDist(target.y)}${is3D ? `, ${formatDist(target.z)}` : ''})`;

  // Encabezados: modo, constante y datos del objetivo
  steps.push({ type: 'header', text: `Modo: ${mode}  ·  k = 8.988 × 10⁹ N·m²/C²` });
  steps.push({
    type: 'header',
    text: `Objetivo: ${target.label} = ${formatCoulomb(target.q)}  en  ${targetPosStr}`,
  });

  // Fórmula general de la Ley de Coulomb
  steps.push({
    type: 'formula',
    lbl: 'Ley de Coulomb',
    val: `\\vec{F} = \\dfrac{k \\cdot |q_{1}| \\cdot |q_{2}|}{r^{2}} \\; \\hat{r}`,
  });

  // Bucle: calcula la fuerza de cada fuente sobre el objetivo
  sources.forEach((src, idx) => {
    const n = idx + 1;
    // Vector desplazamiento desde la fuente hasta el objetivo
    const dr = vec3Sub(chargeToVector3(target), chargeToVector3(src));
    // Distancia: en 2D se ignoran las z
    const r = is3D ? vec3Mag(dr) : Math.sqrt(dr.x * dr.x + dr.y * dr.y);

    const srcShort = shortLabel(src.label);
    const pairLabel = `${srcShort}${tgtShort}`;

    steps.push({ type: 'div', text: `── Paso ${n}:  ${src.label} → ${target.label} ──` });

    // Validación: no puede haber dos cargas en la misma posición
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

    // Paso 1: vector desplazamiento Δr en cm
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

    // Paso 2: distancia r = |Δr|
    steps.push({
      type: 'formula',
      lbl: `${n}.2  r`,
      val: `r_{${pairLabel}} = |\\Delta\\mathbf{r}_{${pairLabel}}| = \\sqrt{${rSqExpr}} = ${rCm}\\;\\mathrm{cm}`,
    });

    // Paso 3: vector unitario r̂ = Δr / r
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

    // Paso 4: determinación de atracción o repulsión según signo del producto q1·q2
    const signProd = chargeSign(src) * chargeSign(target);
    const kind = signProd > 0 ? 'Repulsiva' : 'Atractiva';

    const signSymbolSrc = chargeSign(src) > 0 ? '+' : '-';
    const signSymbolTgt = chargeSign(target) > 0 ? '+' : '-';

    steps.push({
      type: 'formula',
      lbl: `${n}.4  Signos`,
      val: `q_{${srcShort}} \\cdot q_{${tgtShort}} = (${signSymbolSrc}) \\cdot (${signSymbolTgt}) ${signProd > 0 ? '>' : '<'} 0  \\;\\Longrightarrow\\;  \\text{${kind}}`,
    });

    // Paso 5: magnitud de la fuerza |F| = k·|q₁|·|q₂| / r²
    const forceMag = COULOMB_K * Math.abs(src.q * target.q) / (r * r);
    const sign = signProd > 0 ? 1 : -1;
    const forceVec = vec3Scale(dir, sign * forceMag); // vector fuerza con dirección

    // Principio de superposición: se acumula la fuerza
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

    // Paso 6: componentes vectoriales de la fuerza
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

  // ============================================================
  // Cálculo del resultado final (post-bucle)
  // ============================================================
  const mag = vec3Mag(netForce);                                                                                  // magnitud de la fuerza neta
  const theta = (Math.atan2(netForce.y, netForce.x) * 180) / Math.PI;                                            // ángulo θ en el plano xy
  const phi = is3D ? (Math.atan2(netForce.z, Math.sqrt(netForce.x * netForce.x + netForce.y * netForce.y)) * 180) / Math.PI : null; // ángulo φ vertical (solo 3D)

  steps.push({ type: 'div', text: '── Superposición vectorial  ∑ Fᵢ ──' });

  const fxStr = formatNum(netForce.x * 1e6, 3);
  const fyStr = formatNum(netForce.y * 1e6, 3);

  // Componente Fx neta
  steps.push({
    type: 'formula',
    lbl: 'F_x neta',
    val: `F_{x\\text{neta}} = \\sum F_{xi} = ${fxStr}\\;\\mu\\mathrm{N}`,
  });

  // Componente Fy neta
  steps.push({
    type: 'formula',
    lbl: 'F_y neta',
    val: `F_{y\\text{neta}} = \\sum F_{yi} = ${fyStr}\\;\\mu\\mathrm{N}`,
  });

  // Componente Fz neta (solo 3D)
  if (is3D) {
    const fzStr = formatNum(netForce.z * 1e6, 3);
    steps.push({
      type: 'formula',
      lbl: 'F_z neta',
      val: `F_{z\\text{neta}} = \\sum F_{zi} = ${fzStr}\\;\\mu\\mathrm{N}`,
    });
  }

  // Vector fuerza neta completo
  const netStr = is3D
    ? `(${formatNum(netForce.x * 1e6, 3)}\\hat{x} + ${formatNum(netForce.y * 1e6, 3)}\\hat{y} + ${formatNum(netForce.z * 1e6, 3)}\\hat{z})\\;\\mu\\mathrm{N}`
    : `(${formatNum(netForce.x * 1e6, 3)}\\hat{x} + ${formatNum(netForce.y * 1e6, 3)}\\hat{y})\\;\\mu\\mathrm{N}`;

  steps.push({
    type: 'formula',
    lbl: '∑ Fᵢ =',
    val: netStr,
  });

  // Magnitud de la fuerza neta
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

  // Ángulo θ respecto al eje +x
  steps.push({
    type: 'formula',
    lbl: 'Dirección θ',
    val: `\\theta = \\arctan\\!\\left(\\frac{F_{y\\text{neta}}}{F_{x\\text{neta}}}\\right) = \\arctan\\!\\left(\\frac{${fyStr}}{${fxStr}}\\right) = ${formatNum(theta, 2)}^{\\circ} \\; (\\text{respecto a } +x)`,
  });

  // Ángulo φ respecto al plano xy (solo 3D)
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

  // Cuadrante del vector resultante
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
