import { useState, type ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MusicPlayer from '@/components/MusicPlayer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onMenuToggle={() => setMobileMenuOpen(true)} />

      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="
        pt-14 lg:pt-0
        lg:ml-16
        min-h-screen
        transition-all duration-300
      ">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      <MusicPlayer />

      <footer className="
        lg:ml-16
        transition-all duration-300
        border-t border-gray-200 dark:border-gray-800
      ">
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-4xl mx-auto flex items-center justify-center gap-1.5">
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=34012102000953"
            rel="noreferrer"
            target="_blank"
            className="inline-flex items-center gap-1 text-[#749AE3] hover:text-[#5a8ad4] transition-colors text-xs sm:text-sm"
          >
            <img
              src="/beian-icon.png"
              alt="公安备案图标"
              className="w-4 h-4 flex-shrink-0"
              loading="lazy"
            />
            皖公网安备34012102000953号
          </a>
        </div>
      </footer>
    </div>
  );
}
