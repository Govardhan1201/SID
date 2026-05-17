import { generateTeamPassword } from './password-gen';
import { hashPassword, generateId } from './security';
import { UserStore, StudentStore } from './store';
import {
  HackathonTeamStore, HackathonParticipantStore,
  HackathonProjectStore, HackathonImportLogStore,
} from './hackathon-store';
import type {
  User, StudentProfile,
  HackathonTeam, HackathonParticipant, HackathonProject, HackathonImportLog,
  ImportedParticipantRow,
} from '@/types';

export interface ParsedRow {
  name: string;
  email: string;
  teamName: string;
  role: 'leader' | 'member';
  college: string;
  branch: string;
  year: number;
  _rowIndex: number;
}

export interface ParseError {
  row: number;
  message: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: ParseError[];
}

// ── CSV Parser ────────────────────────────────────────────────────────────
export function parseCSV(text: string): ParseResult {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { rows: [], errors: [{ row: 0, message: 'File is empty or has no data rows.' }] };
  }

  // Detect delimiter
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delim).map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/"/g, ''));

  const nameIdx   = headers.findIndex(h => h === 'name');
  const emailIdx  = headers.findIndex(h => h === 'email');
  const teamIdx   = headers.findIndex(h => ['team_name', 'team', 'teamname'].includes(h));
  const roleIdx   = headers.findIndex(h => h === 'role');
  const collegeIdx = headers.findIndex(h => ['college', 'institution', 'university'].includes(h));
  const branchIdx = headers.findIndex(h => ['branch', 'department', 'dept', 'major'].includes(h));
  const yearIdx   = headers.findIndex(h => ['year', 'year_of_study'].includes(h));

  const errors: ParseError[] = [];
  if (nameIdx  === -1) errors.push({ row: 0, message: 'Missing required column: name' });
  if (emailIdx === -1) errors.push({ row: 0, message: 'Missing required column: email' });
  if (teamIdx  === -1) errors.push({ row: 0, message: 'Missing required column: team_name' });
  if (roleIdx  === -1) errors.push({ row: 0, message: 'Missing required column: role' });
  if (errors.length) return { rows: [], errors };

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim).map(c => c.trim().replace(/"/g, ''));
    const rowNum = i + 1;

    const name  = cols[nameIdx]  ?? '';
    const email = cols[emailIdx] ?? '';
    const team  = cols[teamIdx]  ?? '';
    const role  = (cols[roleIdx] ?? '').toLowerCase();

    if (!name)  { errors.push({ row: rowNum, message: `Row ${rowNum}: name is empty` }); continue; }
    if (!email) { errors.push({ row: rowNum, message: `Row ${rowNum}: email is empty` }); continue; }
    if (!team)  { errors.push({ row: rowNum, message: `Row ${rowNum}: team_name is empty` }); continue; }
    if (!['leader', 'member'].includes(role)) {
      errors.push({ row: rowNum, message: `Row ${rowNum}: role must be "leader" or "member", got "${role}"` });
      continue;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: rowNum, message: `Row ${rowNum}: invalid email "${email}"` });
      continue;
    }

    rows.push({
      name, email: email.toLowerCase(), teamName: team,
      role: role as 'leader' | 'member',
      college: collegeIdx !== -1 ? (cols[collegeIdx] ?? '') : '',
      branch:  branchIdx  !== -1 ? (cols[branchIdx]  ?? '') : '',
      year:    yearIdx    !== -1 ? parseInt(cols[yearIdx] ?? '1', 10) || 1 : 1,
      _rowIndex: rowNum,
    });
  }

  // Validate: each team must have exactly one leader
  const teamGroups = new Map<string, ParsedRow[]>();
  for (const row of rows) {
    if (!teamGroups.has(row.teamName)) teamGroups.set(row.teamName, []);
    teamGroups.get(row.teamName)!.push(row);
  }
  for (const [teamName, members] of teamGroups.entries()) {
    const leaders = members.filter(m => m.role === 'leader');
    if (leaders.length === 0) {
      errors.push({ row: 0, message: `Team "${teamName}" has no leader. Add a row with role=leader.` });
    }
    if (leaders.length > 1) {
      errors.push({ row: 0, message: `Team "${teamName}" has ${leaders.length} leaders. Only one allowed.` });
    }
  }

  return { rows, errors };
}

