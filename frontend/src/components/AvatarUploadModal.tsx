import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Image, AlertCircle, Check, Maximize2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AvatarUploadModalProps {
  open: boolean;
  onClose: () => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MIN_SIZE = 200 * 1024;
const MAX_SIZE = 1024 * 1024;
const AVATAR_SIZE = 200;

type Stage = 'select' | 'preview' | 'processing' | 'success';

function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas 初始化失败')); return; }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        const sx = (img.width - Math.min(img.width, img.height)) / 2;
        const sy = (img.height - Math.min(img.width, img.height)) / 2;
        const size = Math.min(img.width, img.height);

        ctx.drawImage(img, sx, sy, size, size, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (dataUrl.length > maxSize && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export default function AvatarUploadModal({ open, onClose }: AvatarUploadModalProps) {
  const { user, updateAvatar } = useAuth();
  const [stage, setStage] = useState<Stage>('select');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setStage('select');
      setFile(null);
      setPreviewUrl(null);
      setProcessedUrl(null);
      setError(null);
      setProgress(0);
      setDragOver(false);
    }
  }, [open]);

  const validateFile = useCallback((f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return '不支持的格式，仅支持 JPG、PNG、WebP、GIF';
    }
    if (f.size < MIN_SIZE) {
      return `文件太小（${(f.size / 1024).toFixed(0)}KB），请上传至少 200KB 的图片以保证清晰度`;
    }
    if (f.size > MAX_SIZE) {
      return `文件太大（${(f.size / 1024 / 1024).toFixed(1)}MB），请上传小于 1MB 的图片`;
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setStage('preview');
  }, [validateFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setStage('processing');
    setProgress(30);

    try {
      const compressed = await compressImage(file, MAX_SIZE);
      setProgress(70);
      setProcessedUrl(compressed);
      setProgress(90);

      const success = await updateAvatar(file);
      setProgress(100);

      if (success) {
        setTimeout(() => {
          setStage('success');
        }, 400);
      } else {
        setError('上传失败，请重试');
        setStage('preview');
      }
    } catch {
      setError('图片处理失败，请重试');
      setStage('preview');
    }
  }, [file, updateAvatar]);

  const handleReSelect = useCallback(() => {
    setStage('select');
    setFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setError(null);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-apple-dark-card rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Image size={18} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-apple-dark dark:text-white">
              {stage === 'success' ? '头像更新成功' : '更换头像'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="关闭"
          >
            <X size={18} className="text-apple-gray dark:text-apple-dark-gray" />
          </button>
        </div>

        <div className="p-5">
          {stage === 'select' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={user?.avatar || '/avatar/user.png'}
                  alt="当前头像"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-lg"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={28} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  点击或拖拽头像图片
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  JPG/PNG/WebP，200KB-1MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleInputChange}
                className="hidden"
              />

              <div className="text-xs text-apple-lightgray dark:text-apple-dark-lightgray space-y-1">
                <p className="font-medium">上传要求：</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>文件大小 200KB - 1MB</li>
                  <li>支持 JPG、PNG、WebP、GIF 格式</li>
                  <li>上传后将自动裁剪为正方形并压缩</li>
                </ul>
              </div>
            </div>
          )}

          {stage === 'preview' && previewUrl && (
            <div className="space-y-4">
              <p className="text-sm text-apple-gray dark:text-apple-dark-gray">
                预览效果
              </p>

              <div className="flex justify-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
                </div>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReSelect}
                  className="flex-1 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  重新选择
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  确认上传
                </button>
              </div>
            </div>
          )}

          {stage === 'processing' && (
            <div className="space-y-3 text-center">
              <div className="animate-spin mx-auto w-10 h-10 border-3 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full" />
              <p className="text-sm text-apple-gray dark:text-apple-dark-gray">
                正在处理图片...
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="space-y-4 text-center">
              {processedUrl && (
                <img
                  src={processedUrl}
                  alt="新头像"
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-200 dark:border-green-800 shadow-lg"
                />
              )}
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                头像更新成功！
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                完成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}