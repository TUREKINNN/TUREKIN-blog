export type UserRole = 'admin' | 'visitor' | 'guest';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  displayName: string;
  avatar: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export type LoginError =
  | 'USER_NOT_FOUND'
  | 'WRONG_PASSWORD'
  | 'ACCOUNT_LOCKED'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'USERNAME_TAKEN';

export const LOGIN_ERROR_MESSAGES: Record<LoginError, string> = {
  USER_NOT_FOUND: '账号不存在，请检查用户名是否正确',
  WRONG_PASSWORD: '密码错误，请重新输入',
  ACCOUNT_LOCKED: '账号已被锁定，请稍后再试或联系管理员',
  RATE_LIMITED: '登录尝试过于频繁，请等待 60 秒后再试',
  VALIDATION_ERROR: '登录请求失败，请确保后端服务器正在运行',
  INSUFFICIENT_PERMISSIONS: '权限不足，无法执行此操作',
  USERNAME_TAKEN: '该用户名已被注册，请更换用户名',
};