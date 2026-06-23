import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Github, Link2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onMenuToggle: () => void;
}

interface FriendLink {
  id: number;
  name: string;
  url: string;
  avatarUrl: string;
  description: string;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { siteOwnerDisplayName } = useAuth();
  const [githubUrl, setGithubUrl] = useState('');
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    fetch('/api/config/about', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => { if (json.success) setGithubUrl(json.data?.githubUrl || ''); })
      .catch(() => {});
    fetch('/api/friendlinks')
      .then((r) => r.json())
      .then((json) => { if (json.success) setFriendLinks(json.data || []); })
      .catch(() => {});
  }, []);

  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-30 glass transition-all duration-300">
      <div className="flex items-center justify-between h-14 px-4">
        <button
          onClick={onMenuToggle}
          className="btn-icon"
          aria-label="打开菜单"
        >
          <Menu size={20} className="text-apple-dark dark:text-white" />
        </button>

        <Link
          to="/"
          className="text-lg font-bold text-apple-dark dark:text-white tracking-tight"
        >
          {siteOwnerDisplayName}
        </Link>

        <div className="flex items-center gap-1">
          {friendLinks.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFriends(!showFriends)}
                className="btn-icon"
                aria-label="友站链接"
              >
                <Link2 size={18} className={`transition-colors ${showFriends ? 'text-blue-500' : 'text-apple-dark dark:text-white'}`} />
              </button>
              {showFriends && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {friendLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowFriends(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-apple-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={link.avatarUrl}
                        alt={link.name}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{link.name}</p>
                        <p className="text-xs text-apple-gray dark:text-apple-dark-gray truncate">{link.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon"
              aria-label="GitHub"
            >
              <Github size={18} className="text-apple-dark dark:text-white" />
            </a>
          )}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗黑模式'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-white" />
            ) : (
              <Moon size={18} className="text-apple-dark" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
