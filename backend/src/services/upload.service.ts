import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import type { BackgroundItem, SiteConfig } from '../types';
const MAX_BACKGROUNDS = 9;

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

function deleteFile(filePath: string): void {
  const fullPath = path.resolve(filePath);
  if (!fullPath.startsWith(UPLOAD_DIR)) return;
  fs.unlink(fullPath, () => {});
}

export async function listBackgrounds(): Promise<BackgroundItem[]> {
  const items = await prisma.backgroundImage.findMany({
    orderBy: { uploadedAt: 'desc' },
  });
  return items.map((i: any) => ({
    id: i.id,
    filePath: i.filePath.replace(/\\/g, '/'),
    url: '/' + i.filePath.replace(/\\/g, '/').replace(/^uploads[\/\\]?/, 'uploads/'),
    name: i.originalName || '未命名',
    size: Number(i.sizeBytes) || 0,
    sizeBytes: Number(i.sizeBytes),
    originalName: i.originalName,
    uploadedAt: i.uploadedAt instanceof Date ? i.uploadedAt.toISOString() : String(i.uploadedAt),
  }));
}

export async function uploadBackground(filePath: string, originalName: string, sizeBytes: number): Promise<BackgroundItem> {
  const count = await prisma.backgroundImage.count();
  if (count >= MAX_BACKGROUNDS) {
    const oldest = await prisma.backgroundImage.findFirst({ orderBy: { uploadedAt: 'asc' } });
    if (oldest) {
      deleteFile(oldest.filePath);
      await prisma.backgroundImage.delete({ where: { id: oldest.id } });
    }
  }

  const item = await prisma.backgroundImage.create({
    data: { filePath: filePath.replace(/\\/g, '/'), originalName, sizeBytes },
  });
  return {
    id: item.id,
    filePath: item.filePath,
    url: '/' + item.filePath.replace(/\\/g, '/').replace(/^uploads[\/\\]?/, 'uploads/'),
    name: item.originalName || '未命名',
    size: Number(item.sizeBytes) || 0,
    sizeBytes: Number(item.sizeBytes),
    originalName: item.originalName,
    uploadedAt: item.uploadedAt instanceof Date ? item.uploadedAt.toISOString() : String(item.uploadedAt),
  };
}

export async function deleteBackground(id: number): Promise<void> {
  const item = await prisma.backgroundImage.findUnique({ where: { id } });
  if (!item) return;
  deleteFile(item.filePath);
  await prisma.backgroundImage.delete({ where: { id } });
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const row = await prisma.siteConfig.findUnique({ where: { configKey: 'carousel' } });
  if (!row) return { carouselEnabled: false, carouselInterval: 5, carouselImageIds: [], currentBackgroundId: null };
  return row.configValue as unknown as SiteConfig;
}

export async function updateSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  await prisma.siteConfig.upsert({
    where: { configKey: 'carousel' },
    create: { configKey: 'carousel', configValue: config as any },
    update: { configValue: config as any },
  });
  return config;
}

export async function getTags(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    select: { tags: true },
  });
  const tagSet = new Set<string>();
  for (const a of articles) {
    const tags = Array.isArray(a.tags) ? a.tags : [];
    tags.forEach((t: any) => { if (t) tagSet.add(String(t)); });
  }
  return Array.from(tagSet).sort();
}

export async function getAboutConfig(): Promise<Record<string, string>> {
  const row = await prisma.siteConfig.findUnique({ where: { configKey: 'about' } });
  if (!row) return {};
  return row.configValue as unknown as Record<string, string>;
}

export async function updateAboutConfig(config: Record<string, string>): Promise<Record<string, string>> {
  // 先读取现有配置，合并后再写入，防止覆盖其他字段
  const existing = await getAboutConfig();
  const merged = { ...existing, ...config };
  await prisma.siteConfig.upsert({
    where: { configKey: 'about' },
    create: { configKey: 'about', configValue: merged as any },
    update: { configValue: merged as any },
  });
  return merged;
}