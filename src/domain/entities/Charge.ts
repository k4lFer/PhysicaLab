import type { Vector3 } from './Vector3';

export interface Charge {
  id: number;
  label: string;
  q: number;
  x: number;
  y: number;
  z: number;
}

export function chargeToVector3(c: Charge): Vector3 {
  return { x: c.x, y: c.y, z: c.z };
}

export function chargeSign(c: Charge): 1 | -1 {
  return c.q >= 0 ? 1 : -1;
}
