'use client';
import { useState } from 'react';
import type { Hackathon, HackathonProject, HackathonTeam, HackathonStandings, HackathonTrackResult } from '@/types';
import { updateHackathonProjectStanding } from '@/app/actions/hackathon';
import { Trophy, Medal, Award, Plus, Trash2, Save, Star } from 'lucide-react';

interface RankEntry {
  rank: number;
  teamId: string;
  label: string; // e.g. "Winner", "Runner Up", "3rd Place", custom
}

interface Props {
  hackathon: Hackathon;
  projects: HackathonProject[];
  teams: HackathonTeam[];
  standings: HackathonStandings | null;
  onSave: (standings: HackathonStandings) => void;
  isPublished: boolean;
}

const DEFAULT_LABELS: Record<number, string> = {
  1: 'Winner',
  2: 'Runner Up',
  3: '3rd Place',
  4: '4th Place',
  5: '5th Place',
};

function ordinalLabel(n: number) {
  return DEFAULT_LABELS[n] ?? `${n}th Place`;
}

function rankColor(rank: number) {
  if (rank === 1) return '#fbbf24';   // gold
  if (rank === 2) return '#9ca3af';   // silver
  if (rank === 3) return '#cd7f32';   // bronze
  return 'var(--text-3)';
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={15} />;
  if (rank === 2) return <Medal size={15} />;
  if (rank === 3) return <Award size={15} />;
  return <Star size={15} />;
}

export default function StandingsTable({ hackathon, projects, teams, standings, onSave, isPublished }: Props) {
  // Per-track: array of rank entries (dynamic length)
  const [trackRanks, setTrackRanks] = useState<Record<string, RankEntry[]>>(() => {
    const initial: Record<string, RankEntry[]> = {};
    hackathon.tracks.forEach(t => {
      const trackResult = standings?.results.find(r => r.trackId === t.id);
      if (trackResult && trackResult.rankings.length > 0) {
        initial[t.id] = trackResult.rankings.map(r => ({
          rank: r.rank,
          teamId: r.teamId,
          label: r.prize || ordinalLabel(r.rank),
        }));
      } else {
        // Default: 1 slot (Winner)
        initial[t.id] = [{ rank: 1, teamId: '', label: 'Winner' }];
      }
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function addRank(trackId: string) {
    setTrackRanks(prev => {
      const current = prev[trackId];
      const nextRank = current.length + 1;
      return {
        ...prev,
        [trackId]: [...current, { rank: nextRank, teamId: '', label: ordinalLabel(nextRank) }],
      };
    });
  }

  function removeRank(trackId: string, index: number) {
    setTrackRanks(prev => {
      const updated = prev[trackId].filter((_, i) => i !== index)
        .map((entry, i) => ({ ...entry, rank: i + 1 })); // re-number
      return { ...prev, [trackId]: updated };
    });
  }

  function updateEntry(trackId: string, index: number, field: 'teamId' | 'label', value: string) {
    setTrackRanks(prev => {
      const updated = [...prev[trackId]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [trackId]: updated };
    });
  }

  async function handleSave() {
    setSaving(true);

    const results: HackathonTrackResult[] = hackathon.tracks.map(t => ({
      trackId: t.id,
      rankings: trackRanks[t.id]
        .filter(e => e.teamId)
        .map(e => ({ rank: e.rank, teamId: e.teamId, prize: e.label, notes: '' })),
      specialAwards: [],
    }));

    // Persist standing label to each project in DB
    const promises: Promise<any>[] = [];
    hackathon.tracks.forEach(t => {
      trackRanks[t.id].forEach(entry => {
        if (!entry.teamId) return;
        const proj = projects.find(x => x.teamId === entry.teamId);
        if (proj) promises.push(updateHackathonProjectStanding(proj.id, entry.label));
      });
    });

    await Promise.all(promises);

    const newStandings: HackathonStandings = {
      hackathonId: hackathon.id,
      publishedAt: new Date().toISOString(),
      isPublished: true,
      results,
    };

    onSave(newStandings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {hackathon.tracks.map(track => {
        const trackProjects = projects.filter(p => p.trackId === track.id);
        const ranks = trackRanks[track.id] || [];

        return (
          <div key={track.id} className="card" style={{ padding: 'var(--space-6)' }}>
            {/* Track header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                {track.name}
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{trackProjects.length} submissions</span>
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => addRank(track.id)}
                type="button"
              >
                <Plus size={13} /> Add Rank
              </button>
            </div>

            {/* Rank rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {ranks.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 2fr auto',
                    gap: 'var(--space-3)',
                    alignItems: 'center',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {/* Rank badge */}
                  <div style={{ color: rankColor(entry.rank), display: 'flex', justifyContent: 'center' }}>
                    <RankIcon rank={entry.rank} />
                  </div>

                  {/* Editable label */}
                  <input
                    type="text"
                    className="input"
                    value={entry.label}
                    onChange={e => updateEntry(track.id, idx, 'label', e.target.value)}
                    placeholder={`Rank ${entry.rank} label`}
                    style={{ padding: '6px 10px', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                  />

                  {/* Team selector */}
                  <select
                    className="select"
                    value={entry.teamId}
                    onChange={e => updateEntry(track.id, idx, 'teamId', e.target.value)}
                  >
                    <option value="">-- Select team --</option>
                    {trackProjects.map(p => {
                      const t = teams.find(tm => tm.id === p.teamId);
                      const scores = (p.judgeScores as any[]) || [];
                      let avgStr = '';
                      if (scores.length > 0) {
                        const total = scores.reduce((acc, s) => acc + (s.totalScore || 0), 0);
                        avgStr = ` - Score: ${(total / scores.length).toFixed(1)} (${scores.length} judges)`;
                      }
                      return (
                        <option key={p.teamId} value={p.teamId}>
                          {p.title} {t ? `(${t.name})` : ''}{avgStr}
                        </option>
                      );
                    })}
                  </select>

                  {/* Remove button */}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => removeRank(track.id, idx)}
                    disabled={ranks.length <= 1}
                    style={{ color: 'var(--danger)', padding: 'var(--space-2)', opacity: ranks.length <= 1 ? 0.3 : 1 }}
                    title="Remove this rank"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {trackProjects.length === 0 && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)', textAlign: 'center', padding: 'var(--space-4)' }}>
                  No submissions for this track yet.
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ minWidth: 180 }}
        >
          <Save size={16} />
          {saving ? 'Publishing…' : saved ? '✓ Saved!' : isPublished ? 'Update Standings' : 'Publish Standings'}
        </button>
      </div>
    </div>
  );
}
