import type {
  Hackathon, HackathonTeam, HackathonParticipant,
  HackathonProject, HackathonStandings, HackathonImportLog,
} from '@/types';

// ── Storage keys ──────────────────────────────────────────────────────────
const KEYS = {
  hackathons:    'if_hackathons',
  teams:         'if_hk_teams',
  participants:  'if_hk_participants',
  projects:      'if_hk_projects',
  standings:     'if_hk_standings',
  importLogs:    'if_hk_import_logs',
} as const;

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); }
  catch { return []; }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Hackathon Store ────────────────────────────────────────────────────────
export const HackathonStore = {
  getAll(): Hackathon[] {
    return read<Hackathon>(KEYS.hackathons);
  },
  getById(id: string): Hackathon | null {
    return this.getAll().find(h => h.id === id) ?? null;
  },
  getActive(): Hackathon[] {
    return this.getAll().filter(h => h.status === 'active');
  },
  save(h: Hackathon): void {
    const all = this.getAll().filter(x => x.id !== h.id);
    write(KEYS.hackathons, [...all, h]);
  },
  delete(id: string): void {
    write(KEYS.hackathons, this.getAll().filter(h => h.id !== id));
  },
  updateStatus(id: string, status: Hackathon['status']): void {
    const h = this.getById(id);
    if (!h) return;
    this.save({ ...h, status, updatedAt: new Date().toISOString() });
  },
};

// ── HackathonTeam Store ────────────────────────────────────────────────────
export const HackathonTeamStore = {
  getAll(): HackathonTeam[] {
    return read<HackathonTeam>(KEYS.teams);
  },
  getById(id: string): HackathonTeam | null {
    return this.getAll().find(t => t.id === id) ?? null;
  },
  getByHackathon(hackathonId: string): HackathonTeam[] {
    return this.getAll().filter(t => t.hackathonId === hackathonId);
  },
  getByTrack(hackathonId: string, trackId: string): HackathonTeam[] {
    return this.getAll().filter(t => t.hackathonId === hackathonId && t.trackId === trackId);
  },
  getByMember(userId: string): HackathonTeam[] {
    return this.getAll().filter(t => t.memberIds.includes(userId));
  },
  getByMemberAndHackathon(userId: string, hackathonId: string): HackathonTeam | null {
    return this.getAll().find(t => t.hackathonId === hackathonId && t.memberIds.includes(userId)) ?? null;
  },
  save(t: HackathonTeam): void {
    const all = this.getAll().filter(x => x.id !== t.id);
    write(KEYS.teams, [...all, t]);
  },
  delete(id: string): void {
    write(KEYS.teams, this.getAll().filter(t => t.id !== id));
  },
};

// ── HackathonParticipant Store ─────────────────────────────────────────────
export const HackathonParticipantStore = {
  getAll(): HackathonParticipant[] {
    return read<HackathonParticipant>(KEYS.participants);
  },
  getByHackathon(hackathonId: string): HackathonParticipant[] {
    return this.getAll().filter(p => p.hackathonId === hackathonId);
  },
  getByUser(userId: string): HackathonParticipant[] {
    return this.getAll().filter(p => p.userId === userId);
  },
  getByUserAndHackathon(userId: string, hackathonId: string): HackathonParticipant | null {
    return this.getAll().find(p => p.userId === userId && p.hackathonId === hackathonId) ?? null;
  },
  save(p: HackathonParticipant): void {
    const all = this.getAll().filter(
      x => !(x.userId === p.userId && x.hackathonId === p.hackathonId)
    );
    write(KEYS.participants, [...all, p]);
  },
  markPortfolioAdded(userId: string, hackathonId: string): void {
    const all = this.getAll().map(p =>
      p.userId === userId && p.hackathonId === hackathonId
        ? { ...p, addedToPortfolio: true }
        : p
    );
    write(KEYS.participants, all);
  },
};

// ── HackathonProject Store ─────────────────────────────────────────────────
export const HackathonProjectStore = {
  getAll(): HackathonProject[] {
    return read<HackathonProject>(KEYS.projects);
  },
  getById(id: string): HackathonProject | null {
    return this.getAll().find(p => p.id === id) ?? null;
  },
  getByHackathon(hackathonId: string): HackathonProject[] {
    return this.getAll().filter(p => p.hackathonId === hackathonId);
  },
  getByHackathonAndTrack(hackathonId: string, trackId: string): HackathonProject[] {
    return this.getAll().filter(p => p.hackathonId === hackathonId && p.trackId === trackId);
  },
  getByTeam(teamId: string): HackathonProject | null {
    return this.getAll().find(p => p.teamId === teamId) ?? null;
  },
  getSubmitted(hackathonId: string): HackathonProject[] {
    return this.getAll().filter(
      p => p.hackathonId === hackathonId && (p.status === 'submitted' || p.status === 'locked')
    );
  },
  save(p: HackathonProject): void {
    const all = this.getAll().filter(x => x.id !== p.id);
    write(KEYS.projects, [...all, p]);
  },
  lockAll(hackathonId: string): void {
    const all = this.getAll().map(p =>
      p.hackathonId === hackathonId && p.status === 'submitted'
        ? { ...p, status: 'locked' as const }
        : p
    );
    write(KEYS.projects, all);
  },
  delete(id: string): void {
    write(KEYS.projects, this.getAll().filter(p => p.id !== id));
  },
};

// ── HackathonStandings Store ───────────────────────────────────────────────
export const HackathonStandingsStore = {
  getAll(): HackathonStandings[] {
    return read<HackathonStandings>(KEYS.standings);
  },
  getByHackathon(hackathonId: string): HackathonStandings | null {
    return this.getAll().find(s => s.hackathonId === hackathonId) ?? null;
  },
  save(s: HackathonStandings): void {
    const all = this.getAll().filter(x => x.hackathonId !== s.hackathonId);
    write(KEYS.standings, [...all, s]);
  },
};

// ── ImportLog Store ────────────────────────────────────────────────────────
export const HackathonImportLogStore = {
  getAll(): HackathonImportLog[] {
    return read<HackathonImportLog>(KEYS.importLogs);
  },
  getByHackathon(hackathonId: string): HackathonImportLog[] {
    return this.getAll().filter(l => l.hackathonId === hackathonId);
  },
  save(l: HackathonImportLog): void {
    const all = this.getAll().filter(x => x.id !== l.id);
    write(KEYS.importLogs, [...all, l]);
  },
};
