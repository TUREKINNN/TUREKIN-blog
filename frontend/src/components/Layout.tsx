import { useState, lazy, Suspense, type ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const MusicPlayer = lazy(() => import('@/components/MusicPlayer'));

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{background:'hsl(var(--bg-hue,250),30%,7%)'}}>
      {/* 全局噪点纹理 */}
      <div className="noise-overlay" />

      <Navbar onMenuToggle={() => setMobileMenuOpen(true)} />
      <Sidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <main className="pt-14 lg:pt-0 lg:ml-16 min-h-screen transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-5xl mx-auto animate-page-enter">
          {children}
        </div>
      </main>

      <footer className="lg:ml-16 transition-all duration-300 border-t border-white/[0.04] dark:border-white/[0.04]">
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-5xl mx-auto flex items-center justify-center">
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=34012102000953"
            rel="noreferrer" target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-surface-400 dark:text-dark-500 hover:text-surface-600 dark:hover:text-dark-400 transition-colors"
          >
            <img src="/beian-icon.png" alt="备案" className="w-3.5 h-3.5 opacity-50" loading="lazy" />
            皖公网安备34012102000953号
          </a>
        </div>
      </footer>

      <Suspense fallback={null}><MusicPlayer /></Suspense>
    </div>
  );
}
