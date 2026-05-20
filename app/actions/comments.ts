'use server';

import { prisma } from '@/lib/prisma';
import { getSessionAction } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { Comment } from '@/types';

export async function addComment(targetId: string, targetType: 'project' | 'idea', content: string) {
  const session = await getSessionAction();
  if (!session) throw new Error('Not authenticated');

  const newComment: Comment = {
    id: Date.now().toString(), // Simple ID for MVP
    authorId: session.userId,
    content,
    likes: [],
    replies: [],
    isReported: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (targetType === 'project') {
    const project = await prisma.project.findUnique({ where: { id: targetId } });
    if (!project) throw new Error('Project not found');

    const currentComments = (project.comments as any[]) || [];
    const updatedComments = [...currentComments, newComment];

    await prisma.project.update({
      where: { id: targetId },
      data: { comments: updatedComments }
    });

    // Notify author
    if (project.authorId !== session.userId) {
      await prisma.notification.create({
        data: {
          userId: project.authorId,
          title: 'New Comment',
          message: `Someone commented on your project "${project.title}"`,
          type: 'comment',
          link: `/project/${targetId}#comments`
        }
      });
    }

    revalidatePath(`/project/${targetId}`);
  } else if (targetType === 'idea') {
    const idea = await prisma.idea.findUnique({ where: { id: targetId } });
    if (!idea) throw new Error('Idea not found');

    const currentComments = (idea.comments as any[]) || [];
    const updatedComments = [...currentComments, newComment];

    await prisma.idea.update({
      where: { id: targetId },
      data: { comments: updatedComments }
    });

    // Notify author
    if (idea.authorId !== session.userId) {
      await prisma.notification.create({
        data: {
          userId: idea.authorId,
          title: 'New Comment',
          message: `Someone commented on your idea "${idea.title}"`,
          type: 'comment',
          link: `/idea/${targetId}#comments`
        }
      });
    }

    revalidatePath(`/idea/${targetId}`);
  }

  return newComment;
}
