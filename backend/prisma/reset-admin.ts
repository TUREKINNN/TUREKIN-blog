import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.argv[2] || 'TUREKIN';
  const newPassword = process.argv[3] || (() => { console.error('❌ 请提供新密码: npx tsx prisma/reset-admin.ts TUREKIN MyNewPassword@123'); process.exit(1); })();

  console.log(`🔑 正在重置管理员密码...`);
  console.log(`   用户名: ${adminUsername}`);
  console.log(`   新密码: ${newPassword}`);
  console.log();

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash,
    },
    create: {
      username: adminUsername,
      passwordHash,
      role: 'admin',
      displayName: adminUsername,
      avatarUrl: '/uploads/avatars/root.png',
    },
  });

  console.log('✅ 成功！');
  console.log(`   管理员用户 ID: ${admin.id}`);
  console.log(`   用户名: ${admin.username}`);
  console.log(`   角色: ${admin.role}`);
  console.log();
  console.log('📝 使用方式:');
  console.log('   npx tsx prisma/reset-admin.ts [用户名] [新密码]');
  console.log('   例如: npx tsx prisma/reset-admin.ts TUREKIN MyNewPassword@123');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
