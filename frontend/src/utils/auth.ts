export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join('');
}

export function generateExpiry(hours = 2): number {
  return Date.now() + hours * 60 * 60 * 1000;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validateUsername(input: string): string | null {
  const cleaned = input.trim();
  if (cleaned.length < 1) return '请输入用户名';
  if (cleaned.length > 50) return '用户名不能超过 50 个字符';
  return null;
}

export function validatePassword(input: string, isAdmin = false): string | null {
  if (input.length < 4) return '密码至少需要 4 个字符';
  if (input.length > 128) return '密码不能超过 128 个字符';

  if (isAdmin) {
    // 管理员密码要求适当降低，确保用户指定的密码可以通过
    if (input.length < 6) return '管理员密码至少需要 6 个字符';
  }

  return null;
}

const RATE_LIMIT_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 1000;

interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

export function checkRateLimit(clientKey: string): { allowed: boolean; remaining: number; waitSeconds: number } {
  try {
    const stored = localStorage.getItem(`${RATE_LIMIT_KEY}_${clientKey}`);
    let record: RateLimitRecord = stored
      ? JSON.parse(stored)
      : { attempts: 0, firstAttempt: Date.now(), lockedUntil: 0 };

    if (record.lockedUntil > Date.now()) {
      return {
        allowed: false,
        remaining: 0,
        waitSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000),
      };
    }

    if (Date.now() - record.firstAttempt > LOCKOUT_DURATION) {
      record = { attempts: 0, firstAttempt: Date.now(), lockedUntil: 0 };
    }

    const remaining = MAX_ATTEMPTS - record.attempts;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining), waitSeconds: 0 };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS, waitSeconds: 0 };
  }
}

export function recordLoginAttempt(clientKey: string, success: boolean): void {
  try {
    const key = `${RATE_LIMIT_KEY}_${clientKey}`;
    const stored = localStorage.getItem(key);
    let record: RateLimitRecord = stored
      ? JSON.parse(stored)
      : { attempts: 0, firstAttempt: Date.now(), lockedUntil: 0 };

    if (Date.now() - record.firstAttempt > LOCKOUT_DURATION) {
      record = { attempts: 0, firstAttempt: Date.now(), lockedUntil: 0 };
    }

    if (success) {
      record.attempts = 0;
      record.lockedUntil = 0;
    } else {
      record.attempts++;
      if (record.attempts >= MAX_ATTEMPTS) {
        record.lockedUntil = Date.now() + LOCKOUT_DURATION;
      }
    }

    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // ignore localStorage errors
  }
}

export function resetRateLimit(clientKey: string): void {
  try {
    localStorage.removeItem(`${RATE_LIMIT_KEY}_${clientKey}`);
  } catch {
    // ignore
  }
}