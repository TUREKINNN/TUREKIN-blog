import express from 'express';
import session from 'express-session';
import MySQLStore from 'connect-mysql2';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    role?: string;
  }
}

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.length === 0) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS policy does not allow this origin'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

if (!process.env.DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not set in .env');
  console.error('[FATAL] Example: DATABASE_URL="mysql://user:password@localhost:3306/www_turekin_me"');
  process.exit(1);
}
let dbUrl: URL;
try {
  dbUrl = new URL(process.env.DATABASE_URL);
} catch (e: any) {
  console.error('[FATAL] DATABASE_URL is not a valid URL:', process.env.DATABASE_URL);
  console.error('[FATAL] Error:', e.message);
  process.exit(1);
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.warn('[WARN] SESSION_SECRET is too short (< 32 chars) — generate with: openssl rand -hex 32');
}

const store = new (MySQLStore(session))({
  config: {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306', 10),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ''),
  },
  createDatabaseTable: true,
});

const sessionCookieConfig: session.CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.SESSION_SECURE === 'true',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};
if (process.env.SESSION_COOKIE_DOMAIN) {
  sessionCookieConfig.domain = process.env.SESSION_COOKIE_DOMAIN;
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-dev-secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: sessionCookieConfig,
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: '登录尝试过于频繁，请稍后再试' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: '请求过于频繁，请稍后再试' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: '上传过于频繁，请稍后再试' } },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use('/api/auth/guest', loginLimiter);
app.use('/api/uploads', uploadLimiter);
app.use('/api/', apiLimiter);
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', etag: true }));

import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import commentRoutes from './routes/comments';
import uploadRoutes from './routes/uploads';
import configRoutes from './routes/config';
import tagsRoutes from './routes/tags';
import browseRoutes from './routes/browse';
import friendLinkRoutes from './routes/friendLinks';
import musicRoutes from './routes/music';

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/config', configRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/browse', browseRoutes);
app.use('/api/friendlinks', friendLinkRoutes);
app.use('/api/music', musicRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
