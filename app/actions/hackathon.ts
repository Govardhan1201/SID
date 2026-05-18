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

export async function createHackathon(data: Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'>) {
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
