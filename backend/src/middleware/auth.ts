import { Request, Response, NextFunction } from 'express';
import { unauthorized } from '../utils/errors';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    role?: string;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    console.error('[AUTH] 401 denied — hasSession=' + !!req.session + ' userId=' + req.session?.userId + ' sessionID=' + ((req as any).sessionID || 'none').slice(0, 12));
    return next(unauthorized());
  }
  console.log('[AUTH] OK userId=' + req.session.userId + ' role=' + req.session.role);
  next();
}