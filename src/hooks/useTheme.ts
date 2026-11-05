import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'sara_academy_theme';

/**
 * نظام الوضع الداكن/النهاري الحقيقي:
 * - الوضع النهاري (Light) هو الأساسي افتراضياً.
 * - الاختيار يُحفظ في localStorage ويُستعاد عند زيارة الموقع مرة أخرى.
 */
export function useTheme(): { theme: ThemeMode; toggleTheme: () => void; setTheme: (t: ThemeMode) => void } {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') return 'dark';
      return 'light'; // الوضع النهاري هو الأساس
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
  }, []);

  return { theme, toggleTheme, setTheme };
}
