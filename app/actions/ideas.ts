'use server';

import { prisma } from '@/lib/prisma';

export async function getAllIdeas() {
  return await prisma.idea.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getVisibleIdeas(role: 'admin' | 'recruiter' | 'student' | 'public') {
  if (role === 'admin') return getAllIdeas();
  if (role === 'recruiter' || role === 'student') {
    return await prisma.idea.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
  // Public might have limited view, but for MVP let's return all
  return await prisma.idea.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getIdeaById(id: string) {
  return await prisma.idea.findUnique({
    where: { id }
  });
}

export async function createIdea(data: any) {
  return await prisma.idea.create({
    data
  });
}

export async function updateIdea(id: string, data: any) {
  return await prisma.idea.update({
    where: { id },
    data
  });
}

export async function deleteIdea(id: string) {
  return await prisma.idea.delete({
    where: { id }
  });
}

export async function getIdeasByUserId(userId: string) {
  return await prisma.idea.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' }
  });
}
