import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import * as commentService from '../services/comment.service';

const router = Router({ mergeParams: true });

const commentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(2000),
  parentId: z.number().int().positive().optional(),
});

const editCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(2000),
});

router.post('/', requireAuth, validate(commentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId = parseInt(req.params.id);
    if (isNaN(articleId)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的文章 ID' } });
      return;
    }
    const { content, parentId } = req.body;
    const comment = await commentService.addComment(articleId, req.session.userId!, content, parentId);
    res.status(201).json({ success: true, data: comment });
  } catch (e) { next(e); }
});

router.delete('/:commentId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的评论 ID' } });
      return;
    }
    await commentService.deleteComment(commentId, req.session.userId!, req.session.role!);
    res.json({ success: true, data: null });
  } catch (e) { next(e); }
});

router.patch('/:commentId', requireAuth, validate(editCommentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的评论 ID' } });
      return;
    }
    const comment = await commentService.updateComment(commentId, req.session.userId!, req.body.content.trim());
    res.json({ success: true, data: comment });
  } catch (e) { next(e); }
});

router.patch('/:commentId/pin', requireAuth, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的评论 ID' } });
      return;
    }
    const pinned = await commentService.togglePinComment(commentId);
    res.json({ success: true, data: { pinned } });
  } catch (e) { next(e); }
});

router.post('/:commentId/like', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '无效的评论 ID' } });
      return;
    }
    const liked = await commentService.toggleCommentLike(commentId, req.session.userId!);
    res.json({ success: true, data: { liked } });
  } catch (e) { next(e); }
});

export default router;