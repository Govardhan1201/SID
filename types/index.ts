export type UserRole = 'student' | 'recruiter' | 'admin';
export type Visibility = 'public' | 'admin-only';
export type SubmissionStatus = 'draft' | 'published' | 'archived' | 'pending';
export type IdeaStage = 'raw' | 'refined' | 'prototype-ready' | 'incubating';
export type TeamRole = 'leader' | 'developer' | 'designer' | 'presenter' | 'member';
export type BadgeType = 'first-project' | 'top-innovator' | 'trending-builder' | 'team-player' | 'idea-champion' | 'community-star' | 'early-adopter' | 'consistent-builder';
export type ModerationStatus = 'approved' | 'pending' | 'rejected' | 'featured' | 'archived';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isBanned: boolean;
  lastLogin: string;
}

export interface StudentProfile {
  userId: string;
  name: string;
  avatar: string;
  banner: string;
  bio: string;
  college: string;
  branch: string;
  year: number;
  skills: string[];
  domains: string[];
  github: string;
  linkedin: string;
  portfolio: string;
  resume: string;
  certificates: string[];
  achievements: string[];
  badges: BadgeType[];
  followers: string[];
  following: string[];
  bookmarks: string[];
  profileViews: number;
  isProfileComplete: boolean;
  agreeToTerms: boolean;
}

export interface RecruiterProfile {
  userId: string;
  name: string;
  company: string;
  logo: string;
  industry: string;
  role: string;
  hiringInterests: string[];
  description: string;
  website: string;
  linkedin: string;
  savedCandidates: string[];
  shortlisted: string[];
  contactedStudents: string[];
}

export interface Project {
  id: string;
  authorId: string;
  teamId?: string;
  title: string;
  tagline: string;
  summary: string;
  description: string;
  problemStatement: string;
  solution: string;
  impact: string;
  techStack: string[];
  category: string;
  domain: string;
  sdgMapping: string[];
  teamMembers: TeamMember[];
  githubLink: string;
  liveDemo: string;
  demoVideo: string;
  pptLink: string;
  screenshots: string[];
  attachments: string[];
  buildStatus: string;
  challengesFaced: string;
  learnings: string;
  futureScope: string;
  tags: string[];
  visibility: Visibility;
  status: SubmissionStatus;
  moderationStatus: ModerationStatus;
  isFeatured: boolean;
  views: number;
  likes: string[];
  bookmarks: string[];
  comments: Comment[];
  version: number;
  versionHistory: VersionEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  authorId: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  targetUsers: string;
  impact: string;
  feasibility: string;
  novelty: string;
  category: string;
  domain: string;
  sdgAlignment: string[];
  neededResources: string[];
  neededSkills: string[];
  stage: IdeaStage;
  risks: string;
  roadmap: string;
  visibility: Visibility;
  status: SubmissionStatus;
  moderationStatus: ModerationStatus;
  isFeatured: boolean;
  convertedToProjectId?: string;
  views: number;
  likes: string[];
  bookmarks: string[];
  comments: Comment[];
  tags: string[];
  version: number;
  versionHistory: VersionEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar: string;
  leaderId: string;
  members: { userId: string; role: TeamRole; joinedAt: string }[];
  projectIds: string[];
  ideaIds: string[];
  skills: string[];
  lookingFor: string[];
  isOpen: boolean;
  activity: ActivityItem[];
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  likes: string[];
  replies: Comment[];
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'invite' | 'submission' | 'mention' | 'bookmark' | 'message';
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'project' | 'idea' | 'comment' | 'user';
  targetId: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface VersionEntry {
  version: number;
  savedAt: string;
  summary: string;
}

export interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
}

export interface PlatformStats {
  totalStudents: number;
  totalRecruiters: number;
  totalProjects: number;
  totalIdeas: number;
  totalTeams: number;
  publicProjects: number;
  adminOnlyProjects: number;
  activeThisWeek: number;
  topDomains: { name: string; count: number }[];
  topColleges: { name: string; count: number }[];
  growthData: { month: string; students: number; projects: number }[];
}

// ── Hackathon System ───────────────────────────────────────────────────────

export type HackathonStatus = 'draft' | 'active' | 'judging' | 'completed';
export type HackathonProjectStatus = 'draft' | 'submitted' | 'locked';
export type HackathonParticipantRole = 'leader' | 'member';

export interface HackathonTrack {
  id: string;
  name: string;
  description: string;
  problemStatement: string;
  openInnovation: boolean; // true = teams define their own problem
}

export interface HackathonAnnouncement {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  timestamp: string;
}

export interface Hackathon {
  id: string;
  name: string;
  tagline: string;
  description: string;
  banner: string;
  tracks: HackathonTrack[];
  announcements: HackathonAnnouncement[];
  deadline: string;         // ISO date-time string, editable
  status: HackathonStatus;
  judgeToken: string;       // UUID — used in external judge link
  judgePasswordHash: string;// hashed judge access password
  createdBy: string;        // admin userId
  createdAt: string;
  updatedAt: string;
}

export interface HackathonTeam {
  id: string;
  hackathonId: string;
  name: string;
  passwordHash: string;     // shared by all team members
  plainPassword: string;    // stored for credentials sheet (BlueTiger2847)
  leaderId: string;
  memberIds: string[];
  trackId: string | null;   // chosen during project setup
  projectId: string | null;
  createdAt: string;
}

export interface HackathonParticipant {
  hackathonId: string;
  userId: string;
  teamId: string;
  role: HackathonParticipantRole;
  joinedAt: string;
  addedToPortfolio: boolean;
}

export interface HackathonProject {
  id: string;
  hackathonId: string;
  teamId: string;
  trackId: string;
  title: string;
  tagline: string;
  description: string;
  problemSolved: string;
  techStack: string[];
  githubLink: string;
  demoLink: string;
  videoLink: string;
  presentationLink: string;
  screenshots: string[];
  status: HackathonProjectStatus;
  submittedAt: string | null;
  linkedPortfolioProjectId: string | null; // links to regular Project after hackathon
  createdAt: string;
  updatedAt: string;
}

export interface HackathonRankEntry {
  rank: number;
  teamId: string;
  prize: string;
  notes: string;
}

export interface HackathonSpecialAward {
  award: string;
  teamId: string;
}

export interface HackathonTrackResult {
  trackId: string;
  rankings: HackathonRankEntry[];
  specialAwards: HackathonSpecialAward[];
}

export interface HackathonStandings {
  hackathonId: string;
  publishedAt: string;
  isPublished: boolean;
  results: HackathonTrackResult[];
}

export interface HackathonImportLog {
  id: string;
  hackathonId: string;
  importedAt: string;
  totalRows: number;
  created: number;
  skipped: number;
  errors: string[];
}

export interface ImportedParticipantRow {
  name: string;
  email: string;
  team_name: string;
  role: string; // 'leader' | 'member'
  college?: string;
  branch?: string;
  year?: string;
}
