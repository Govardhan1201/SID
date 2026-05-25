'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionAction } from '@/app/actions/auth';

async function sendEmail(to: string, subject: string, html: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text: subject }),
    });
  } catch (e) { console.error('Email error:', e); }
}

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

  // Get sender's profile name
  const senderProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId }, select: { name: true }
  }) || await prisma.recruiterProfile.findUnique({
    where: { userId: session.userId }, select: { name: true }
  });
  const senderName = senderProfile?.name || 'Someone';

  const message = await prisma.message.create({
    data: { senderId: session.userId, receiverId, content }
  });

  // In-app notification
  await prisma.notification.create({
    data: {
      userId: receiverId,
      title: `New Message from ${senderName}`,
      message: content.length > 80 ? content.slice(0, 80) + '...' : content,
      type: 'message',
      link: `/messages?user=${session.userId}`
    }
  });

  // Email alert if sender is a recruiter (high-priority career opportunity)
  const senderUser = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (senderUser?.role === 'recruiter') {
    const receiverUser = await prisma.user.findUnique({ where: { id: receiverId }, select: { email: true } });
    if (receiverUser?.email) {
      await sendEmail(
        receiverUser.email,
        `A recruiter messaged you on IdeaForge!`,
        `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#00f2fe">You have a new message! 🚀</h2>
          <p><strong>${senderName}</strong> (a recruiter) just sent you a message on IdeaForge.</p>
          <blockquote style="border-left:3px solid #00f2fe;padding:8px 16px;color:#aaa;font-style:italic">${content.slice(0, 200)}</blockquote>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/messages?user=${session.userId}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#00f2fe;color:#000;border-radius:8px;text-decoration:none;font-weight:700">Reply Now</a>
        </div>`
      );
    }
  }

  revalidatePath('/messages');
  return message;
}
