// ============================================================
// constants.ts — Constantes físicas y tokens visuales
// Capa: Compartida (utilidades globales)
// ============================================================

// Constante de Coulomb (N·m²/C²)
export const COULOMB_K = 8.988e9;

// Colores semánticos para cargas y vectores
export const POSITIVE_COLOR = '#ef4444';
export const NEGATIVE_COLOR = '#3b82f6';
export const NET_FORCE_COLOR = '#00d4ff';
export const COMPONENT_COLOR = '#facc15';

// Subíndices Unicode para etiquetas: q₁, q₂, …
export const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉';
export function subscriptNum(n: number): string {
  return String(n).split('').map(d => SUBSCRIPT_DIGITS[+d]).join('');
}
