import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('正在修复旧头像路径...');

  const result = await prisma.user.updateMany({
    where: {
      avatarUrl: {
        in: ['/uploads/avatars/root.png', '/uploads/avatars/user.png', '/uploads/avatars/visitor.png'],
      },
    },
    data: {
      avatarUrl: null,
    },
  });

  console.log(`已更新 ${result.count} 条用户记录，将旧头像路径重置为 null`);

  const result2 = await prisma.user.updateMany({
    where: {
      role: 'admin',
      avatarUrl: null,
    },
    data: {
      avatarUrl: '/avatar/root.png',
    },
  });

  console.log(`已为 ${result2.count} 个管理员设置默认头像`);

  const result3 = await prisma.user.updateMany({
    where: {
      role: 'visitor',
      avatarUrl: null,
    },
    data: {
      avatarUrl: '/avatar/user.png',
    },
  });

  console.log(`已为 ${result3.count} 个访问者设置默认头像`);

  console.log('头像路径修复完成');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
