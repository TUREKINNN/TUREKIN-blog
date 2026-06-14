import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

prisma.$connect()
  .then(() => console.log('[OK] Database connected (pool: connection_limit=5, pool_timeout=10)'))
  .catch((e) => {
    console.error('[FAIL] Database connection error:', e.message);
    console.error('[FAIL] Stack:', e.stack);
  });

prisma.$on('error' as never, (e: any) => {
  console.error('[PRISMA] Runtime error:', e?.message || e);
});

process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] Closing database connections...');
  await prisma.$disconnect();
  console.log('[SHUTDOWN] Database disconnected');
});

process.on('SIGINT', async () => {
  console.log('[SHUTDOWN] Closing database connections...');
  await prisma.$disconnect();
  console.log('[SHUTDOWN] Database disconnected');
});

export default prisma;