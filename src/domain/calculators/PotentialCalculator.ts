// ============================================================
// PotentialCalculator.ts — Cálculo de potencial eléctrico
// Capa: Dominio (reglas de negocio de la física)
// ============================================================

import type { Charge } from '../entities/Charge';
import { chargeToVector3 } from '../entities/Charge';
import { vec3Sub, vec3Mag } from '../entities/Vector3';

const COULOMB_K = 8.988e9;

// Resultado: potencial neto y contribuciones por fuente
export interface PotentialResult {
  totalPotential: number;
  contributions: { source: Charge; potential: number }[];
}

// Calcula el potencial eléctrico escalar en un punto por superposición
export function calculateElectricPotential(
  charges: Charge[],
  point: { x: number; y: number; z: number }
): PotentialResult {
  let total = 0;
  const contributions: { source: Charge; potential: number }[] = [];

  for (const charge of charges) {
    const dr = vec3Sub(point, chargeToVector3(charge));
    const r = vec3Mag(dr);

    if (r === 0) continue; // punto coincide con la carga → se omite

    const v = COULOMB_K * charge.q / r;
    total += v;
    contributions.push({ source: charge, potential: v });
  }

  return { totalPotential: total, contributions };
}
