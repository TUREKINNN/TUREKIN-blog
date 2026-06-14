import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

// GET /api/music - public list
router.get('/', async (_req, res) => {
  try {
    const songs = await prisma.music.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: songs });
  } catch (err) {
    console.error('[music] GET error:', err);
    res.status(500).json({ success: false, error: { message: '获取音乐列表失败' } });
  }
});

// POST /api/music - admin add song
router.post('/', requireAuth, adminOnly, async (req, res) => {
  try {
    const { title, artist, url, coverUrl, duration } = req.body;
    if (!title || !url) {
      return res.status(400).json({ success: false, error: { message: '标题和音频链接不能为空' } });
    }
    const maxSort = await prisma.music.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
    const song = await prisma.music.create({
      data: { title, artist: artist || '未知艺术家', url, coverUrl: coverUrl || null, duration: duration || 0, sortOrder: (maxSort?.sortOrder ?? 0) + 1 },
    });
    res.json({ success: true, data: song });
  } catch (err) {
    console.error('[music] POST error:', err);
    res.status(500).json({ success: false, error: { message: '添加音乐失败' } });
  }
});

// PUT /api/music/:id - admin update
router.put('/:id', requireAuth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { message: '无效 ID' } });
    const { title, artist, url, coverUrl, duration, sortOrder } = req.body;
    const song = await prisma.music.update({
      where: { id },
      data: { ...(title !== undefined && { title }), ...(artist !== undefined && { artist }), ...(url !== undefined && { url }), ...(coverUrl !== undefined && { coverUrl }), ...(duration !== undefined && { duration }), ...(sortOrder !== undefined && { sortOrder }) },
    });
    res.json({ success: true, data: song });
  } catch (err) {
    console.error('[music] PUT error:', err);
    res.status(500).json({ success: false, error: { message: '更新失败' } });
  }
});

// DELETE /api/music/:id - admin delete
router.delete('/:id', requireAuth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { message: '无效 ID' } });
    await prisma.music.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[music] DELETE error:', err);
    res.status(500).json({ success: false, error: { message: '删除失败' } });
  }
});

export default router;
