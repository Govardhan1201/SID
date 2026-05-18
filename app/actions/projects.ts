'use server';

import { prisma } from '@/lib/prisma';
import type { Project } from '@/types';

export async function getAllProjects() {
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getVisibleProjects(role: 'admin' | 'recruiter' | 'student' | 'public') {
  if (role === 'admin') return getAllProjects();
  if (role === 'recruiter') {
    return await prisma.project.findMany({
      where: {
        OR: [
          { visibility: 'public' },
          { visibility: 'recruiters' },
          { visibility: 'community' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  if (role === 'student') {
    return await prisma.project.findMany({
      where: {
        OR: [
          { visibility: 'public' },
          { visibility: 'community' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  return await prisma.project.findMany({
    where: { visibility: 'public' },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProjectById(id: string) {
  return await prisma.project.findUnique({
    where: { id }
  });
}

export async function createProject(data: any) {
  return await prisma.project.create({
    data
  });
}

export async function updateProject(id: string, data: any) {
  return await prisma.project.update({
    where: { id },
    data
  });
}

export async function deleteProject(id: string) {
  return await prisma.project.delete({
    where: { id }
  });
}

export async function getProjectsByUserId(userId: string) {
  return await prisma.project.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' }
  });
}
