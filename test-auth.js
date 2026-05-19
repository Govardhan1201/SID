require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@ideaforge.dev' }});
    console.log("Admin User:", user);
    if(user) {
      const valid = await bcrypt.compare('Admin@123', user.passwordHash);
      console.log('Admin password Admin@123 valid:', valid);
    }

    const student = await prisma.user.findUnique({ where: { email: 'aryan@student.com' }});
    if(student) {
      const valid2 = await bcrypt.compare('Student@123', student.passwordHash);
      console.log('Student password Student@123 valid:', valid2);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}
main();
