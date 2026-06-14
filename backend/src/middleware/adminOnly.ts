import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../utils/errors';

export function adminOnly(req: Request, _res: Response, next: NextFunction): void {
  if (req.session?.role !== 'admin') {
    return next(forbidden('需要管理员权限'));
  }
  next();
}