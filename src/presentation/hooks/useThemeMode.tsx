// ============================================================
// useThemeMode.tsx — Contexto de tema claro/oscuro con persistencia
// Capa: Presentación (proveedor global de tema)
// ============================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'physicaLab-theme';

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeContextValue>({ mode: 'light', toggle: () => {} });

// Lee el tema guardado en localStorage (web) o retorna 'light'
function readStored(): ThemeMode {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    }
  } catch {}
  return 'light';
}

function writeStored(mode: ThemeMode) {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {}
}

// Proveedor de tema: persiste en localStorage y expone toggle
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMode(readStored());
    setReady(true);
  }, []);

  const toggle = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      writeStored(next);
      return next;
    });
  };

  if (!ready) {
    return <ThemeCtx.Provider value={{ mode: 'light', toggle: () => {} }}>{children}</ThemeCtx.Provider>;
  }

  return <ThemeCtx.Provider value={{ mode, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeCtx);
}

export function useForcedColorScheme() {
  return useThemeMode().mode;
}
