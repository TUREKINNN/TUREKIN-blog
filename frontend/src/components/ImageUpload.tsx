import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (dataUrl: string) => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '仅支持 JPEG、PNG、WebP、GIF 格式的图片';
    }
    if (file.size > MAX_SIZE) {
      return `图片大小不能超过 ${MAX_SIZE / 1024 / 1024}MB`;
    }
    return null;
  }, []);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onImageUpload(dataUrl);
      };
      reader.onerror = () => {
        setError('图片读取失败，请重试');
      };
      reader.readAsDataURL(file);
    },
    [validateFile, onImageUpload],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (e.target) e.target.value = '';
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-3">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center
            cursor-pointer transition-all duration-200 ease-in-out
            ${isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            aria-label="上传图片"
          />
          <Upload
            size={32}
            className={`mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            点击或拖拽图片到此处上传
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            支持 JPEG、PNG、WebP、GIF，最大 10MB
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={preview}
            alt="上传预览"
            className="w-full h-auto max-h-64 object-cover"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="移除图片"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
            <ImageIcon size={12} />
            <span>已上传</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}