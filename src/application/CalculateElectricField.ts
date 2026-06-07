import type { Charge } from '../domain/entities/Charge';
import type { FieldResult } from '../domain/calculators/ElectricFieldCalculator';
import { calculateElectricField } from '../domain/calculators/ElectricFieldCalculator';

export type FieldMode = '2D' | '3D';

export interface CalculateFieldRequest {
  charges: Charge[];
  point: { x: number; y: number; z: number };
  mode: FieldMode;
}

export type CalculateFieldResponse =
  | { kind: 'ok'; result: FieldResult }
  | { kind: 'err'; message: string };

export function calculateField(req: CalculateFieldRequest): CalculateFieldResponse {
  const { charges, point, mode } = req;

  if (charges.length === 0) {
    return { kind: 'err', message: 'No hay cargas en el sistema' };
  }

  const result = calculateElectricField(charges, point, mode);
  return { kind: 'ok', result };
}
