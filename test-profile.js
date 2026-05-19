require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'aryan@student.com' }});
    console.log('user:', user);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id }});
    console.log('profile:', profile);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}
main();