// ── Account Creator ────────────────────────────────────────────────────────
export interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
  teamsCreated: HackathonTeam[];
}

export async function importParticipants(
  hackathonId: string,
  rows: ParsedRow[],
  existingHackathonEmails: Set<string>,
): Promise<ImportResult> {
  const result: ImportResult = { created: 0, skipped: 0, errors: [], teamsCreated: [] };

  // Group by team
  const teamGroups = new Map<string, ParsedRow[]>();
  for (const row of rows) {
    if (!teamGroups.has(row.teamName)) teamGroups.set(row.teamName, []);
    teamGroups.get(row.teamName)!.push(row);
  }

  for (const [teamName, members] of teamGroups.entries()) {
    const teamPassword = generateTeamPassword(hackathonId, teamName);
    const teamPasswordHash = await hashPassword(teamPassword);
    const teamId = generateId();

    const memberIds: string[] = [];
    let leaderId = '';

    for (const row of members) {
      // Skip if already imported for THIS hackathon
      if (existingHackathonEmails.has(row.email)) {
        result.skipped++;
        continue;
      }

      let userId: string;
      const existingUser = UserStore.getByEmail(row.email);

      if (existingUser) {
        // User already has a platform account — just add them to hackathon
        userId = existingUser.id;
      } else {
        // Create new user account
        userId = generateId();
        const userPasswordHash = await hashPassword(teamPassword); // same as team password initially

        const user: User = {
          id: userId,
          email: row.email,
          passwordHash: userPasswordHash,
          role: 'student',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isVerified: false,
          isBanned: false,
          lastLogin: '',
        };
        UserStore.save(user);

        // Create student profile (minimal — user fills rest later)
        const profile: StudentProfile = {
          userId,
          name: row.name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.name)}`,
          banner: '',
          bio: '',
          college: row.college,
          branch: row.branch,
          year: row.year,
          skills: [],
          domains: [],
          github: '',
          linkedin: '',
          portfolio: '',
          resume: '',
          certificates: [],
          achievements: [],
          badges: [],
          followers: [],
          following: [],
          bookmarks: [],
          profileViews: 0,
          isProfileComplete: false,
          agreeToTerms: true,
        };
        StudentStore.save(profile);
        result.created++;
      }

      memberIds.push(userId);
      if (row.role === 'leader') leaderId = userId;

      // Save participant record
      const participant: HackathonParticipant = {
        hackathonId,
        userId,
        teamId,
        role: row.role,
        joinedAt: new Date().toISOString(),
        addedToPortfolio: false,
      };
      HackathonParticipantStore.save(participant);
    }

    if (memberIds.length === 0) continue;

    // Create hackathon team
    const team: HackathonTeam = {
      id: teamId,
      hackathonId,
      name: teamName,
      passwordHash: teamPasswordHash,
      plainPassword: teamPassword,
      leaderId,
      memberIds,
      trackId: null,
      projectId: null,
      createdAt: new Date().toISOString(),
    };
    HackathonTeamStore.save(team);
    result.teamsCreated.push(team);

    // Create blank project stub for the team
    const project: HackathonProject = {
      id: generateId(),
      hackathonId,
      teamId,
      trackId: '',
      title: '',
      tagline: '',
      description: '',
      problemSolved: '',
      techStack: [],
      githubLink: '',
      demoLink: '',
      videoLink: '',
      presentationLink: '',
      screenshots: [],
      status: 'draft',
      submittedAt: null,
      linkedPortfolioProjectId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    HackathonProjectStore.save(project);
  }

  // Save import log
  const log: HackathonImportLog = {
    id: generateId(),
    hackathonId,
    importedAt: new Date().toISOString(),
    totalRows: rows.length,
    created: result.created,
    skipped: result.skipped,
    errors: result.errors,
  };
  HackathonImportLogStore.save(log);

  return result;
}
