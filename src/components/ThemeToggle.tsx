'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('ihub_theme', next ? 'dark' : 'light'); } catch {}
    setDark(next);
  };

  return (
    <button onClick={toggle} aria-label="Toggle dark mode" className="btn btn-ghost !p-2.5">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
