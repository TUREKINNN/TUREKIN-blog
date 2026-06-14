import { useEffect, useCallback } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImagePreview({ src, alt, onClose }: ImagePreviewProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleOpenNewTab = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(src, '_blank');
  }, [src]);

  return (
    <div
      className="image-preview-overlay fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <div
        className="image-preview-content relative max-w-5xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        />
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleOpenNewTab}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="在新标签页打开"
          title="在新标签页打开"
        >
          <ExternalLink size={18} />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="下载图片"
          title="下载图片"
        >
          <Download size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="关闭预览"
          title="关闭预览"
        >
          <X size={20} />
        </button>
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1.5 rounded-full hidden sm:block">
        点击任意位置或按 Esc 关闭
      </p>
    </div>
  );
}
