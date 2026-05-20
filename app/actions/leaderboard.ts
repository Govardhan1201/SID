'use server';

import { prisma } from '@/lib/prisma';

export async function getLeaderboardData() {
  const baseWhere = {
    moderationStatus: { notIn: ['archived', 'rejected'] },
    visibility: 'public'
  };

  // 1. Top Projects
  const projects = await prisma.project.findMany({
    where: baseWhere,
    take: 100 // fetch top 100 to sort
  });

  // Sort by likes.length, then views
  const topProjects = projects.sort((a: any, b: any) => {
    const aLikes = a.likes?.length || 0;
    const bLikes = b.likes?.length || 0;
    if (bLikes !== aLikes) return bLikes - aLikes;
    return b.views - a.views;
  }).slice(0, 10); // Return top 10

  // 2. Top Ideas
  const ideas = await prisma.idea.findMany({
    where: baseWhere,
    take: 100
  });

  const topIdeas = ideas.sort((a: any, b: any) => {
    const aLikes = a.likes?.length || 0;
    const bLikes = b.likes?.length || 0;
    if (bLikes !== aLikes) return bLikes - aLikes;
    return b.views - a.views;
  }).slice(0, 10);

  // Map author IDs to student names
  const authorIds = new Set([...topProjects.map(p => p.authorId), ...topIdeas.map(i => i.authorId)]);
  const profiles = await prisma.studentProfile.findMany({
    where: { userId: { in: Array.from(authorIds) } },
    select: { userId: true, name: true, avatar: true }
  });

  const profileMap = profiles.reduce((acc: any, p: any) => {
    acc[p.userId] = p;
    return acc;
  }, {});

  return {
    topProjects: topProjects.map((p: any) => ({ ...p, author: profileMap[p.authorId] })),
    topIdeas: topIdeas.map((i: any) => ({ ...i, author: profileMap[i.authorId] }))
  };
}
