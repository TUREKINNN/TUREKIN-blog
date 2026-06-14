import { useState, useCallback, useRef } from 'react';
import { Download } from 'lucide-react';
import LazyImage from '@/components/LazyImage';

interface HoverPreviewProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  showDownload?: boolean;
}

export default function HoverPreview({ src, alt, className = '', onClick, showDownload = true }: HoverPreviewProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    timeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const previewWidth = 400;
      const previewHeight = 300;
      const padding = 20;

      let x = e.clientX + padding;
      let y = e.clientY + padding;

      if (x + previewWidth > window.innerWidth) {
        x = e.clientX - previewWidth - padding;
      }
      if (y + previewHeight > window.innerHeight) {
        y = e.clientY - previewHeight - padding;
      }

      setPos({ x, y });
      setShow(true);
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShow(false);
  }, []);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = alt || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    }
  }, [src, alt]);

  return (
    <div className={`relative inline-block group/img ${className}`}>
      <div
        ref={containerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      >
        <LazyImage
          src={src}
          alt={alt}
          className="w-full h-auto rounded-xl cursor-pointer transition-transform duration-200 ease-in-out hover:scale-[1.02]"
        />
      </div>

      {showDownload && (
        <button
          onClick={handleDownload}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/70 z-10"
          aria-label="下载图片"
          title="下载图片"
        >
          <Download size={14} />
        </button>
      )}

      {show && (
        <div
          className="hover-preview-portal fixed z-[100] rounded-2xl overflow-hidden shadow-2xl border border-white/20"
          style={{
            left: pos.x,
            top: pos.y,
            width: 400,
            height: 300,
          }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
