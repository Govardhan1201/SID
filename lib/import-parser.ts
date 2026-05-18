import type { ImportedParticipantRow } from '@/types';

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


