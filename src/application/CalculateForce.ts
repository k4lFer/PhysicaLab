// ============================================================
// CalculateForce.ts — Caso de uso: Calcular fuerza neta
// Capa: Aplicación (orquestación, validación de entrada)
// ============================================================

import type { Charge } from '../domain/entities/Charge';
import type { CoulombResult } from '../domain/calculators/CoulombCalculator';
import { calculateCoulombForce } from '../domain/calculators/CoulombCalculator';

export type ForceMode = '2D' | '3D';

// Solicitud: contiene las cargas, el ID objetivo y el modo (2D o 3D)
export interface CalculateForceRequest {
  charges: Charge[];
  targetId: number;
  mode: ForceMode;
}

// Respuesta: puede ser exitosa (ok + resultado) o error (mensaje)
export type CalculateForceResponse =
  | { kind: 'ok'; result: CoulombResult }
  | { kind: 'err'; message: string };

// Función principal del caso de uso: valida la entrada antes de calcular
export function calculateForce(req: CalculateForceRequest): CalculateForceResponse {
  const { charges, targetId, mode } = req;

  // ── Validación 1: mínimo 2 cargas ──
  if (charges.length < 2) {
    return { kind: 'err', message: 'Se necesitan al menos 2 cargas' };
  }

  // ── Validación 2: objetivo existente ──
  const target = charges.find(c => c.id === targetId);
  if (!target) {
    return { kind: 'err', message: 'Carga objetivo no encontrada' };
  }

  // ── Validación 3: sin cargas superpuestas ──
  // En 2D solo importan x e y; en 3D se evalúa x, y, z
  const overlapping = charges.find(
    c => c.id !== targetId
      && c.x === target.x
      && c.y === target.y
      && (mode === '3D' ? c.z === target.z : true)
  );
  if (overlapping) {
    const posStr = `(${target.x * 100}, ${target.y * 100}${mode === '3D' ? `, ${target.z * 100}` : ''}) cm`;
    return { kind: 'err', message: `Cargas superpuestas: ${overlapping.label} y ${target.label} están en ${posStr}` };
  }

  // Delega el cálculo a la capa de dominio (CoulombCalculator)
  const result = calculateCoulombForce(charges, targetId, mode);
  if (!result) {
    return { kind: 'err', message: 'Error en el cálculo' };
  }

  return { kind: 'ok', result };
}
