import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';

export interface ThemePreset {
  id: string; name: string; hue: number; saturation: number; lightness: number;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'nebula', name: '星云紫', hue: 250, saturation: 85, lightness: 65 },
  { id: 'ocean',   name: '深海蓝', hue: 215, saturation: 80, lightness: 60 },
  { id: 'forest',  name: '翡翠绿', hue: 160, saturation: 70, lightness: 50 },
  { id: 'sunset',  name: '日落橙', hue: 15,  saturation: 85, lightness: 60 },
  { id: 'rose',    name: '玫瑰粉', hue: 330, saturation: 75, lightness: 60 },
  { id: 'amber',   name: '琥珀金', hue: 40,  saturation: 90, lightness: 55 },
];

export type Mode = 'dark' | 'light';

function applyAccent(p: ThemePreset): void {
  const root = document.documentElement; const h = p.hue;
  root.style.setProperty('--theme-hue', String(h));
  root.style.setProperty('--theme-sat', `${p.saturation}%`);
  root.style.setProperty('--theme-light', `${p.lightness}%`);
  ['50','100','200','300','400','500','600','700','800','900'].forEach((n,i) => {
    root.style.setProperty(`--accent-${n}`, `hsl(${h},${p.saturation+20*(1-i/9)}%,${95-i*8}%)`);
  });
  root.style.setProperty('--accent-glow', `hsla(${h},${p.saturation}%,${p.lightness}%,0.25)`);
  localStorage.setItem('theme-preset', p.id);
}

interface ThemeContextValue {
  preset: ThemePreset;
  presets: ThemePreset[];
  setPreset: (id: string) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  bgImage: string | null;
  setBgImage: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetId] = useState(() => localStorage.getItem('theme-preset') || 'nebula');
  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('site-mode');
    if (saved === 'dark' || saved === 'light') return saved;
    // backward compatibility: ignore old 'bg-preset' key
    return 'dark';
  });
  const [bgImage, setBgImageState] = useState<string | null>(() => localStorage.getItem('site-bg-image') || null);

  const preset = THEME_PRESETS.find(p => p.id === presetId) || THEME_PRESETS[0];

  // Apply accent preset
  useEffect(() => { applyAccent(preset); }, [preset]);

  // Apply dark/light mode
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('site-mode', mode);
  }, [mode]);

  // Apply background image via inline style (highest specificity, survives CSS !important overrides)
  useEffect(() => {
    if (bgImage) {
      document.body.style.setProperty('background-image', `url(${bgImage})`, 'important');
      document.body.style.setProperty('background-size', 'cover', 'important');
      document.body.style.setProperty('background-position', 'center', 'important');
      document.body.style.setProperty('background-attachment', 'fixed', 'important');
    } else {
      document.body.style.removeProperty('background-image');
      document.body.style.removeProperty('background-size');
      document.body.style.removeProperty('background-position');
      document.body.style.removeProperty('background-attachment');
    }
    localStorage.setItem('site-bg-image', bgImage || '');
  }, [bgImage]);

  // Initial application on mount
  useEffect(() => { applyAccent(preset); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setPreset = useCallback((id: string) => setPresetId(id), []);
  const setMode = useCallback((m: Mode) => setModeState(m), []);
  const setBgImage = useCallback((url: string | null) => setBgImageState(url), []);

  const value = useMemo<ThemeContextValue>(() => ({
    preset, presets: THEME_PRESETS, setPreset,
    mode, setMode,
    bgImage, setBgImage,
  }), [preset, setPreset, mode, setMode, bgImage, setBgImage]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useSiteTheme must be used within ThemeProvider');
  return ctx;
}