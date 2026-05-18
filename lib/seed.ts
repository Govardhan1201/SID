/**
 * Prisma-based seed script.
 * Run with:  npx ts-node --project tsconfig.json -e "import('./lib/seed').then(m => m.seedDatabase())"
 * Or via:   npx prisma db seed   (configure in package.json "prisma.seed")
 *
 * This seeds a minimal admin user and a handful of demo students so the
 * platform is usable immediately after a fresh database migration.
 */

import { prisma } from './prisma';
import { hashPassword } from './security';

const past = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000);

export async function seedDatabase(): Promise<void> {
  // ── Admin ─────────────────────────────────────────────────────────────────
  const adminHash = await hashPassword('Admin@123');
  await prisma.user.upsert({
    where: { email: 'admin@ideaforge.dev' },
    update: {},
    create: {
      id: 'admin-001',
      email: 'admin@ideaforge.dev',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
      isBanned: false,
      createdAt: past(120),
      updatedAt: past(1),
    },
  });

  // ── Demo students ──────────────────────────────────────────────────────────
  const students = [
    { id: 's-001', name: 'Aryan Mehta',   email: 'aryan@student.com',  college: 'IIT Bombay',  branch: 'CSE', year: 3 },
    { id: 's-002', name: 'Priya Sharma',  email: 'priya@student.com',  college: 'NIT Trichy',  branch: 'ECE', year: 2 },
    { id: 's-003', name: 'Karan Patel',   email: 'karan@student.com',  college: 'BITS Pilani', branch: 'CS',  year: 4 },
  ];

  const studentHash = await hashPassword('Student@123');

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: s.id,
        email: s.email,
        passwordHash: studentHash,
        role: 'student',
        isVerified: true,
        isBanned: false,
        createdAt: past(90),
        updatedAt: past(5),
        studentProfile: {
          create: {
            name: s.name,
            avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(s.name)}&backgroundColor=6366f1&textColor=ffffff`,
            college: s.college,
            branch: s.branch,
            year: s.year,
          },
        },
      },
    });
  }

  console.log('✅ Seed complete');
}

// Allow running directly: node -r ts-node/register lib/seed.ts
if (require.main === module) {
  seedDatabase()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
