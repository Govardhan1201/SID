'use server';

import { prisma } from '@/lib/prisma';

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
  return await prisma.project.create({ data });
}

export async function updateProject(id: string, data: any) {
  return await prisma.project.update({ where: { id }, data });
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
