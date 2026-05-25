'use server';

import { prisma } from '@/lib/prisma';

async function sendEmail(to: string, subject: string, html: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text: subject }),
    });
  } catch (e) { console.error('Email error:', e); }
}

export async function getAllProjects() {
  return await prisma.project.findMany({
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
  });
}

export async function getVisibleProjects(role: 'admin' | 'recruiter' | 'student' | 'public') {
  if (role === 'admin') return getAllProjects();

  const baseWhere = {
    moderationStatus: { notIn: ['archived', 'rejected'] },
  };

  if (role === 'recruiter') {
    return await prisma.project.findMany({
      where: {
        ...baseWhere,
        OR: [
          { visibility: 'public' },
          { visibility: 'recruiters' },
          { visibility: 'community' },
        ],
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
  }
  if (role === 'student') {
    return await prisma.project.findMany({
      where: {
        ...baseWhere,
        OR: [
          { visibility: 'public' },
          { visibility: 'community' },
        ],
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
  }
  // public
  return await prisma.project.findMany({
    where: {
      ...baseWhere,
      visibility: 'public',
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getProjectById(id: string) {
  return await prisma.project.findUnique({ where: { id } });
}

export async function createProject(data: any) {
  const project = await prisma.project.create({ data });
  
  // Notify all admins about new submission
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map(a => ({
        userId: a.id,
        title: 'New Project Submitted',
        message: `A new project "${data.title || 'Untitled'}" is awaiting moderation.`,
        type: 'project_submission',
        link: `/project/${project.id}`,
        actionable: true,
        actionData: { projectId: project.id, projectTitle: data.title || 'Untitled' },
      }))
    });
  }
  return project;
}

export async function updateProject(id: string, data: any) {
  const prev = await prisma.project.findUnique({ where: { id }, select: { moderationStatus: true, authorId: true, title: true } });
  const updated = await prisma.project.update({ where: { id }, data });
  
  // Send notification + email when moderation status changes
  if (prev && data.moderationStatus && data.moderationStatus !== prev.moderationStatus && prev.authorId) {
    const user = await prisma.user.findUnique({ where: { id: prev.authorId }, select: { email: true } });
    const statusMsg: Record<string, string> = {
      approved: 'approved ✅',
      rejected: 'rejected ❌',
      featured: 'featured ⭐',
      archived: 'archived 📦',
    };
    const label = statusMsg[data.moderationStatus] || data.moderationStatus;
    await prisma.notification.create({
      data: {
        userId: prev.authorId,
        title: `Project ${label}`,
        message: `Your project "${prev.title}" has been ${label} by an admin.`,
        type: 'moderation',
        link: `/project/${id}`,
      }
    });
    if (user?.email) {
      await sendEmail(user.email, `Your IdeaForge project was ${label}`,
        `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#00f2fe">Project Update</h2>
          <p>Your project <strong>${prev.title}</strong> has been <strong>${label}</strong> by an admin.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/project/${id}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#00f2fe;color:#000;border-radius:8px;text-decoration:none;font-weight:700">View Project</a>
        </div>`
      );
    }
  }
  
  return updated;
}

export async function deleteProject(id: string) {
  return await prisma.project.delete({ where: { id } });
}

export async function getProjectsByUserId(userId: string) {
  return await prisma.project.findMany({
    where: { authorId: userId },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });
}

/**
 * Records a view for a project — 1 view per logged-in user account.
 * Guests (userId = null) still count per session (handled client-side via sessionStorage).
 */
export async function recordProjectView(id: string, userId: string | null) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { views: true, viewedBy: true },
  });
  if (!project) return;

  // If user is logged in, only count if they haven't viewed before
  if (userId) {
    if (project.viewedBy.includes(userId)) return; // already counted
    await prisma.project.update({
      where: { id },
      data: {
        views: { increment: 1 },
        viewedBy: { push: userId },
      },
    });
  } else {
    // Guest — just increment, client sessionStorage prevents re-calls
    await prisma.project.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }
}
