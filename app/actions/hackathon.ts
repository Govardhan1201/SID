'use server';

import { prisma } from '@/lib/prisma';
import type { Hackathon, HackathonTrack, HackathonAnnouncement, HackathonTeam, HackathonProject } from '@/types';

// ── GET ACTIONS ─────────────────────────────────────────────────────────────

export async function getAllHackathons() {
  return await prisma.hackathon.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getHackathonById(id: string) {
  return await prisma.hackathon.findUnique({
    where: { id },
    include: {
      tracks: true,
      announcements: { orderBy: { timestamp: 'desc' } }
    }
  });
}

export async function getTeamsByHackathon(hackathonId: string) {
  return await prisma.hackathonTeam.findMany({
    where: { hackathonId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProjectsByHackathon(hackathonId: string) {
  return await prisma.hackathonProject.findMany({
    where: { hackathonId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getParticipantsByHackathon(hackathonId: string) {
  return await prisma.hackathonParticipant.findMany({
    where: { hackathonId },
    orderBy: { joinedAt: 'desc' }
  });
}

// ── CREATE / UPDATE ACTIONS ──────────────────────────────────────────────────

export async function createHackathon(data: Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'> & { registrationLink?: string }) {
  const h = await prisma.hackathon.create({
    data: {
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      banner: data.banner,
      deadline: new Date(data.deadline),
      status: data.status,
      judgeToken: data.judgeToken,
      judgePasswordHash: data.judgePasswordHash,
      createdBy: data.createdBy,
      registrationLink: data.registrationLink || '',
      tracks: {
        create: data.tracks.map(t => ({
          name: t.name,
          description: t.description,
          problemStatement: t.problemStatement,
          openInnovation: t.openInnovation
        }))
      }
    }
  });
  return h;
}

export async function updateHackathonStatus(id: string, status: string) {
  return await prisma.hackathon.update({
    where: { id },
    data: { status }
  });
}

export async function addHackathonAnnouncement(hackathonId: string, text: string, type: string) {
  return await prisma.hackathonAnnouncement.create({
    data: {
      hackathonId,
      text,
      type
    }
  });
}

export async function deleteHackathonAnnouncement(id: string) {
  return await prisma.hackathonAnnouncement.delete({
    where: { id }
  });
}

export async function deleteHackathon(id: string) {
  return await prisma.hackathon.delete({
    where: { id }
  });
}

// ── SUBMISSIONS & TEAMS ──────────────────────────────────────────────────────

export async function createHackathonProject(data: any) {
  return await prisma.hackathonProject.create({
    data: {
      hackathonId: data.hackathonId,
      teamId: data.teamId,
      trackId: data.trackId,
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      problemSolved: data.problemSolved,
      techStack: data.techStack,
      githubLink: data.githubLink,
      demoLink: data.demoLink,
      videoLink: data.videoLink,
      presentationLink: data.presentationLink,
      screenshots: data.screenshots,
      status: data.status,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : null,
      linkedPortfolioProjectId: data.linkedPortfolioProjectId
    }
  });
}

export async function updateHackathonProject(id: string, data: any) {
  return await prisma.hackathonProject.update({
    where: { id },
    data: {
      trackId: data.trackId,
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      githubLink: data.githubLink,
      demoLink: data.demoLink,
      videoLink: data.videoLink,
    }
  });
}

export async function createHackathonTeam(data: any) {
  return await prisma.hackathonTeam.create({
    data: {
      hackathonId: data.hackathonId,
      name: data.name,
      passwordHash: data.passwordHash,
      plainPassword: data.plainPassword,
      leaderId: data.leaderId,
      memberIds: data.memberIds,
      trackId: data.trackId
    }
  });
}

export async function addHackathonParticipant(data: any) {
  return await prisma.hackathonParticipant.create({
    data: {
      hackathonId: data.hackathonId,
      userId: data.userId,
      teamId: data.teamId,
      role: data.role
    }
  });
}

export async function importHackathonParticipants(
  hackathonId: string, 
  data: { 
    name: string; 
    email: string; 
    team_name: string; 
    role: string;
    college?: string;
    branch?: string;
    year?: string;
  }[]
) {
  const bcrypt = require('bcryptjs');
  const passwordGen = require('@/lib/password-gen');
  
  const results = { created: 0, skipped: 0, errors: [] as string[], credentials: [] as any[] };

  const teamsMap = new Map<string, typeof data>();
  data.forEach(row => {
    if (!teamsMap.has(row.team_name)) teamsMap.set(row.team_name, []);
    teamsMap.get(row.team_name)!.push(row);
  });

  for (const [teamName, members] of teamsMap.entries()) {
    try {
      const userIds: string[] = [];
      let leaderId = '';

      for (const member of members) {
        let user = await prisma.user.findUnique({ where: { email: member.email } });
        const plainPassword = passwordGen.generateJudgeToken().substring(0, 8); // Simple password
        const hash = await bcrypt.hash(plainPassword, 10);
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: member.email,
              passwordHash: hash,
              role: 'student',
              studentProfile: {
                create: {
                  name: member.name,
                  college: member.college || '',
                  branch: member.branch || '',
                  year: member.year ? parseInt(member.year) : 1
                }
              }
            }
          });
          results.created++;
        } else {
          results.skipped++;
        }

        userIds.push(user.id);
        if (member.role.toLowerCase() === 'leader') leaderId = user.id;

        results.credentials.push({
          Name: member.name,
          Email: member.email,
          Team: teamName,
          Role: member.role,
          Password: plainPassword
        });
      }

      if (!leaderId && userIds.length > 0) leaderId = userIds[0];

      const teamPassword = passwordGen.generateJudgeToken().substring(0, 8);
      const teamHash = await bcrypt.hash(teamPassword, 10);

      const team = await prisma.hackathonTeam.create({
        data: {
          hackathonId,
          name: teamName,
          passwordHash: teamHash,
          plainPassword: teamPassword,
          leaderId,
          memberIds: userIds
        }
      });

      for (const member of members) {
        const u = await prisma.user.findUnique({ where: { email: member.email } });
        if (u) {
          await prisma.hackathonParticipant.create({
            data: {
              hackathonId,
              userId: u.id,
              teamId: team.id,
              role: member.role.toLowerCase() === 'leader' ? 'leader' : 'member'
            }
          });
        }
      }
    } catch (err) {
      results.errors.push(`Failed to import team ${teamName}: ${err}`);
    }
  }

  return results;
}
