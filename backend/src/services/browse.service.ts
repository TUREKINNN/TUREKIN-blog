import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';

const DATA_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads', '../data');
const FILE_PATH = path.join(DATA_DIR, 'browse_sessions.json');

interface BrowseRecord {
  id: number;
  articleId: number;
  userId: number | null;
  sessionId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  recordedAt: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSessions(): BrowseRecord[] {
  ensureDataDir();
  if (!fs.existsSync(FILE_PATH)) return [];
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: BrowseRecord[]): void {
  ensureDataDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(sessions, null, 2), 'utf-8');
}

export async function recordBrowseSession(params: {
  articleId: number;
  userId: number | null;
  sessionId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
}): Promise<BrowseRecord> {
  const sessions = readSessions();
  const record: BrowseRecord = {
    id: sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) + 1 : 1,
    articleId: params.articleId,
    userId: params.userId,
    sessionId: params.sessionId,
    startTime: params.startTime,
    endTime: params.endTime,
    durationMs: params.durationMs,
    recordedAt: new Date().toISOString(),
  };
  sessions.push(record);
  if (sessions.length > 10000) {
    sessions.splice(0, sessions.length - 10000);
  }
  writeSessions(sessions);
  return record;
}

export async function getArticleBrowseStats(articleId: number): Promise<{
  totalSessions: number;
  totalDurationMs: number;
  avgDurationMs: number;
}> {
  const sessions = readSessions().filter((s) => s.articleId === articleId);
  const totalDurationMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  return {
    totalSessions: sessions.length,
    totalDurationMs,
    avgDurationMs: sessions.length > 0 ? Math.round(totalDurationMs / sessions.length) : 0,
  };
}

export async function getPopularArticles(limit = 5): Promise<Array<{
  articleId: number;
  totalSessions: number;
  totalDurationMs: number;
}>> {
  const sessions = readSessions();
  const map = new Map<number, { sessions: number; duration: number }>();
  for (const s of sessions) {
    const entry = map.get(s.articleId) || { sessions: 0, duration: 0 };
    entry.sessions += 1;
    entry.duration += s.durationMs;
    map.set(s.articleId, entry);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, limit)
    .map(([articleId, data]) => ({
      articleId,
      totalSessions: data.sessions,
      totalDurationMs: data.duration,
    }));
}
