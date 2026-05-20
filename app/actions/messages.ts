'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionAction } from '@/app/actions/auth';

export async function getConversations() {
  const session = await getSessionAction();
  if (!session) throw new Error('Not authenticated');

  // Fetch all messages where user is sender or receiver
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId },
        { receiverId: session.userId }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  // Extract unique conversation partners
  const partnerIds = new Set<string>();
  messages.forEach((msg: any) => {
    partnerIds.add(msg.senderId === session.userId ? msg.receiverId : msg.senderId);
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
    const unreadCount = convoMessages.filter((msg: any) => msg.receiverId === session.userId && !msg.isRead).length;

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
  const session = await getSessionAction();
  if (!session) throw new Error('Not authenticated');

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: session.userId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  // Mark as read
  await prisma.message.updateMany({
    where: { senderId: partnerId, receiverId: session.userId, isRead: false },
    data: { isRead: true }
  });

  return messages;
}

export async function sendMessage(receiverId: string, content: string) {
  const session = await getSessionAction();
  if (!session) throw new Error('Not authenticated');

  const message = await prisma.message.create({
    data: {
      senderId: session.userId,
      receiverId,
      content
    }
  });

  // Create a notification for the receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      title: 'New Message',
      message: `You have a new message`, // Could lookup name here
      type: 'message',
      link: `/messages?user=${session.userId}`
    }
  });

  revalidatePath('/messages');
  return message;
}
