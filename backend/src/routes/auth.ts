import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import * as authService from '../services/auth.service';
import { AppError } from '../utils/errors';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50),
  password: z.string().min(1, '密码不能为空').max(100),
});

const registerSchema = z.object({
  username: z.string().min(2).max(30),
  password: z.string().min(4, '密码至少4位').max(100),
  displayName: z.string().min(1).max(50),
});

const profileSchema = z.object({
  username: z.string().min(2).max(30).optional(),
  displayName: z.string().min(1).max(50).optional(),
  password: z.string().min(4).max(100).optional(),
  currentPassword: z.string().min(1).max(100).optional(),
});

function setSessionUser(req: Request, userId: number, role: string): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.userId = userId;
    req.session.role = role;
    req.session.save((err: any) => {
      if (err) {
        console.error('[SESSION] Failed to save session to MySQL:', err.message);
        console.error('[SESSION] Check: 1) MySQL is running  2) sessions table exists  3) DB credentials in .env match');
        return reject(err);
      }
      console.log('[SESSION] Session saved: userId=' + userId + ' role=' + role + ' sid=' + (req.sessionID || '?').slice(0, 12) + '...');
      resolve();
    });
  });
}

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const user = await authService.login(username, password);
    await setSessionUser(req, user.id, user.role);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

// ✅ 修复：拆分参数，匹配函数定义
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, displayName } = req.body;
    const user = await authService.registerVisitor(username, password, displayName);
    await setSessionUser(req, user.id, user.role);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.post('/guest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.loginAsGuest();
    await setSessionUser(req, user.id, user.role);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err: any) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ success: true, data: null });
  });
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      return res.json({ success: true, data: null });
    }
    const user = await authService.getMe(req.session.userId);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.get('/admin-profile', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await authService.getAdminProfile();
    res.json({ success: true, data: profile });
  } catch (e) {
    next(e);
  }
});

router.post('/avatar', requireAuth, uploadSingle('avatar'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.session.role === 'guest') {
      throw new AppError(403, 'FORBIDDEN', '游客账户无法修改头像');
    }
    if (!req.file) {
      throw new AppError(400, 'BAD_REQUEST', '请选择图片文件');
    }
    const url = await authService.updateAvatar(req.session.userId!, req.file.path);
    res.json({ success: true, data: { avatarUrl: url } });
  } catch (e) {
    next(e);
  }
});

router.patch('/profile', requireAuth, validate(profileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.session.role === 'guest') {
      throw new AppError(403, 'FORBIDDEN', '游客账户无法修改个人信息');
    }
    const { username, displayName, password, currentPassword } = req.body;
    const user = await authService.updateProfile(req.session.userId!, { username, displayName, password, currentPassword });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

export default router;