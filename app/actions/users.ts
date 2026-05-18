'use server';

import { prisma } from '@/lib/prisma';

export async function getAllStudentProfiles() {
  return await prisma.studentProfile.findMany();
}

export async function getStudentProfileById(userId: string) {
  return await prisma.studentProfile.findUnique({
    where: { userId }
  });
}

export async function updateStudentProfile(userId: string, data: any) {
  return await prisma.studentProfile.update({
    where: { userId },
    data
  });
}

export async function getAllRecruiterProfiles() {
  return await prisma.recruiterProfile.findMany();
}

export async function getRecruiterProfileById(userId: string) {
  return await prisma.recruiterProfile.findUnique({
    where: { userId }
  });
}

export async function updateRecruiterProfile(userId: string, data: any) {
  return await prisma.recruiterProfile.update({
    where: { userId },
    data
  });
}

export async function getNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function markNotificationAsRead(id: string) {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true }
  });
}

export async function createNotification(data: any) {
  return await prisma.notification.create({
    data
  });
}

/** Returns a plain object mapping userId → email for the given list of IDs */
export async function getUserEmailsByIds(userIds: string[]): Promise<Record<string, string>> {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const map: Record<string, string> = {};
  for (const u of users) map[u.id] = u.email;
  return map;
}
