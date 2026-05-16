import type {
  User, StudentProfile, RecruiterProfile, Project, Idea,
  Team, Notification, Message, Report, AuditLog
} from '@/types';

// ── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  users: 'if_users',
  students: 'if_students',
  recruiters: 'if_recruiters',
  projects: 'if_projects',
  ideas: 'if_ideas',
  teams: 'if_teams',
  notifications: 'if_notifications',
  messages: 'if_messages',
  reports: 'if_reports',
  auditLogs: 'if_audit_logs',
  seeded: 'if_seeded',
};

// ── Core helpers ──────────────────────────────────────────────────────────────

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* storage full */ }
}

// ── Generic CRUD ──────────────────────────────────────────────────────────────

function getAll<T extends { id: string }>(key: string): T[] { return read<T>(key); }
function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  return read<T>(key).find(item => item.id === id);
}
function upsert<T extends { id: string }>(key: string, item: T): void {
  const list = read<T>(key);
  const idx = list.findIndex(i => i.id === item.id);
  if (idx >= 0) list[idx] = item; else list.push(item);
  write(key, list);
}
function remove<T extends { id: string }>(key: string, id: string): void {
  write(key, read<T>(key).filter(i => i.id !== id));
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const UserStore = {
  getAll: () => getAll<User>(KEYS.users),
  getById: (id: string) => getById<User>(KEYS.users, id),
  getByEmail: (email: string) => read<User>(KEYS.users).find(u => u.email.toLowerCase() === email.toLowerCase()),
  save: (user: User) => upsert(KEYS.users, user),
  delete: (id: string) => remove(KEYS.users, id),
};

// ── Student profiles ──────────────────────────────────────────────────────────

export const StudentStore = {
  getAll: () => read<StudentProfile>(KEYS.students),
  getById: (userId: string) => read<StudentProfile>(KEYS.students).find(s => s.userId === userId),
  save: (profile: StudentProfile) => {
    const list = read<StudentProfile>(KEYS.students);
    const idx = list.findIndex(s => s.userId === profile.userId);
    if (idx >= 0) list[idx] = profile; else list.push(profile);
    write(KEYS.students, list);
  },
};

// ── Recruiter profiles ────────────────────────────────────────────────────────

export const RecruiterStore = {
  getAll: () => read<RecruiterProfile>(KEYS.recruiters),
  getById: (userId: string) => read<RecruiterProfile>(KEYS.recruiters).find(r => r.userId === userId),
  save: (profile: RecruiterProfile) => {
    const list = read<RecruiterProfile>(KEYS.recruiters);
    const idx = list.findIndex(r => r.userId === profile.userId);
    if (idx >= 0) list[idx] = profile; else list.push(profile);
    write(KEYS.recruiters, list);
  },
};

// ── Projects ─────────────────────────────────────────────────────────────────

export const ProjectStore = {
  getAll: () => getAll<Project>(KEYS.projects),
  getById: (id: string) => getById<Project>(KEYS.projects, id),
  getByAuthor: (authorId: string) => read<Project>(KEYS.projects).filter(p => p.authorId === authorId),
  getPublic: () => read<Project>(KEYS.projects).filter(p => p.visibility === 'public' && p.status === 'published'),
  getVisibleTo: (role: 'student' | 'recruiter' | 'admin' | 'public') => {
    const all = read<Project>(KEYS.projects).filter(p => p.status === 'published');
    if (role === 'admin') return all;
    if (role === 'recruiter') return all; // recruiters see all including admin-only
    return all.filter(p => p.visibility === 'public');
  },
  save: (project: Project) => upsert(KEYS.projects, project),
  delete: (id: string) => remove(KEYS.projects, id),
};

// ── Ideas ─────────────────────────────────────────────────────────────────────

export const IdeaStore = {
  getAll: () => getAll<Idea>(KEYS.ideas),
  getById: (id: string) => getById<Idea>(KEYS.ideas, id),
  getByAuthor: (authorId: string) => read<Idea>(KEYS.ideas).filter(i => i.authorId === authorId),
  getPublic: () => read<Idea>(KEYS.ideas).filter(i => i.visibility === 'public' && i.status === 'published'),
  getVisibleTo: (role: 'student' | 'recruiter' | 'admin' | 'public') => {
    const all = read<Idea>(KEYS.ideas).filter(i => i.status === 'published');
    if (role === 'admin') return all;
    if (role === 'recruiter') return all;
    return all.filter(i => i.visibility === 'public');
  },
  save: (idea: Idea) => upsert(KEYS.ideas, idea),
  delete: (id: string) => remove(KEYS.ideas, id),
};

// ── Teams ─────────────────────────────────────────────────────────────────────

export const TeamStore = {
  getAll: () => getAll<Team>(KEYS.teams),
  getById: (id: string) => getById<Team>(KEYS.teams, id),
  getByMember: (userId: string) => read<Team>(KEYS.teams).filter(t => t.members.some(m => m.userId === userId)),
  save: (team: Team) => upsert(KEYS.teams, team),
  delete: (id: string) => remove(KEYS.teams, id),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const NotificationStore = {
  getForUser: (userId: string) => read<Notification>(KEYS.notifications).filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  save: (n: Notification) => upsert(KEYS.notifications, n),
  markRead: (id: string) => {
    const list = read<Notification>(KEYS.notifications);
    const item = list.find(n => n.id === id);
    if (item) { item.isRead = true; write(KEYS.notifications, list); }
  },
  markAllRead: (userId: string) => {
    const list = read<Notification>(KEYS.notifications).map(n => n.userId === userId ? { ...n, isRead: true } : n);
    write(KEYS.notifications, list);
  },
};

// ── Messages ──────────────────────────────────────────────────────────────────

export const MessageStore = {
  getThread: (userId1: string, userId2: string) =>
    read<Message>(KEYS.messages).filter(m =>
      (m.fromId === userId1 && m.toId === userId2) ||
      (m.fromId === userId2 && m.toId === userId1)
    ).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  getInbox: (userId: string) => read<Message>(KEYS.messages).filter(m => m.toId === userId),
  save: (msg: Message) => upsert(KEYS.messages, msg),
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const ReportStore = {
  getAll: () => getAll<Report>(KEYS.reports),
  save: (report: Report) => upsert(KEYS.reports, report),
  update: (report: Report) => upsert(KEYS.reports, report),
};

// ── Audit logs ────────────────────────────────────────────────────────────────

export const AuditStore = {
  getAll: () => getAll<AuditLog>(KEYS.auditLogs).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
  log: (entry: AuditLog) => {
    const list = read<AuditLog>(KEYS.auditLogs);
    list.unshift(entry);
    write(KEYS.auditLogs, list.slice(0, 500)); // keep last 500
  },
};

// ── Seeded flag ───────────────────────────────────────────────────────────────

export const isSeeded = () => typeof window !== 'undefined' && localStorage.getItem(KEYS.seeded) === 'true';
export const markSeeded = () => typeof window !== 'undefined' && localStorage.setItem(KEYS.seeded, 'true');
