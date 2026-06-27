/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      /* ===== 设计令牌：间距（4px 基准） ===== */
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      /* ===== 设计令牌：圆角 — 液态玻璃风格更圆润 ===== */
      borderRadius: {
        'xs': '6px',
        'sm': '8px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        'full': '9999px',
      },
      /* ===== 设计令牌：字体 ===== */
      fontFamily: {
        sans: [
          'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial',
          '"PingFang SC"', '"Noto Sans SC"', '"Microsoft YaHei"',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code',
          'Consolas', '"Liberation Mono"', 'Menlo', 'monospace',
        ],
        display: [
          'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      /* ===== 设计令牌：字号（流体比例） ===== */
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      /* ===== 设计令牌：配色（科技深色调） ===== */
      colors: {
        /* 主色系 — 冰蓝/靛蓝（Linear 灵感） */
        accent: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        /* 表面色 — Slate 灰系 */
        surface: {
          0: '#ffffff',
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
          1000: '#000000',
        },
        /* 暗色表面 */
        dark: {
          0: '#0a0a0b',
          50: '#111113', 100: '#18181b', 200: '#1f1f23', 300: '#27272b',
          400: '#6b7280', 500: '#9ca3af', 600: '#d1d5db', 700: '#e5e7eb',
          800: '#d4d4d8', 900: '#e4e4e7', 950: '#f4f4f5',
        },
        /* 语义色 */
        success: { DEFAULT: '#22c55e', muted: '#166534' },
        warning: { DEFAULT: '#f59e0b', muted: '#92400e' },
        danger:  { DEFAULT: '#ef4444', muted: '#991b1b' },
        info:    { DEFAULT: '#3b82f6', muted: '#1e40af' },
        /* 兼容旧色 */
        'apple-dark': {
          bg: '#0a0a0b', card: '#18181b', text: '#f4f4f5',
          gray: '#d4d4d8', lightgray: '#a1a1aa',
          border: 'rgba(255,255,255,0.06)', tag: '#27272b', tagtext: '#d4d4d8',
        },
        /* 旧版 Tailwind 类名兼容 */
        apple: {
          dark: '#2d2d2f',
          gray: '#ababaf',
          lightgray: '#c4c4c8',
          border: 'rgba(255,255,255,0.06)',
          tag: '#27272b',
          tagtext: '#d4d4d8',
          bg: '#0a0a0b',
          card: '#18181b',
        },
        'apple-dark-gray': '#d4d4d8',
        'apple-dark-lightgray': '#a1a1aa',
        'apple-dark-border': 'rgba(255,255,255,0.06)',
        'apple-dark-tag': '#27272b',
        'apple-dark-tagtext': '#d4d4d8',
        'apple-dark-text': '#f4f4f5',
      },
      /* ===== 设计令牌：阴影 ===== */
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'glow': '0 0 20px -4px rgb(99 102 241 / 0.2)',
        'inner-top': 'inset 0 1px 0 rgb(255 255 255 / 0.08)',
      },
      /* ===== 设计令牌：动画 — 液态玻璃动效 ===== */
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'page-enter': 'pageEnter 0.4s ease-out both',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'liquid-glow': 'liquidGlow 4s ease-in-out infinite',
        'iridescent': 'iridescentShift 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', filter: 'blur(2px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '200% 0' },
          '50%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        liquidGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.1), 0 0 40px rgba(59, 130, 246, 0.05)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)',
          },
        },
        iridescentShift: {
          '0%, 100%': {
            filter: 'hue-rotate(0deg)',
            backgroundPosition: '0% 50%',
          },
          '50%': {
            filter: 'hue-rotate(30deg)',
            backgroundPosition: '100% 50%',
          },
        },
      },
      /* ===== 设计令牌：过渡 ===== */
      transitionDuration: {
        '150': '150ms', '200': '200ms', '300': '300ms',
        '400': '400ms', '500': '500ms', '700': '700ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
