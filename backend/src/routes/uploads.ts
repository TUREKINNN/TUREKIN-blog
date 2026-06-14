import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { requireAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { uploadSingle } from '../middleware/upload';
import * as uploadService from '../services/upload.service';
import { AppError } from '../utils/errors';

const router = Router();

router.post('/article-image', requireAuth, adminOnly, uploadSingle('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'BAD_REQUEST', '请选择图片文件');
    }
    const filename = path.basename(req.file.path);
    const url = `/uploads/articles/${filename}`;
    res.json({ success: true, data: { url } });
  } catch (e) { next(e); }
});

router.post('/background', requireAuth, adminOnly, uploadSingle('background'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'BAD_REQUEST', '请选择图片文件');
    }
    const item = await uploadService.uploadBackground(
      req.file.path,
      req.file.originalname,
      req.file.size,
    );
    res.status(201).json({ success: true, data: item });
  } catch (e) { next(e); }
});

export default router;