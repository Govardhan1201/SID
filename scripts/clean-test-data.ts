/**
 * IdeaForge — Test Data Cleanup Script
 * Deletes all non-admin users and their associated data.
 * Preserves ALL users with role='admin'.
 *
 * Run with:  npx ts-node -e "require('./scripts/clean-test-data')"
 * OR:        npx tsx scripts/clean-test-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // List all users
  const allUsers = await prisma.user.findMany({ orderBy: { role: 'asc' } });
  const admins = allUsers.filter(u => u.role === 'admin');
  const nonAdmins = allUsers.filter(u => u.role !== 'admin');

  console.log('\n========================================');
  console.log('  IdeaForge — Test Data Cleanup Script  ');
  console.log('========================================\n');
  console.log(`✅ Admin accounts to PRESERVE (${admins.length}):`);
  admins.forEach(a => console.log(`   • ${a.email} [${a.role}]`));

  console.log(`\n🗑️  Non-admin accounts to DELETE (${nonAdmins.length}):`);
  nonAdmins.forEach(u => console.log(`   • ${u.email} [${u.role}]`));

  if (nonAdmins.length === 0) {
    console.log('\nNothing to delete. Database is already clean.\n');
    return;
  }

  console.log('\n⚠️  WARNING: This will permanently delete all listed accounts and their data.');
  console.log('   Projects, ideas, teams, notifications, and profiles will be removed.\n');

  // Auto-confirm in CI; in interactive mode, wait for env var CONFIRM=yes
  const confirmed = process.env.CONFIRM === 'yes';
  if (!confirmed) {
    console.log('To confirm, rerun with:  CONFIRM=yes npx tsx scripts/clean-test-data.ts\n');
    return;
  }

  const nonAdminIds = nonAdmins.map(u => u.id);

  // Delete related data
  await prisma.project.deleteMany({ where: { authorId: { in: nonAdminIds } } });
  console.log('  Deleted projects');
  await prisma.idea.deleteMany({ where: { authorId: { in: nonAdminIds } } });
  console.log('  Deleted ideas');
  await prisma.team.deleteMany({ where: { leaderId: { in: nonAdminIds } } });
  console.log('  Deleted teams');
  await prisma.notification.deleteMany({ where: { userId: { in: nonAdminIds } } });
  console.log('  Deleted notifications');
  await prisma.studentProfile.deleteMany({ where: { userId: { in: nonAdminIds } } });
  console.log('  Deleted student profiles');
  await prisma.recruiterProfile.deleteMany({ where: { userId: { in: nonAdminIds } } });
  console.log('  Deleted recruiter profiles');
  await prisma.hackathonParticipant.deleteMany({ where: { userId: { in: nonAdminIds } } });
  console.log('  Deleted hackathon participants');

  // Delete the user accounts themselves
  await prisma.user.deleteMany({ where: { id: { in: nonAdminIds } } });
  console.log(`\n✅ Successfully deleted ${nonAdminIds.length} non-admin accounts and all associated data.`);
  console.log(`✅ ${admins.length} admin account(s) preserved.\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
