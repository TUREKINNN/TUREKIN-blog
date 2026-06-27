import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

['avatars', 'backgrounds', 'articles'].forEach((subdir) => {
  fs.mkdirSync(path.join(UPLOAD_DIR, subdir), { recursive: true });
});

function destination(_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, dest: string) => void) {
  let subdir = 'articles';
  if (file.fieldname === 'avatar') subdir = 'avatars';
  else if (file.fieldname === 'background') subdir = 'backgrounds';
  cb(null, path.join(UPLOAD_DIR, subdir));
}

function filename(_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, name: string) => void) {
  const ext = path.extname(file.originalname).toLowerCase();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  cb(null, name);
}

const storage = multer.diskStorage({ destination, filename });

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持 JPG/PNG/WebP/GIF 格式的图片'));
  }
}

export const uploadSingle = (fieldName: string) =>
  multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 },
  }).single(fieldName);