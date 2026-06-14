import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import * as uploadService from '../services/upload.service';

const router = Router();

const configSchema = z.object({
  carouselEnabled: z.boolean().optional(),
  carouselInterval: z.number().int().min(2).max(60).optional(),
  currentBackgroundId: z.number().int().nullable().optional(),
  carouselImageIds: z.array(z.number().int()).optional(),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await uploadService.getSiteConfig();
    res.json({ success: true, data: config });
  } catch (e) { next(e); }
});

router.put('/', requireAuth, adminOnly, validate(configSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await uploadService.updateSiteConfig(req.body);
    res.json({ success: true, data: config });
  } catch (e) { next(e); }
});

router.get('/about', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await uploadService.getAboutConfig();
    res.json({ success: true, data: config });
  } catch (e) { next(e); }
});

const aboutSchema = z.record(z.string().max(5000));

router.put('/about', requireAuth, adminOnly, validate(aboutSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await uploadService.updateAboutConfig(req.body);
    res.json({ success: true, data: config });
  } catch (e) { next(e); }
});

export default router;