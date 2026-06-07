import type { Charge } from '../domain/entities/Charge';
import type { CoulombResult } from '../domain/calculators/CoulombCalculator';
import { calculateCoulombForce } from '../domain/calculators/CoulombCalculator';

export type ForceMode = '2D' | '3D';

export interface CalculateForceRequest {
  charges: Charge[];
  targetId: number;
  mode: ForceMode;
}

export type CalculateForceResponse =
  | { kind: 'ok'; result: CoulombResult }
  | { kind: 'err'; message: string };

export function calculateForce(req: CalculateForceRequest): CalculateForceResponse {
  const { charges, targetId, mode } = req;

  if (charges.length < 2) {
    return { kind: 'err', message: 'Se necesitan al menos 2 cargas' };
  }

  const target = charges.find(c => c.id === targetId);
  if (!target) {
    return { kind: 'err', message: 'Carga objetivo no encontrada' };
  }

  const result = calculateCoulombForce(charges, targetId, mode);
  if (!result) {
    return { kind: 'err', message: 'Error en el cálculo' };
  }

  return { kind: 'ok', result };
}
