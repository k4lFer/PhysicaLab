export function formatNum(n: number, d = 3): string {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(d);
  return parseFloat(n.toFixed(d)).toString();
}

export function formatCharge(q: number): string {
  const nC = q * 1e9;
  return `${nC >= 0 ? '+' : ''}${formatNum(nC, 3)} nC`;
}

export function formatDist(m: number): string {
  return `${formatNum(m * 100, 4)} cm`;
}

export function formatForceMicro(f: number): string {
  return `${formatNum(f * 1e6, 4)} µN`;
}
