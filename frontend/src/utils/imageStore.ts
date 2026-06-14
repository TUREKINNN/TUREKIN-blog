interface StoredImage {
  id: string;
  dataUrl: string;
  name: string;
  uploadedAt: number;
  size: number;
  folder: string;
}

const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

let store: StoredImage[] = [];

function getDateFolder(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getTotalBytes(): number {
  return store.reduce((sum, img) => sum + img.size, 0);
}

export function storeArticleImage(dataUrl: string, name: string, size: number): StoredImage | null {
  if (getTotalBytes() + size > MAX_TOTAL_SIZE) {
    console.warn('[imageStore] 存储空间不足（上限50MB），图片未保存:', name);
    return null;
  }
  const folder = getDateFolder();
  const img: StoredImage = {
    id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    dataUrl,
    name,
    uploadedAt: Date.now(),
    size,
    folder,
  };
  store.push(img);
  return img;
}

export function getArticleImages(): StoredImage[] {
  return store;
}

export function getArticleImagesByFolder(folder: string): StoredImage[] {
  return store.filter((img) => img.folder === folder);
}

export function getArticleImageFolders(): string[] {
  const folders = new Set(store.map((img) => img.folder));
  return Array.from(folders).sort().reverse();
}

export function deleteArticleImage(id: string): boolean {
  const idx = store.findIndex((img) => img.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function cleanupArticleImages(keepIds: Set<string>): number {
  const before = store.length;
  store = store.filter((img) => keepIds.has(img.id));
  return before - store.length;
}

export function getTotalImageSize(): { count: number; bytes: number } {
  return {
    count: store.length,
    bytes: getTotalBytes(),
  };
}
