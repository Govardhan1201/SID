'use server';

import { prisma } from '@/lib/prisma';

export async function getAllIdeas() {
  return await prisma.idea.findMany({
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getVisibleIdeas(role: 'admin' | 'recruiter' | 'student' | 'public') {
  if (role === 'admin') return getAllIdeas();

  // For all non-admin roles: exclude archived and rejected
  return await prisma.idea.findMany({
    where: {
      moderationStatus: { notIn: ['archived', 'rejected'] },
      visibility: { not: 'admin-only' },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getIdeaById(id: string) {
  return await prisma.idea.findUnique({ where: { id } });
}

export async function createIdea(data: any) {
  return await prisma.idea.create({ data });
}

export async function updateIdea(id: string, data: any) {
  return await prisma.idea.update({ where: { id }, data });
}

export async function deleteIdea(id: string) {
  return await prisma.idea.delete({ where: { id } });
}

export async function getIdeasByUserId(userId: string) {
  return await prisma.idea.findMany({
    where: { authorId: userId },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });
}

/**
 * Records a view for an idea — 1 view per logged-in user account.
 */
export async function recordIdeaView(id: string, userId: string | null) {
  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { views: true, viewedBy: true },
  });
  if (!idea) return;

  if (userId) {
    if (idea.viewedBy.includes(userId)) return;
    await prisma.idea.update({
      where: { id },
      data: {
        views: { increment: 1 },
        viewedBy: { push: userId },
      },
    });
  } else {
    await prisma.idea.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }
}
