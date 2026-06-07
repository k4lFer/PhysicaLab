import { createContext, useContext, useState, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeContextValue>({ mode: 'light', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const toggle = () => setMode(prev => prev === 'light' ? 'dark' : 'light');
  return <ThemeCtx.Provider value={{ mode, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeCtx);
}

export function useForcedColorScheme() {
  return useThemeMode().mode;
}
