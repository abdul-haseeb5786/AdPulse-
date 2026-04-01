import { useState, useCallback, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('adpulse-dark');
      if (stored !== null) {
        return stored === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync with DOM on initial client mount only
  // (Prevents re-running effect on every toggle, logic is moved to the event handler)
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const root = document.documentElement;

      if (next) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      try {
        localStorage.setItem('adpulse-dark', String(next));
      } catch {
        // Ignore quota/access errors
      }

      return next;
    });
  }, []);

  return [isDark, toggleDark] as const;
}
