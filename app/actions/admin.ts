'use server';

import { prisma } from '@/lib/prisma';

export async function getAllUsersAdmin() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function toggleUserBanStatus(userId: string, isBanned: boolean) {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned }
  });
}

export async function getAllAuditLogs() {
  return await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50
  });
}

export async function createAuditLog(data: any) {
  return await prisma.auditLog.create({
    data
  });
}
