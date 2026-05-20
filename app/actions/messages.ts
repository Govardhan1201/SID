'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

export async function getConversations() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch all messages where user is sender or receiver
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  // Extract unique conversation partners
  const partnerIds = new Set<string>();
  messages.forEach((msg: any) => {
    partnerIds.add(msg.senderId === user.id ? msg.receiverId : msg.senderId);
  });

  // Get profiles for these partners
  const partners = await prisma.studentProfile.findMany({
    where: { userId: { in: Array.from(partnerIds) } },
    select: { userId: true, name: true, avatar: true }
  });

  // Group by partner and get latest message
  const conversations = partners.map((partner: any) => {
    const convoMessages = messages.filter((msg: any) => 
      msg.senderId === partner.userId || msg.receiverId === partner.userId
    );
    const latestMessage = convoMessages[0];
    const unreadCount = convoMessages.filter((msg: any) => msg.receiverId === user.id && !msg.isRead).length;

    return {
      partnerId: partner.userId,
      partnerName: partner.name,
      partnerAvatar: partner.avatar,
      latestMessage: latestMessage?.content || '',
      latestMessageAt: latestMessage?.createdAt || new Date(),
      unreadCount
    };
  });

  return conversations.sort((a, b) => new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime());
}

export async function getMessages(partnerId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: partnerId },
        { senderId: partnerId, receiverId: user.id }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  // Mark as read
  await prisma.message.updateMany({
    where: { senderId: partnerId, receiverId: user.id, isRead: false },
    data: { isRead: true }
  });

  return messages;
}

export async function sendMessage(receiverId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content
    }
  });

  // Create a notification for the receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      title: 'New Message',
      message: `You have a new message from ${user.email}`, // Could lookup name here
      type: 'message',
      link: `/messages?user=${user.id}`
    }
  });

  revalidatePath('/messages');
  return message;
}
