import { useState, useCallback } from 'react';
import type { Charge } from '@/domain/entities/Charge';
import type { CoulombResult } from '@/domain/calculators/CoulombCalculator';
import { calculateForce, type ForceMode } from '@/application/CalculateForce';
import { subscriptNum } from '@/shared/constants';

let _idCounter = 3;

const EXAMPLE_CHARGES: Charge[] = [
  { id: 1, label: 'q₁', q: 5e-9, x: 0, y: 0, z: 0 },
  { id: 2, label: 'q₂', q: -2e-9, x: 0.04, y: 0, z: 0 },
  { id: 3, label: 'q₃', q: 6e-9, x: 0.04, y: 0.03, z: 0 },
];

export function useCoulomb() {
  const [mode, setMode] = useState<ForceMode>('2D');
  const [charges, setCharges] = useState<Charge[]>(EXAMPLE_CHARGES.map(c => ({ ...c })));
  const [targetId, setTargetId] = useState(3);
  const [result, setResult] = useState<CoulombResult | null>(null);
  const [tab, setTab] = useState<'steps' | 'graph'>('steps');
  const [error, setError] = useState<string | null>(null);

  const switchMode = useCallback((m: ForceMode) => {
    setMode(m);
    setResult(null);
    setError(null);
  }, []);

  const addCharge = useCallback(() => {
    const id = ++_idCounter;
    const n = charges.length + 1;
    setCharges(prev => [...prev, { id, label: `q${subscriptNum(n)}`, q: 1e-9, x: 0, y: 0, z: 0 }]);
  }, [charges.length]);

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

  const updateCharge = useCallback((id: number, field: string, raw: string) => {
    setCharges(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (field === 'label') return { ...c, label: raw };
      const v = parseFloat(raw) || 0;
      const multiplier = field === 'q' ? 1e-9 : 0.01;
      return { ...c, [field]: v * multiplier };
    }));
  }, []);

  const calculate = useCallback(() => {
    setError(null);
    const response = calculateForce({ charges, targetId, mode });
    if (response.kind === 'err') {
      setError(response.message);
      setResult(null);
      return;
    }
    setResult(response.result);
    setTab('steps');
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
