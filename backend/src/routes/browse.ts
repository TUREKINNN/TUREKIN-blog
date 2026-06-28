import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { recordBrowseSession, getArticleBrowseStats } from '../services/browse.service';

const router = Router();

const browseSchema = z.object({
  articleId: z.number().int().positive(),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive(),
  durationMs: z.number().int().min(100).max(7200000),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = browseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }
    const { articleId, startTime, endTime, durationMs } = parsed.data;
    const valid = endTime >= startTime && durationMs === endTime - startTime;
    if (!valid) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '时间数据不一致' } });
      return;
    }
    const userId = req.session?.userId || null;
    const sessionId = req.sessionID || 'unknown';
    const record = await recordBrowseSession({ articleId, userId, sessionId, startTime, endTime, durationMs });
    res.json({ success: true, data: record });
  } catch (e) {
    next(e);
  }
});

router.get('/article/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = parseInt(req.params.id, 10);
    if (isNaN(articleId)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的文章ID' } });
      return;
    }
    const stats = await getArticleBrowseStats(articleId);
    res.json({ success: true, data: stats });
  } catch (e) {
    next(e);
  }
});

export default router;
