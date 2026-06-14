import { Router, Request, Response, NextFunction } from 'express';
import * as uploadService from '../services/upload.service';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await uploadService.getTags();
    res.json({ success: true, data: tags });
  } catch (e) { next(e); }
});

export default router;