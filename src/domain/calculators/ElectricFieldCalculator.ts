// ============================================================
// ElectricFieldCalculator.ts — Cálculo de campo eléctrico
// Capa: Dominio (reglas de negocio de la física)
// ============================================================

import type { Charge } from '../entities/Charge';
import { chargeToVector3 } from '../entities/Charge';
import type { Vector3 } from '../entities/Vector3';
import { vec3Sub, vec3Mag, vec3Normalize, vec3Scale, vec3Add } from '../entities/Vector3';

const COULOMB_K = 8.988e9;

// Resultado: campo vectorial neto, magnitud y contribuciones por fuente
export interface FieldResult {
  field: Vector3;
  magnitude: number;
  components: { source: Charge; contribution: Vector3 }[];
}

// Calcula el campo eléctrico en un punto dado, aplicando superposición
export function calculateElectricField(
  charges: Charge[],
  point: { x: number; y: number; z: number },
  mode: '2D' | '3D'
): FieldResult {
  const is3D = mode === '3D';
  let totalField: Vector3 = { x: 0, y: 0, z: 0 };
  const components: { source: Charge; contribution: Vector3 }[] = [];

  for (const charge of charges) {
    const dr = vec3Sub(point, chargeToVector3(charge));
    const r = is3D ? vec3Mag(dr) : Math.sqrt(dr.x * dr.x + dr.y * dr.y);

    if (r === 0) continue; // punto coincide con la carga → se omite

    const dir = vec3Normalize(is3D ? dr : { x: dr.x, y: dr.y, z: 0 });
    const eMag = COULOMB_K * Math.abs(charge.q) / (r * r);
    const sign = charge.q >= 0 ? 1 : -1;
    const contribution = vec3Scale(dir, sign * eMag);

    totalField = vec3Add(totalField, contribution);
    components.push({ source: charge, contribution });
  }

  return {
    field: totalField,
    magnitude: vec3Mag(totalField),
    components,
  };
}
