import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps { onMenuToggle: () => void; }

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { siteOwnerDisplayName } = useAuth();

  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-30 glass-deep h-14">
      <div className="flex items-center justify-between h-full px-4">
        <button onClick={onMenuToggle} className="btn-icon" aria-label="菜单">
          <Menu size={20} />
        </button>
        <Link to="/" className="text-base font-semibold text-dark-900 tracking-tight">
          {siteOwnerDisplayName}
        </Link>
        <div className="w-10" />
      </div>
    </nav>
  );
}
