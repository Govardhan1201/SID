require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'aryan@student.com' }});
    console.log("Found student:", user ? user.email : "No");

    const valid = await bcrypt.compare('Student@123', user.passwordHash);
    console.log("Password valid:", valid);

    const JWT_SECRET = new TextEncoder().encode('super-secret-development-key-change-in-production');
    
    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
      
    console.log("Generated token length:", token.length);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}
main();
