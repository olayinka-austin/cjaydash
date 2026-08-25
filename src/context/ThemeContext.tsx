import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorTheme } from '../types';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorThemeOption {
  id: ColorTheme;
  name: string;
  swatchHex: string;
  description: string;
  lightPrimary: string;
  lightHover: string;
  lightBg: string;
  lightBorder: string;
  darkPrimary: string;
  darkHover: string;
  darkBg: string;
  darkBorder: string;
  chartHex: string;
  chartSecondaryHex: string;
  ringHex: string;
}

export const COLOR_THEME_OPTIONS: Record<ColorTheme, ColorThemeOption> = {
  blue: {
    id: 'blue',
    name: 'Blue',
    swatchHex: '#0284c7',
    description: 'Professional institutional azure',
    lightPrimary: '#0284c7',
    lightHover: '#0369a1',
    lightBg: '#f0f9ff',
    lightBorder: 'rgba(2, 132, 199, 0.25)',
    darkPrimary: '#38bdf8',
    darkHover: '#0ea5e9',
    darkBg: 'rgba(2, 132, 199, 0.2)',
    darkBorder: 'rgba(56, 189, 248, 0.3)',
    chartHex: '#0284c7',
    chartSecondaryHex: '#38bdf8',
    ringHex: '#38bdf8'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    swatchHex: '#1b6b51',
    description: 'Classic wealth & independence green',
    lightPrimary: '#1b6b51',
    lightHover: '#15533e',
    lightBg: '#e8f5f0',
    lightBorder: 'rgba(27, 107, 81, 0.25)',
    darkPrimary: '#60d3a7',
    darkHover: '#34d399',
    darkBg: 'rgba(27, 107, 81, 0.2)',
    darkBorder: 'rgba(96, 211, 167, 0.3)',
    chartHex: '#1b6b51',
    chartSecondaryHex: '#60d3a7',
    ringHex: '#60d3a7'
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    swatchHex: '#7c3aed',
    description: 'Royal & modern investment violet',
    lightPrimary: '#7c3aed',
    lightHover: '#6d28d9',
    lightBg: '#f5f3ff',
    lightBorder: 'rgba(124, 58, 237, 0.25)',
    darkPrimary: '#a78bfa',
    darkHover: '#8b5cf6',
    darkBg: 'rgba(124, 58, 237, 0.2)',
    darkBorder: 'rgba(167, 139, 250, 0.3)',
    chartHex: '#7c3aed',
    chartSecondaryHex: '#a78bfa',
    ringHex: '#a78bfa'
  },
  amber: {
    id: 'amber',
    name: 'Amber',
    swatchHex: '#b45309',
    description: 'Warm gold bullion & sovereign brass',
    lightPrimary: '#b45309',
    lightHover: '#92400e',
    lightBg: '#fffbeb',
    lightBorder: 'rgba(180, 83, 9, 0.25)',
    darkPrimary: '#fbbf24',
    darkHover: '#f59e0b',
    darkBg: 'rgba(180, 83, 9, 0.22)',
    darkBorder: 'rgba(251, 191, 36, 0.3)',
    chartHex: '#b45309',
    chartSecondaryHex: '#fbbf24',
    ringHex: '#fbbf24'
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    swatchHex: '#be123c',
    description: 'Executive crimson & high-contrast ruby',
    lightPrimary: '#be123c',
    lightHover: '#9f1239',
    lightBg: '#fff1f2',
    lightBorder: 'rgba(190, 18, 60, 0.25)',
    darkPrimary: '#fb7185',
    darkHover: '#f43f5e',
    darkBg: 'rgba(190, 18, 60, 0.2)',
    darkBorder: 'rgba(251, 113, 133, 0.3)',
    chartHex: '#be123c',
    chartSecondaryHex: '#fb7185',
    ringHex: '#fb7185'
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    swatchHex: '#475569',
    description: 'Minimalist sophisticated steel',
    lightPrimary: '#334155',
    lightHover: '#1e293b',
    lightBg: '#f1f5f9',
    lightBorder: 'rgba(51, 65, 85, 0.25)',
    darkPrimary: '#94a3b8',
    darkHover: '#cbd5e1',
    darkBg: 'rgba(51, 65, 85, 0.25)',
    darkBorder: 'rgba(148, 163, 184, 0.3)',
    chartHex: '#475569',
    chartSecondaryHex: '#94a3b8',
    ringHex: '#94a3b8'
  }
};

export const COLOR_THEME_LIST: ColorThemeOption[] = [
  COLOR_THEME_OPTIONS.blue,
  COLOR_THEME_OPTIONS.emerald,
  COLOR_THEME_OPTIONS.purple,
  COLOR_THEME_OPTIONS.amber,
  COLOR_THEME_OPTIONS.rose,
  COLOR_THEME_OPTIONS.slate
];

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  availableColorThemes: ColorThemeOption[];
  currentColorTheme: ColorThemeOption;
}

const THEME_STORAGE_KEY = 'wealth_terminal_theme_preference_v1';
const COLOR_THEME_STORAGE_KEY = 'wealth_terminal_color_theme_preference_v1';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        return saved;
      }
    } catch (e) {
      // LocalStorage access error fallback
    }
    return 'system';
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorTheme | null;
      if (saved && (saved === 'blue' || saved === 'emerald' || saved === 'purple' || saved === 'amber' || saved === 'rose' || saved === 'slate')) {
        return saved;
      }
    } catch (e) {
      // LocalStorage access error fallback
    }
    return 'blue';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Calculate resolved theme based on active selection and OS preference
  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Listen for system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    setSystemIsDark(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Compatibility fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Synchronize class list on document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  // Synchronize dynamic color theme CSS variables on document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-theme', colorTheme);

    const activeOpt = COLOR_THEME_OPTIONS[colorTheme] || COLOR_THEME_OPTIONS.blue;

    root.style.setProperty('--color-accent-primary', activeOpt.lightPrimary);
    root.style.setProperty('--color-accent-hover', activeOpt.lightHover);
    root.style.setProperty('--color-accent-light', activeOpt.lightBg);
    root.style.setProperty('--color-accent-border-light', activeOpt.lightBorder);
    root.style.setProperty('--color-accent-dark', activeOpt.darkPrimary);
    root.style.setProperty('--color-accent-dark-hover', activeOpt.darkHover);
    root.style.setProperty('--color-accent-dark-bg', activeOpt.darkBg);
    root.style.setProperty('--color-accent-dark-border', activeOpt.darkBorder);
    root.style.setProperty('--color-accent-chart', activeOpt.chartHex);
    root.style.setProperty('--color-accent-chart-sub', activeOpt.chartSecondaryHex);
    root.style.setProperty('--color-accent-ring', activeOpt.ringHex);
    root.style.setProperty('--color-accent-swatch', activeOpt.swatchHex);
  }, [colorTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      // ignore
    }
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, newColorTheme);
    } catch (e) {
      // ignore
    }
  };

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const currentColorTheme = COLOR_THEME_OPTIONS[colorTheme] || COLOR_THEME_OPTIONS.blue;

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        resolvedTheme, 
        setTheme, 
        cycleTheme,
        colorTheme,
        setColorTheme,
        availableColorThemes: COLOR_THEME_LIST,
        currentColorTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
