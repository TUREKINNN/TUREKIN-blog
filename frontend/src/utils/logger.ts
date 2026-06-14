type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, unknown>;
}

const MAX_LOG_ENTRIES = 200;

function persistLog(entry: LogEntry): void {
  try {
    const stored = localStorage.getItem('auth_logs');
    const logs: LogEntry[] = stored ? JSON.parse(stored) : [];
    logs.unshift(entry);
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.length = MAX_LOG_ENTRIES;
    }
    localStorage.setItem('auth_logs', JSON.stringify(logs));
  } catch {
    // ignore
  }
}

function createEntry(level: LogLevel, category: string, message: string, details?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
  };

  const prefix = `[${entry.timestamp}] [${level}] [${category}]`;
  switch (level) {
    case 'ERROR':
      console.error(`${prefix} ${message}`, details || '');
      break;
    case 'WARN':
      console.warn(`${prefix} ${message}`, details || '');
      break;
    case 'SECURITY':
      console.warn(`%c${prefix} ${message}`, 'color: #ff6b6b; font-weight: bold;', details || '');
      break;
    default:
      console.log(`${prefix} ${message}`, details || '');
  }

  persistLog(entry);
  return entry;
}

export const logger = {
  info(category: string, message: string, details?: Record<string, unknown>) {
    return createEntry('INFO', category, message, details);
  },
  warn(category: string, message: string, details?: Record<string, unknown>) {
    return createEntry('WARN', category, message, details);
  },
  error(category: string, message: string, details?: Record<string, unknown>) {
    return createEntry('ERROR', category, message, details);
  },
  security(category: string, message: string, details?: Record<string, unknown>) {
    return createEntry('SECURITY', category, message, details);
  },
  getLogs(level?: LogLevel): LogEntry[] {
    try {
      const stored = localStorage.getItem('auth_logs');
      const logs: LogEntry[] = stored ? JSON.parse(stored) : [];
      return level ? logs.filter((l) => l.level === level) : logs;
    } catch {
      return [];
    }
  },
  clearLogs(): void {
    try {
      localStorage.removeItem('auth_logs');
    } catch {
      // ignore
    }
  },
};