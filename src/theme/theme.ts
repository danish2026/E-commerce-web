import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'theme-preference';

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
  if (stored) {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setThemeOnDocument = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
};

export const useThemeMode = () => {
  const [mode, setMode] = useState<ThemeMode>(() => getPreferredTheme());

  useEffect(() => {
    setThemeOnDocument(mode);
    window.localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return { mode, setMode, toggleMode };
};

