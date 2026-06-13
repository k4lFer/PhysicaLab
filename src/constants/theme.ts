/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1d1d1f',
    background: '#f5f5f7',
    backgroundElement: '#ffffff',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#86868b',
    textTertiary: '#aeaeb2',
    accent: '#007aff',
    positive: '#dc2626',
    negative: '#007aff',
    gold: '#ca8a04',
    magenta: '#ff6b9d',
    violet: '#8b5cf6',
    border: '#e5e5ea',
    borderLight: '#d1d1d6',
    surfaceHover: '#f5f5f7',
    cardShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  dark: {
    text: '#eeeff4',
    background: '#08080f',
    backgroundElement: 'rgba(255,255,255,0.04)',
    backgroundSelected: '#2E3135',
    textSecondary: '#8888a8',
    textTertiary: '#5a5a7a',
    accent: '#00d4ff',
    positive: '#ff6b6b',
    negative: '#00d4ff',
    gold: '#ffd93d',
    magenta: '#ff6b9d',
    violet: '#8b5cf6',
    border: 'rgba(255,255,255,0.06)',
    borderLight: 'rgba(255,255,255,0.12)',
    surfaceHover: 'rgba(255,255,255,0.08)',
    cardShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
