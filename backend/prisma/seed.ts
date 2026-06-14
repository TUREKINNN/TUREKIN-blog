import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    console.error('❌ 请设置环境变量 ADMIN_SEED_PASSWORD');
    process.exit(1);
  }
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { username: 'TUREKIN' },
    update: {
      passwordHash: adminHash,
    },
    create: {
      username: 'TUREKIN',
      passwordHash: adminHash,
      role: 'admin',
      displayName: 'TUREKIN',
      avatarUrl: '/uploads/avatars/root.png',
    },
  });

  console.log(`Admin user created: ${admin.username} (id: ${admin.id})`);

  await prisma.siteConfig.upsert({
    where: { configKey: 'carousel' },
    update: {},
    create: {
      configKey: 'carousel',
      configValue: {
        carouselEnabled: false,
        carouselInterval: 5,
        carouselImageIds: [],
        currentBackgroundId: null,
      },
    },
  });

  console.log('Default site config created');

  // Seed initial friend link
  await prisma.friendLink.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'osu！TV',
      url: 'https://zureeallv.com',
      avatarUrl: 'https://zureeallv.com/_astro/avatar.JZmYovap_3COLd.webp',
      description: '好想玩OSU！—— zureealLV 的个人博客',
    },
  });

  console.log('Default friend link created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });