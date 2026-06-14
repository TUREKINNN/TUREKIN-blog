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

/* 底色预设：控制全站暗色背景的色调 */
export interface BgPreset { id: string; name: string; hue: number; }
export const BG_PRESETS: BgPreset[] = [
  { id: 'void',     name: '纯黑',   hue: 0 },
  { id: 'deepvoid', name: '深空黑', hue: 250 },
  { id: 'navy',     name: '海军蓝', hue: 220 },
  { id: 'charcoal', name: '墨灰',   hue: 260 },
  { id: 'forestbg', name: '森林',   hue: 170 },
  { id: 'warm',     name: '暖棕暗', hue: 20  },
  { id: 'midnight', name: '午夜紫', hue: 280 },
  { id: 'steel',    name: '钢铁蓝', hue: 210 },
];

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

function applyBg(bg: BgPreset): void {
  const root = document.documentElement;
  root.style.setProperty('--bg-hue', String(bg.hue));
  localStorage.setItem('bg-preset', bg.id);
}

interface ThemeContextValue {
  preset: ThemePreset; presets: ThemePreset[];
  setPreset: (id: string) => void;
  bgPresets: BgPreset[]; bgPreset: BgPreset;
  setBgPreset: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetId] = useState(() => localStorage.getItem('theme-preset') || 'nebula');
  const [bgId, setBgId] = useState(() => localStorage.getItem('bg-preset') || 'void');

  const preset = THEME_PRESETS.find(p => p.id === presetId) || THEME_PRESETS[0];
  const bgPreset = BG_PRESETS.find(b => b.id === bgId) || BG_PRESETS[0];

  useEffect(() => { applyAccent(preset); }, [preset]);
  useEffect(() => { applyBg(bgPreset); }, [bgPreset]);
  useEffect(() => { applyAccent(preset); applyBg(bgPreset); }, []);

  // 注入全局底色 CSS
  useEffect(() => {
    const id = 'bg-override-style';
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
    const h = bgPreset.hue;
    const sat = h === 0 ? '0%' : '30%'; // 纯黑用 0% 饱和度
    el.textContent = `
      body,.min-h-screen{background:hsl(${h},${sat},${h===0?'5%':'7%'})!important}
      .glass-deep,.glass-mid,.glass-light{background:hsla(${h},${sat},12%,0.82)!important}
      footer{border-color:hsla(${h},50%,40%,0.12)!important}
    `;
  }, [bgPreset]);

  const setPreset = useCallback((id: string) => setPresetId(id), []);
  const setBgPreset = useCallback((id: string) => setBgId(id), []);

  const value = useMemo(() => ({
    preset, presets: THEME_PRESETS, setPreset,
    bgPresets: BG_PRESETS, bgPreset, setBgPreset,
  }), [preset, setPreset, bgPreset, setBgPreset]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useSiteTheme must be used within ThemeProvider');
  return ctx;
}
