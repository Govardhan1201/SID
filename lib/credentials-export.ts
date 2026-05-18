import type { Hackathon, HackathonTeam, HackathonParticipant } from '@/types';

interface CredentialRow {
  teamName: string;
  password: string;
  track: string;
  members: { name: string; email: string; role: string }[];
}

function buildRows(
  hackathon: Hackathon,
  teams: HackathonTeam[],
  participants: HackathonParticipant[],
  userEmails: Map<string, string>,
): CredentialRow[] {
  return teams.map(team => {
    const track = hackathon.tracks.find(t => t.id === team.trackId);
    const members = team.memberIds.map(uid => {
      const part = participants.find(p => p.userId === uid && p.hackathonId === hackathon.id);
      const email = userEmails.get(uid) ?? '';
      return {
        name:  email.split('@')[0] || uid,
        email: email,
        role:  part?.role === 'leader' ? 'Leader' : 'Member',
      };
    });
    return {
      teamName: team.name,
      password: team.plainPassword,
      track:    track?.name ?? 'Unassigned',
      members,
    };
  });
}

// ── Export as CSV ─────────────────────────────────────────────────────────
export function exportCredentialsCSV(
  hackathon: Hackathon,
  teams: HackathonTeam[],
  participants: HackathonParticipant[],
  userEmails: Map<string, string>, // userId → email
): string {
  const lines: string[] = [
    `Hackathon: ${hackathon.name}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Deadline: ${new Date(hackathon.deadline).toLocaleString()}`,
    '',
    'Track,Team Name,Team Password,Login URL,Member Name,Email,Role',
  ];

  const loginUrl = typeof window !== 'undefined' ? window.location.origin + '/login' : 'https://ideaforge.dev/login';

  // Group teams by track
  const byTrack = new Map<string, HackathonTeam[]>();
  for (const team of teams) {
    const trackName = hackathon.tracks.find(t => t.id === team.trackId)?.name ?? 'Unassigned';
    if (!byTrack.has(trackName)) byTrack.set(trackName, []);
    byTrack.get(trackName)!.push(team);
  }

  for (const [trackName, trackTeams] of byTrack.entries()) {
    for (const team of trackTeams) {
      let firstMember = true;
      for (const uid of team.memberIds) {
        const part = participants.find(p => p.userId === uid);
        const email = userEmails.get(uid) ?? '';
        const name  = email.split('@')[0] || uid;
        const role  = part?.role === 'leader' ? 'Leader' : 'Member';
        if (firstMember) {
          lines.push(`"${trackName}","${team.name}","${team.plainPassword}","${loginUrl}","${name}","${email}","${role}"`);
          firstMember = false;
        } else {
          lines.push(`"","","","","${name}","${email}","${role}"`);
        }
      }
      lines.push(''); // blank line between teams
    }
  }

  return lines.join('\n');
}

// ── Trigger download in browser ───────────────────────────────────────────
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function triggerCredentialsDownload(
  hackathon: Hackathon,
  teams: HackathonTeam[],
  participants: HackathonParticipant[],
  userEmails: Map<string, string>,
): void {
  const csv      = exportCredentialsCSV(hackathon, teams, participants, userEmails);
  const filename = `${hackathon.name.replace(/\s+/g, '_')}_credentials.csv`;
  downloadCSV(csv, filename);
}
