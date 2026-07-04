import { useEffect, useState } from 'react';
import { THEMES, Theme } from '@content-sphere-hub/shared';

const THEME_KEY = 'csh-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return THEMES.SYSTEM;
  }

  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored && Object.values(THEMES).includes(stored)) {
    return stored;
  }

  return THEMES.SYSTEM;
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (theme === THEMES.SYSTEM) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === THEMES.DARK);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  return { theme, setTheme };
}
