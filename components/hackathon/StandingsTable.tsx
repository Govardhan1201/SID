'use client';
import { useState } from 'react';
import type { Hackathon, HackathonProject, HackathonTeam, HackathonStandings, HackathonTrackResult } from '@/types';
import { Trophy, Medal, Save } from 'lucide-react';

interface Props {
  hackathon: Hackathon;
  projects: HackathonProject[];
  teams: HackathonTeam[];
  standings: HackathonStandings | null;
  onSave: (standings: HackathonStandings) => void;
  isPublished: boolean;
}

export default function StandingsTable({ hackathon, projects, teams, standings, onSave, isPublished }: Props) {
  const [editableStandings, setEditableStandings] = useState<Record<string, {
    winnerTeamId?: string;
    runnerUpTeamId?: string;
  }>>(() => {
    const initial: any = {};
    hackathon.tracks.forEach(t => {
      const trackResult = standings?.results.find(r => r.trackId === t.id);
      const winner = trackResult?.rankings.find(r => r.rank === 1)?.teamId;
      const runnerUp = trackResult?.rankings.find(r => r.rank === 2)?.teamId;
      
      initial[t.id] = {
        winnerTeamId: winner || '',
        runnerUpTeamId: runnerUp || ''
      };
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    
    const results: HackathonTrackResult[] = hackathon.tracks.map(t => {
      const rankings = [];
      if (editableStandings[t.id].winnerTeamId) {
        rankings.push({ rank: 1, teamId: editableStandings[t.id].winnerTeamId!, prize: 'Winner', notes: '' });
      }
      if (editableStandings[t.id].runnerUpTeamId) {
        rankings.push({ rank: 2, teamId: editableStandings[t.id].runnerUpTeamId!, prize: 'Runner Up', notes: '' });
      }
      return {
        trackId: t.id,
        rankings,
        specialAwards: []
      };
    });

    const newStandings: HackathonStandings = {
      hackathonId: hackathon.id,
      publishedAt: new Date().toISOString(),
      isPublished: true, 
      results
    };

    onSave(newStandings);
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {hackathon.tracks.map(track => {
        const trackProjects = projects.filter(p => p.trackId === track.id);
        
        return (
          <div key={track.id} className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {track.name}
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{trackProjects.length} submissions</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              {/* Winner Selection */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '120px', color: '#fbbf24', fontWeight: 600 }}>
                  <Trophy size={16} /> Winner
                </div>
                <div style={{ flex: 1 }}>
                  <select 
                    className="select" 
                    value={editableStandings[track.id].winnerTeamId}
                    onChange={e => setEditableStandings(prev => ({
                      ...prev,
                      [track.id]: { ...prev[track.id], winnerTeamId: e.target.value }
                    }))}
                  >
                    <option value="">-- Select Winner --</option>
                    {trackProjects.map(p => {
                      const t = teams.find(team => team.id === p.teamId);
                      return (
                        <option key={p.teamId} value={p.teamId}>
                          {p.title} (Team: {t?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Runner Up Selection */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '120px', color: '#9ca3af', fontWeight: 600 }}>
                  <Medal size={16} /> Runner Up
                </div>
                <div style={{ flex: 1 }}>
                  <select 
                    className="select" 
                    value={editableStandings[track.id].runnerUpTeamId}
                    onChange={e => setEditableStandings(prev => ({
                      ...prev,
                      [track.id]: { ...prev[track.id], runnerUpTeamId: e.target.value }
                    }))}
                  >
                    <option value="">-- Select Runner Up --</option>
                    {trackProjects.map(p => {
                      const t = teams.find(team => team.id === p.teamId);
                      return (
                        <option key={p.teamId} value={p.teamId}>
                          {p.title} (Team: {t?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Publishing...' : (isPublished ? 'Update Standings' : 'Publish Standings')}
        </button>
      </div>
    </div>
  );
}
