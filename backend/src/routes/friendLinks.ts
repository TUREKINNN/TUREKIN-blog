import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

// GET /api/friendlinks - public
router.get('/', async (_req: Request, res: Response) => {
  try {
    const links = await prisma.friendLink.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: links });
  } catch (err) {
    console.error('[friendLinks] GET error:', err);
    res.status(500).json({ success: false, error: { message: '获取友链列表失败' } });
  }
});

// POST /api/friendlinks - admin only
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, url, avatarUrl, description } = req.body;
    if (!name || !url || !avatarUrl || !description) {
      res.status(400).json({ success: false, error: { message: '请填写完整的友链信息' } });
      return;
    }
    const link = await prisma.friendLink.create({
      data: { name, url, avatarUrl, description },
    });
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    console.error('[friendLinks] POST error:', err);
    res.status(500).json({ success: false, error: { message: '添加友链失败' } });
  }
});

// PUT /api/friendlinks/:id - admin only
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { message: '无效的友链 ID' } });
      return;
    }
    const { name, url, avatarUrl, description } = req.body;
    if (!name || !url || !avatarUrl || !description) {
      res.status(400).json({ success: false, error: { message: '请填写完整的友链信息' } });
      return;
    }
    const link = await prisma.friendLink.update({
      where: { id },
      data: { name, url, avatarUrl, description },
    });
    res.json({ success: true, data: link });
  } catch (err) {
    console.error('[friendLinks] PUT error:', err);
    res.status(500).json({ success: false, error: { message: '更新友链失败' } });
  }
});

// DELETE /api/friendlinks/:id - admin only
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { message: '无效的友链 ID' } });
      return;
    }
    await prisma.friendLink.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[friendLinks] DELETE error:', err);
    res.status(500).json({ success: false, error: { message: '删除友链失败' } });
  }
});

export default router;
