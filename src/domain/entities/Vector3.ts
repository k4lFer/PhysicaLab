// Interfaz que representa un vector en el espacio 3D (x, y, z)
// Usado para posiciones, desplazamientos, fuerzas y vectores unitarios
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Constructor rápido de Vector3
export function vec3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

// Retorna el vector nulo (0,0,0) — útil para inicializar acumuladores
export function vec3Zero(): Vector3 {
  return { x: 0, y: 0, z: 0 };
}

// Suma vectorial: componente a componente
export function vec3Add(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

// Multiplicación por escalar
export function vec3Scale(v: Vector3, s: number): Vector3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

// Resta vectorial: a - b
export function vec3Sub(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

// Magnitud (norma) del vector: |v| = √(x² + y² + z²)
export function vec3Mag(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

// Vector unitario: v̂ = v / |v|. Retorna (0,0,0) si la magnitud es cero
export function vec3Normalize(v: Vector3): Vector3 {
  const m = vec3Mag(v);
  if (m === 0) return vec3Zero();
  return vec3Scale(v, 1 / m);
}

// Producto punto (dot product): a · b
export function vec3Dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Producto cruz (cross product): a × b
export function vec3Cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

// Distancia euclidiana entre dos puntos: |a - b|
export function vec3Dist(a: Vector3, b: Vector3): number {
  return vec3Mag(vec3Sub(a, b));
}

// Representación del vector como string "(x, y, z)" con formato numérico legible
export function vec3ToString(v: Vector3, decimals = 4): string {
  const d = decimals;
  const fmt = (n: number) => {
    if (n === 0) return '0';
    if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(d);
    return parseFloat(n.toFixed(d)).toString();
  };
  return `(${fmt(v.x)}, ${fmt(v.y)}, ${fmt(v.z)})`;
}
