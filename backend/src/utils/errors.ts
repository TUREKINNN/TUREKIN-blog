export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function badRequest(message: string): AppError {
  return new AppError(400, 'BAD_REQUEST', message);
}

export function unauthorized(message = '请先登录'): AppError {
  return new AppError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message = '权限不足'): AppError {
  return new AppError(403, 'FORBIDDEN', message);
}

export function notFound(message = '资源不存在'): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function conflict(message: string): AppError {
  return new AppError(409, 'CONFLICT', message);
}

export function tooMany(message = '请求过于频繁'): AppError {
  return new AppError(429, 'TOO_MANY_REQUESTS', message);
}