'use server';

import { prisma } from '@/lib/prisma';

export async function getAllTeams() {
  return await prisma.team.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getTeamById(id: string) {
  return await prisma.team.findUnique({
    where: { id }
  });
}

export async function createTeam(data: any) {
  return await prisma.team.create({
    data
  });
}

export async function updateTeam(id: string, data: any) {
  return await prisma.team.update({
    where: { id },
    data
  });
}

export async function deleteTeam(id: string) {
  return await prisma.team.delete({
    where: { id }
  });
}

export async function getTeamsByUserId(userId: string) {
  return await prisma.team.findMany({
    where: {
      OR: [
        { leaderId: userId },
        { memberIds: { has: userId } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
}
