// ============================================================
// CalculatePotential.ts — Caso de uso: Calcular potencial eléctrico
// Capa: Aplicación (orquestación, validación de entrada)
// ============================================================

import type { Charge } from '../domain/entities/Charge';
import type { PotentialResult } from '../domain/calculators/PotentialCalculator';
import { calculateElectricPotential } from '../domain/calculators/PotentialCalculator';

// Solicitud: cargas y punto de evaluación
export interface CalculatePotentialRequest {
  charges: Charge[];
  point: { x: number; y: number; z: number };
}

// Respuesta: éxito con resultado o error
export type CalculatePotentialResponse =
  | { kind: 'ok'; result: PotentialResult }
  | { kind: 'err'; message: string };

// Valida entrada y delega el cálculo al dominio
export function calculatePotential(req: CalculatePotentialRequest): CalculatePotentialResponse {
  if (req.charges.length === 0) {
    return { kind: 'err', message: 'No hay cargas en el sistema' };
  }

  const result = calculateElectricPotential(req.charges, req.point);
  return { kind: 'ok', result };
}
