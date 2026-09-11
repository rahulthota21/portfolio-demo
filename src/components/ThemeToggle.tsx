'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from './Icons';
import { themeScript } from '@/lib/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light' : 'Dark'}
      className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-canvas active:scale-95 dark:hover:bg-canvas"
    >
      {/* Icon shows the state you'll switch TO (sun while dark), so the
          control always matches its aria-label. */}
      {mounted && dark ? <Sun width={17} height={17} /> : <Moon width={17} height={17} />}
      <span className={className} />
    </button>
  );
}

// Kept for backwards-compatible imports.
export { themeScript };
