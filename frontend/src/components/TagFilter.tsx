import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export default function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                   ${activeTag
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                   }`}
        aria-label="筛选标签"
      >
        <Filter size={14} />
        {activeTag || '筛选标签'}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-48 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-64 overflow-y-auto">
          {activeTag && (
            <button
              onClick={() => { onTagChange(null); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-apple-gray dark:text-apple-dark-gray hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              全部标签
            </button>
          )}
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => { onTagChange(tag); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors
                         ${tag === activeTag
                           ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                           : 'text-apple-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                         }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}