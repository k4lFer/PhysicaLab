import type { Charge } from '../domain/entities/Charge';
import type { PotentialResult } from '../domain/calculators/PotentialCalculator';
import { calculateElectricPotential } from '../domain/calculators/PotentialCalculator';

export interface CalculatePotentialRequest {
  charges: Charge[];
  point: { x: number; y: number; z: number };
}

export type CalculatePotentialResponse =
  | { kind: 'ok'; result: PotentialResult }
  | { kind: 'err'; message: string };

export function calculatePotential(req: CalculatePotentialRequest): CalculatePotentialResponse {
  if (req.charges.length === 0) {
    return { kind: 'err', message: 'No hay cargas en el sistema' };
  }

  const result = calculateElectricPotential(req.charges, req.point);
  return { kind: 'ok', result };
}
