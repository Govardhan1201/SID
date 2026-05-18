import type { Hackathon, HackathonProject, HackathonTeam } from '@/types';

export function downloadProjectSubmissionsCsv(
  hackathon: Hackathon,
  projects: HackathonProject[],
  teams: HackathonTeam[]
) {
  // Create CSV header
  const rows = [
    ['Project Name', 'Tagline', 'Team Name', 'Track', 'Status', 'GitHub Link', 'Demo Link', 'Video Link', 'Submitted At']
  ];

  // Create rows
  for (const proj of projects) {
    const team = teams.find(t => t.id === proj.teamId);
    const track = hackathon.tracks.find(t => t.id === proj.trackId);
    
    // Clean strings to prevent CSV breaking
    const clean = (str: string | null | undefined) => {
      if (!str) return '';
      return '"' + String(str).replace(/"/g, '""') + '"';
    };

    rows.push([
      clean(proj.title),
      clean(proj.tagline),
      clean(team?.name || 'Unknown Team'),
      clean(track?.name || 'Unknown Track'),
      clean(proj.status),
      clean(proj.githubLink),
      clean(proj.demoLink),
      clean(proj.videoLink),
      clean(proj.submittedAt ? new Date(proj.submittedAt).toLocaleString() : '')
    ]);
  }

  const csvContent = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('url');
  if ((window.navigator as any).msSaveOrOpenBlob) {
    // IE 10+
    (window.navigator as any).msSaveBlob(blob, `${hackathon.name.replace(/\s+/g, '_')}_submissions.csv`);
  } else {
    // Other browsers
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hackathon.name.replace(/\s+/g, '_')}_submissions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
