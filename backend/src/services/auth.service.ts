import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { hashPassword, comparePassword } from '../utils/password';
import { unauthorized, conflict } from '../utils/errors';
import type { UserInfo } from '../types';

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

export async function registerVisitor(username: string, password: string, displayName: string): Promise<UserInfo> {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw conflict('用户名已存在');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, displayName, role: 'visitor', avatarUrl: '/avatar/user.png' },
  });
  return toUserInfo(user);
}

export async function login(username: string, password: string): Promise<UserInfo> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw unauthorized('用户名或密码错误');
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw unauthorized('用户名或密码错误');
  return toUserInfo(user);
}

export async function loginAsGuest(): Promise<UserInfo> {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  const user = await prisma.user.create({
    data: {
      username: guestId,
      passwordHash: '',
      role: 'guest',
      displayName: `游客_${guestId.slice(-4)}`,
      avatarUrl: '/avatar/visitor.png',
    },
  });
  return toUserInfo(user);
}

export async function getMe(userId: number): Promise<UserInfo> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw unauthorized('用户不存在');
  return toUserInfo(user);
}

export async function getAdminProfile(): Promise<UserInfo | null> {
  const admin = await prisma.user.findFirst({
    where: { role: 'admin' },
    orderBy: { id: 'asc' },
  });
  if (!admin) return null;
  return toUserInfo(admin);
}

// ✅ 已修复：头像路径正确生成
export async function updateAvatar(userId: number, filePath: string): Promise<string> {
  // 获取用户名用于文件命名
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true, avatarUrl: true } });
  if (!user) throw new Error('用户不存在');

  const ext = path.extname(filePath); // 保留原扩展名
  const avatarDir = path.join(UPLOAD_DIR, 'avatars');
  const newFilename = `${user.username}${ext}`;
  const newPath = path.join(avatarDir, newFilename);

  // 删除旧头像（如果是 uploads 目录下的自定义头像）
  if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
    const oldFilename = user.avatarUrl.replace('/uploads/avatars/', '');
    // 如果旧文件名和新文件名不同才删（防止同名覆盖时报错）
    if (oldFilename !== newFilename) {
      const oldPath = path.join(avatarDir, oldFilename);
      fs.unlink(oldPath, () => {});
    }
  }

  // 重命名为用户名格式
  fs.renameSync(filePath, newPath);

  const url = `/uploads/avatars/${newFilename}`;
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } });
  return url;
}

export async function getUserAvatar(userId: number): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
  return user?.avatarUrl || null;
}

export async function verifyPassword(userId: number, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) return false;
  return comparePassword(password, user.passwordHash);
}

export async function updateProfile(
  userId: number,
  data: { username?: string; displayName?: string; password?: string; currentPassword?: string },
): Promise<UserInfo> {
  const updateData: any = {};

  if (data.password?.trim()) {
    if (data.password.length < 4) throw unauthorized('密码至少4位');
    if (!data.currentPassword?.trim()) {
      throw unauthorized('修改密码需要输入当前密码');
    }
    const valid = await verifyPassword(userId, data.currentPassword);
    if (!valid) throw unauthorized('当前密码不正确');
  }

  if (data.username?.trim()) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing && existing.id !== userId) throw conflict('用户名已存在');
    updateData.username = data.username.trim();
  }
  if (data.displayName?.trim()) {
    updateData.displayName = data.displayName.trim();
  }
  if (data.password?.trim()) {
    updateData.passwordHash = await hashPassword(data.password);
  }
  const user = await prisma.user.update({ where: { id: userId }, data: updateData });
  return toUserInfo(user);
}

function toUserInfo(user: { id: number; username: string; role: string; displayName: string; avatarUrl: string | null }): UserInfo {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}