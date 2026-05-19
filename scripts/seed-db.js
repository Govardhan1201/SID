require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const now = new Date();
const past = (d) => new Date(Date.now() - d * 86400000);

async function hash(pw) { return bcrypt.hash(pw, 10); }

async function main() {
  console.log('Seeding database...');

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@ideaforge.dev' },
    update: { passwordHash: await hash('Admin@123') },
    create: {
      id: 'admin-001',
      email: 'admin@ideaforge.dev',
      passwordHash: await hash('Admin@123'),
      role: 'admin', isVerified: true, isBanned: false,
      createdAt: past(120), updatedAt: past(1),
    },
  });

  // Students
  const students = [
    { id: 's-001', name: 'Aryan Mehta',  email: 'aryan@student.com', college: 'IIT Bombay',  branch: 'CSE', year: 3, skills: ['React','Node.js','Python','ML'], bio: 'Building things that matter.' },
    { id: 's-002', name: 'Priya Sharma', email: 'priya@student.com', college: 'NIT Trichy',  branch: 'ECE', year: 2, skills: ['Flutter','Firebase','Figma'],     bio: 'Designer who codes.' },
    { id: 's-003', name: 'Karan Patel',  email: 'karan@student.com', college: 'BITS Pilani', branch: 'CS',  year: 4, skills: ['Go','Kubernetes','AWS','Docker'],  bio: 'Infrastructure nerd.' },
    { id: 's-004', name: 'Sneha Verma',  email: 'sneha@student.com', college: 'DTU Delhi',   branch: 'IT',  year: 3, skills: ['Solidity','React','Web3'],         bio: 'Web3 builder.' },
    { id: 's-005', name: 'Rahul Singh',  email: 'rahul@student.com', college: 'IIT Delhi',   branch: 'CSE', year: 2, skills: ['Python','TensorFlow','SQL'],       bio: 'Data person.' },
  ];
  const studentPw = await hash('Student@123');
  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { passwordHash: studentPw },
      create: {
        id: s.id, email: s.email, passwordHash: studentPw,
        role: 'student', isVerified: true, isBanned: false,
        createdAt: past(90), updatedAt: past(5),
        studentProfile: {
          create: {
            name: s.name,
            avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(s.name)}&backgroundColor=6366f1&textColor=ffffff`,
            bio: s.bio, college: s.college, branch: s.branch, year: s.year,
          },
        },
      },
    });
  }

  // Recruiters
  const recruiters = [
    { id: 'r-001', name: 'Neha Kapoor',  email: 'neha@razorpay.com', company: 'Razorpay',  role: 'Engineering Recruiter' },
    { id: 'r-002', name: 'Sanjay Rao',   email: 'sanjay@flipkart.com', company: 'Flipkart', role: 'Talent Acquisition' },
  ];
  const recruiterPw = await hash('Recruiter@123');
  for (const r of recruiters) {
    await prisma.user.upsert({
      where: { email: r.email },
      update: { passwordHash: recruiterPw },
      create: {
        id: r.id, email: r.email, passwordHash: recruiterPw,
        role: 'recruiter', isVerified: true, isBanned: false,
        createdAt: past(60), updatedAt: past(3),
        recruiterProfile: {
          create: {
            name: r.name, company: r.company,
            logo: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(r.company)}&backgroundColor=18181b&textColor=ffffff`,
            role: r.role, industry: 'Tech',
          },
        },
      },
    });
  }

  // Projects
  const projects = [
    { id: 'p-001', authorId: 's-001', title: 'MedAssist AI', tagline: 'AI triage for rural clinics', domain: 'Healthcare', buildStatus: 'Deployed', techStack: ['Python','Flutter','FastAPI'], tags: ['AI','Healthcare'] },
    { id: 'p-002', authorId: 's-003', title: 'CloudTrace',   tagline: 'Distributed tracing for K8s',  domain: 'Cloud',      buildStatus: 'Open Source Beta', techStack: ['Go','eBPF','Prometheus'], tags: ['DevOps','Go'] },
    { id: 'p-003', authorId: 's-004', title: 'CredVault',    tagline: 'Blockchain credential verification', domain: 'Fintech', buildStatus: 'POC Complete', techStack: ['Solidity','React','Polygon'], tags: ['Blockchain','Web3'] },
  ];
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id, authorId: p.authorId,
        title: p.title, tagline: p.tagline,
        summary: p.tagline, description: p.tagline,
        problemStatement: 'A real problem exists.',
        solution: 'We solved it.',
        impact: 'Positive impact.',
        domain: p.domain, buildStatus: p.buildStatus,
        techStack: p.techStack, tags: p.tags,
        githubLink: '', visibility: 'public', status: 'published',
        moderationStatus: 'approved', isFeatured: false,
        createdAt: past(30), updatedAt: past(5),
      },
    });
  }

  // Ideas
  const ideas = [
    { id: 'i-001', authorId: 's-002', title: 'PillPal',     summary: 'Smart pill dispenser with family alerts', domain: 'IoT',      stage: 'refined' },
    { id: 'i-002', authorId: 's-005', title: 'JobLetter AI', summary: 'AI-written tailored cover letters',       domain: 'Productivity', stage: 'prototype-ready' },
  ];
  for (const i of ideas) {
    await prisma.idea.upsert({
      where: { id: i.id },
      update: {},
      create: {
        id: i.id, authorId: i.authorId,
        title: i.title, summary: i.summary,
        description: i.summary,
        problem: 'Problem statement.',
        solution: 'Solution description.',
        targetAudience: 'Students and professionals',
        impact: 'Significant positive impact.',
        feasibility: 'Highly feasible within 2 months.',
        novelty: 'Unique approach.',
        domain: i.domain, stage: i.stage,
        visibility: 'public', status: 'published',
        moderationStatus: 'approved', isFeatured: false,
        tags: ['innovation'],
        createdAt: past(20), updatedAt: past(3),
      },
    });
  }

  // Team
  await prisma.team.upsert({
    where: { id: 't-001' },
    update: {},
    create: {
      id: 't-001',
      name: 'Byte Builders',
      description: 'We build production-ready side projects, not hackathon demos.',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=BB&backgroundColor=6366f1&textColor=ffffff',
      leaderId: 's-001',
      memberIds: ['s-001', 's-002'],
      skills: ['React','Python','ML'],
      rolesNeeded: ['UI/UX Designer'],
      isOpen: true,
      createdAt: past(50),
    },
  });

  // Hackathon
  await prisma.hackathon.upsert({
    where: { id: 'h-001' },
    update: {},
    create: {
      id: 'h-001',
      name: 'IdeaForge Hackathon 2026',
      tagline: 'Build solutions for real-world problems.',
      description: 'A 48-hour hackathon.',
      banner: '',
      deadline: new Date('2026-06-15'),
      status: 'active',
      judgeToken: 'h-001-judge',
      judgePasswordHash: await hash('Judge@123'),
      createdBy: 'admin-001',
      createdAt: past(10),
    },
  });

  // Notification
  await prisma.notification.create({
    data: {
      userId: 's-001',
      title: 'New like',
      type: 'like',
      message: 'Priya Sharma liked your project MedAssist AI',
      link: '/project/p-001',
      isRead: false,
      createdAt: past(1),
    },
  }).catch(() => {}); // ignore duplicate

  console.log('✅ Seed complete!');
  console.log('\nTest credentials:');
  console.log('  Admin:     admin@ideaforge.dev  / Admin@123');
  console.log('  Student:   aryan@student.com    / Student@123');
  console.log('  Recruiter: neha@razorpay.com    / Recruiter@123');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
