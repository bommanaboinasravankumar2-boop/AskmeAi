import { useEffect, useState } from 'react';
import { ThemeMode } from '../types/chat';

const THEME_STORAGE_KEY = 'askmeai_theme_mode';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {}
    return 'dark'; // Dark default for modern AI experience
  });

  const [resolvedDark, setResolvedDark] = useState<boolean>(true);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      let isDark = false;
      if (themeMode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = themeMode === 'dark';
      }
      setResolvedDark(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    updateResolved();

    const listener = () => {
      if (themeMode === 'system') {
        updateResolved();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode]);

  return {
    themeMode,
    setThemeMode,
    resolvedDark,
  };
}
