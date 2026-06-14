import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import * as articleService from '../services/article.service';
import prisma from '../lib/prisma';
import commentsRouter from './comments';

const router = Router();

const articleSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
  coverImage: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  readTime: z.number().int().min(1).max(120).default(5),
  category: z.string().max(50).nullable().optional(),
});

const updateSchema = articleSchema.partial();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const tag = req.query.tag as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await articleService.listArticles(page, tag, search, req.session?.userId);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.get('/dates', async (_req, res) => {
  try {
    const articles = await prisma.article.findMany({
      select: { id: true, title: true, publishDate: true },
      orderBy: { publishDate: 'desc' },
    });
    const result = articles.map(a => {
      const d = a.publishDate instanceof Date ? a.publishDate : new Date(a.publishDate);
      return { id: a.id, title: a.title, date: d.toISOString().split('T')[0] };
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[articles] GET /dates error:', err);
    res.status(500).json({ success: false, error: { message: '获取日期列表失败' } });
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的 ID' } }); return; }
    const userId = req.session?.userId;
    const article = await articleService.getArticle(id, userId);
    res.json({ success: true, data: article });
  } catch (e) { next(e); }
});

router.post('/', requireAuth, adminOnly, validate(articleSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await articleService.createArticle({ ...req.body, authorId: req.session.userId! });
    res.status(201).json({ success: true, data: article });
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, adminOnly, validate(updateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const article = await articleService.updateArticle(id, req.body);
    res.json({ success: true, data: article });
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await articleService.deleteArticle(id);
    res.json({ success: true, data: null });
  } catch (e) { next(e); }
});

router.patch('/:id/pin', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const pinned = await articleService.togglePinArticle(id);
    res.json({ success: true, data: { pinned } });
  } catch (e) { next(e); }
});

router.post('/:id/like', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await articleService.toggleArticleLike(id, req.session.userId!);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.use('/:id/comments', commentsRouter);

export default router;