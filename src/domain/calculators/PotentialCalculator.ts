import type { Charge } from '../entities/Charge';
import { chargeToVector3 } from '../entities/Charge';
import { vec3Sub, vec3Mag } from '../entities/Vector3';

const COULOMB_K = 8.988e9;

export interface PotentialResult {
  totalPotential: number;
  contributions: { source: Charge; potential: number }[];
}

export function calculateElectricPotential(
  charges: Charge[],
  point: { x: number; y: number; z: number }
): PotentialResult {
  let total = 0;
  const contributions: { source: Charge; potential: number }[] = [];

  for (const charge of charges) {
    const dr = vec3Sub(point, chargeToVector3(charge));
    const r = vec3Mag(dr);

    if (r === 0) continue;

    const v = COULOMB_K * charge.q / r;
    total += v;
    contributions.push({ source: charge, potential: v });
  }

  return { totalPotential: total, contributions };
}
