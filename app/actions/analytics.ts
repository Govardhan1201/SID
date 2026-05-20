'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function getAnalyticsStats() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // 1. Basic Counts
  const totalUsers = await prisma.user.count();
  const totalStudents = await prisma.studentProfile.count();
  const totalRecruiters = await prisma.recruiterProfile.count();
  const totalProjects = await prisma.project.count();
  const totalIdeas = await prisma.idea.count();
  const totalHackathons = await prisma.hackathon.count();

  // 2. Projects by Domain
  const projects = await prisma.project.findMany({ select: { domain: true } });
  const domainCounts = projects.reduce((acc: any, curr: any) => {
    acc[curr.domain] = (acc[curr.domain] || 0) + 1;
    return acc;
  }, {});
  
  const projectsByDomain = Object.keys(domainCounts).map(domain => ({
    name: domain || 'Other',
    count: domainCounts[domain]
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // 3. User Growth (Last 6 Months Mock/Approx)
  // For a real app, we group by month based on createdAt.
  const users = await prisma.user.findMany({ select: { createdAt: true } });
  const monthMap: Record<string, number> = {};
  
  users.forEach(u => {
    const month = u.createdAt.toLocaleString('default', { month: 'short' });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // We just map all months out of the map for simplicity
  const userGrowth = Object.keys(monthMap).map(m => ({
    name: m,
    users: monthMap[m]
  })).sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));


  // 4. Activity breakdown (Role distribution)
  const roleDistribution = [
    { name: 'Students', value: totalStudents },
    { name: 'Recruiters', value: totalRecruiters },
    { name: 'Admins', value: totalUsers - (totalStudents + totalRecruiters) }
  ].filter(r => r.value > 0);

  return {
    totals: {
      users: totalUsers,
      projects: totalProjects,
      ideas: totalIdeas,
      hackathons: totalHackathons
    },
    projectsByDomain,
    userGrowth,
    roleDistribution
  };
}
