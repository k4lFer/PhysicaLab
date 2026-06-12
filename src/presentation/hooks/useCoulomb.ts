// ============================================================
// useCoulomb.ts — Hook de estado para el calculador de Coulomb
// Capa: Presentación (gestión de estado del formulario)
// ============================================================

import { useState, useCallback } from 'react';
import type { Charge } from '@/domain/entities/Charge';
import type { CoulombResult } from '@/domain/calculators/CoulombCalculator';
import { calculateForce, type ForceMode } from '@/application/CalculateForce';
import { subscriptNum } from '@/shared/constants';

// Contador incremental para IDs de nuevas cargas
let _idCounter = 3;

// Cargas de ejemplo precargadas para demostración inmediata al abrir la app
const EXAMPLE_CHARGES: Charge[] = [
  { id: 1, label: 'q₁', q: 5e-9, x: 0, y: 0, z: 0 },
  { id: 2, label: 'q₂', q: -2e-9, x: 0.04, y: 0, z: 0 },
  { id: 3, label: 'q₃', q: 6e-9, x: 0.04, y: 0.03, z: 0 },
];

export function useCoulomb() {
  // Estado del hook
  const [mode, setMode] = useState<ForceMode>('2D');        // '2D' o '3D'
  const [charges, setCharges] = useState<Charge[]>(EXAMPLE_CHARGES.map(c => ({ ...c }))); // lista de cargas
  const [targetId, setTargetId] = useState(3);                // ID de la carga objetivo
  const [result, setResult] = useState<CoulombResult | null>(null);  // resultado del cálculo
  const [tab, setTab] = useState<'steps' | 'graph'>('steps');       // pestaña activa: pasos o gráfica
  const [error, setError] = useState<string | null>(null);          // mensaje de error

  // Cambia entre modo 2D y 3D, reinicia el resultado
  const switchMode = useCallback((m: ForceMode) => {
    setMode(m);
    setResult(null);
    setError(null);
  }, []);

  // Agrega una nueva carga con valores por defecto (1 nC en el origen)
  const addCharge = useCallback(() => {
    const id = ++_idCounter;
    const n = charges.length + 1;
    setCharges(prev => [...prev, { id, label: `q${subscriptNum(n)}`, q: 1e-9, x: 0, y: 0, z: 0 }]);
  }, [charges.length]);

  // Elimina una carga por ID; si era el objetivo, se reasigna automáticamente
  const removeCharge = useCallback((id: number) => {
    setCharges(prev => {
      const next = prev.filter(c => c.id !== id);
      if (id === targetId) {
        const first = next.find(c => c.id !== id);
        setTargetId(first?.id ?? next[0]?.id ?? 0);
      }
      return next;
    });
  }, [targetId]);

  // Actualiza un campo específico de una carga
  // Convierte automáticamente: q se ingresa en nC → C, posición en cm → m
  const updateCharge = useCallback((id: number, field: string, raw: string) => {
    setCharges(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (field === 'label') return { ...c, label: raw };
      const v = parseFloat(raw) || 0;
      const multiplier = field === 'q' ? 1e-9 : 0.01;
      return { ...c, [field]: v * multiplier };
    }));
  }, []);

  // Ejecuta el cálculo llamando al caso de uso CalculateForce
  const calculate = useCallback(() => {
    setError(null);
    const response = calculateForce({ charges, targetId, mode });
    if (response.kind === 'err') {
      setError(response.message);
      setResult(null);
      return;
    }
    setResult(response.result);
    setTab('steps'); // al calcular, muestra automáticamente la pestaña de pasos
  }, [charges, targetId, mode]);

  return {
    mode, switchMode,
    charges, setCharges,
    targetId, setTargetId,
    result, setResult,
    tab, setTab,
    error,
    addCharge, removeCharge, updateCharge, calculate,
  };
}
