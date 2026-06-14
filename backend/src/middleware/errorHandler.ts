import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function globalErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err.name === 'MulterError') {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: '文件大小不能超过 10MB',
      LIMIT_FILE_COUNT: '一次只能上传一个文件',
      LIMIT_UNEXPECTED_FILE: '非预期的上传字段',
    };
    const code = err.code || err.message;
    res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: messages[code] || err.message },
    });
    return;
  }

  console.error('[ERROR] Unhandled:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR] Stack:', err.stack);
  }

  res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: '服务器内部错误' },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: '接口不存在' },
  });
}
