import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { AppError } from '../utils/errors';

const router = Router();

// GET /api/friendlinks - public
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const links = await prisma.friendLink.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ success: true, data: links });
  } catch (e) { next(e); }
});

// POST /api/friendlinks - admin only
router.post('/', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, url, avatarUrl, description } = req.body;
    if (!name || !url || !avatarUrl || !description) {
      throw new AppError(400, 'VALIDATION', '请填写完整的友链信息');
    }
    const link = await prisma.friendLink.create({ data: { name, url, avatarUrl, description } });
    res.status(201).json({ success: true, data: link });
  } catch (e) { next(e); }
});

// PUT /api/friendlinks/:id - admin only
router.put('/:id', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError(400, 'VALIDATION', '无效的友链 ID');
    const { name, url, avatarUrl, description } = req.body;
    if (!name || !url || !avatarUrl || !description) {
      throw new AppError(400, 'VALIDATION', '请填写完整的友链信息');
    }
    const link = await prisma.friendLink.update({ where: { id }, data: { name, url, avatarUrl, description } });
    res.json({ success: true, data: link });
  } catch (e) { next(e); }
});

// DELETE /api/friendlinks/:id - admin only
router.delete('/:id', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError(400, 'VALIDATION', '无效的友链 ID');
    await prisma.friendLink.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
