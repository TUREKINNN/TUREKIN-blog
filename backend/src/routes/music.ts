import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { AppError } from '../utils/errors';

const router = Router();

// GET /api/music - public list
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const songs = await prisma.music.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ success: true, data: songs });
  } catch (e) { next(e); }
});

// POST /api/music - admin add song
router.post('/', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, artist, audioUrl, coverUrl, duration } = req.body;
    if (!title || !audioUrl) {
      throw new AppError(400, 'VALIDATION', '标题和音频链接不能为空');
    }
    const song = await prisma.music.create({
      data: { title, artist: artist || '未知艺术家', audioUrl, coverUrl: coverUrl || null, duration: duration || 0 },
    });
    res.json({ success: true, data: song });
  } catch (e) { next(e); }
});

// PUT /api/music/:id - admin update
router.put('/:id', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, 'VALIDATION', '无效 ID');
    const { title, artist, audioUrl, coverUrl, duration } = req.body;
    const song = await prisma.music.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(artist !== undefined && { artist }),
        ...(audioUrl !== undefined && { audioUrl }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(duration !== undefined && { duration }),
      },
    });
    res.json({ success: true, data: song });
  } catch (e) { next(e); }
});

// DELETE /api/music/:id - admin delete
router.delete('/:id', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, 'VALIDATION', '无效 ID');
    await prisma.music.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
