'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getHackathonById, getProjectsByHackathon, getTeamsByHackathon, submitJudgeScore } from '@/app/actions/hackathon';
import { verifyPassword } from '@/lib/security';
import type { Hackathon, HackathonProject, HackathonTeam, ScoringRubric, JudgeScore } from '@/types';
import TrackBadge from '@/components/hackathon/TrackBadge';
import { Shield, Search, ExternalLink, Video, FileText, ChevronRight, LayoutList, Trophy } from 'lucide-react';
import styles from './judge.module.css';

export default function JudgePortalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [judgeName, setJudgeName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [projects, setProjects] = useState<HackathonProject[]>([]);
  const [teams, setTeams] = useState<HackathonTeam[]>([]);
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savingProjectId, setSavingProjectId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const h = await getHackathonById(id);
      if (!h) { router.replace('/'); return; }
      setHackathon(h as unknown as Hackathon);

      // Check if already authenticated in this session
      const token = sessionStorage.getItem(`judge_token_${id}`);
      const jName = sessionStorage.getItem(`judge_name_${id}`);
      if (token === h.judgeToken && jName) {
        setJudgeName(jName);
        await loadData();
        setAuthenticated(true);
      }
    }
    init();
  }, [id, router]);

  async function loadData() {
    setProjects(await getProjectsByHackathon(id) as unknown as HackathonProject[]);
    setTeams(await getTeamsByHackathon(id) as unknown as HackathonTeam[]);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathon) return;
    
    setError('');
    if (!judgeName.trim()) { setError('Please enter your name'); return; }

    const isValid = await verifyPassword(password, hackathon.judgePasswordHash);
    
    if (isValid) {
      sessionStorage.setItem(`judge_token_${id}`, hackathon.judgeToken);
      sessionStorage.setItem(`judge_name_${id}`, judgeName.trim());
      await loadData();
      setAuthenticated(true);
    } else {
      setError('Invalid password');
    }
  }

  function getTeam(teamId: string) {
    return teams.find(t => t.id === teamId);
  }

  if (!hackathon) return null;

  if (!authenticated) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.authIcon}><Shield size={32} /></div>
          <h1 className={styles.authTitle}>{hackathon.name}</h1>
          <p className={styles.authSub}>Judge Access Portal</p>
          
          <form onSubmit={handleLogin} className={styles.authForm}>
            <div className="field">
              <label className="label">Judge Name</label>
              <input 
                type="text" 
                className="input" 
                value={judgeName}
                onChange={e => setJudgeName(e.target.value)}
                placeholder="E.g., Jane Doe"
                autoFocus
              />
            </div>
            <div className="field">
              <label className="label">Enter Judge Password</label>
              <input 
                type="password" 
                className="input" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password provided by admin"
              />
              {error && <p className={styles.errorText}>{error}</p>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Access Submissions
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredProjects = projects.filter(p => {
    if (filterTrack !== 'all' && p.trackId !== filterTrack) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const t = getTeam(p.teamId);
      return p.title.toLowerCase().includes(q) || 
             (t && t.name.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className={styles.portal}>
      {/* Top Navbar */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className={styles.headerBadge}><Shield size={16} /> Judge Portal</div>
            <h1 className={styles.headerTitle}>{hackathon.name}</h1>
            <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)', marginLeft: 'var(--space-4)' }}>
              Welcome, <strong>{judgeName}</strong>
            </span>
          </div>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => {
              sessionStorage.removeItem(`judge_token_${id}`);
              sessionStorage.removeItem(`judge_name_${id}`);
              setAuthenticated(false);
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search project or team name..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.filters}>
            <button 
              className={`btn ${filterTrack === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilterTrack('all')}
            >
              All Tracks
            </button>
            {hackathon.tracks.map(t => (
              <button 
                key={t.id}
                className={`btn ${filterTrack === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setFilterTrack(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.statsBar}>
          Showing {filteredProjects.length} of {projects.length} submissions
        </div>

        <div className={styles.grid}>
          {filteredProjects.map(proj => {
            const team = getTeam(proj.teamId);
            const track = hackathon.tracks.find(t => t.id === proj.trackId);
            
            return (
              <div key={proj.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  {track && <TrackBadge track={track} />}
                  <span className={styles.teamName}>{team?.name}</span>
                </div>
                
                <h3 className={styles.projTitle}>{proj.title}</h3>
                
                <div className={styles.links}>
                  <Link href={`/project/${proj.linkedPortfolioProjectId}`} target="_blank" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    View Full Details <ExternalLink size={14} />
                  </Link>
                </div>

                {/* SCORING PANEL */}
                {hackathon.rubric && hackathon.rubric.length > 0 && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Assign Score</h4>
                    <ScoreForm 
                      projectId={proj.id} 
                      judgeName={judgeName}
                      rubric={hackathon.rubric} 
                      existingScores={(proj.judgeScores as any[]) || []}
                      onSaved={loadData}
                    />
                  </div>
                )}
                
                <div className={styles.cardFooter}>
                  <Link href={`/project/${proj.linkedPortfolioProjectId}`} target="_blank" className={styles.footerLink}>
                    <LayoutList size={13} /> Open in new tab
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <Trophy size={48} className="empty-state__icon" />
            <p className="empty-state__title">No submissions found</p>
            <p className="empty-state__body">Try adjusting your search or track filter.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// SCORING COMPONENT
function ScoreForm({ projectId, judgeName, rubric, existingScores, onSaved }: { 
  projectId: string; 
  judgeName: string; 
  rubric: ScoringRubric[]; 
  existingScores: JudgeScore[]; 
  onSaved: () => void 
}) {
  const existingMyScore = existingScores.find(s => s.judgeName === judgeName);
  const initialValues = existingMyScore ? existingMyScore.scores : {};
  
  const [scores, setScores] = useState<Record<string, number>>(initialValues);
  const [saving, setSaving] = useState(false);

  const totalScore = rubric.reduce((acc, r) => acc + (scores[r.label] || 0), 0);
  const maxPossible = rubric.reduce((acc, r) => acc + r.maxScore, 0);

  async function handleSave() {
    setSaving(true);
    try {
      await submitJudgeScore(projectId, judgeName, scores, totalScore);
      onSaved();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {rubric.map(item => (
        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>{item.label} (/{item.maxScore})</label>
          <input 
            type="number" 
            className="input" 
            style={{ width: '80px', padding: '4px 8px', fontSize: 'var(--text-sm)' }}
            min={0}
            max={item.maxScore}
            value={scores[item.label] !== undefined ? scores[item.label] : ''}
            onChange={e => {
              let val = parseInt(e.target.value);
              if (isNaN(val)) val = 0;
              if (val > item.maxScore) val = item.maxScore;
              if (val < 0) val = 0;
              setScores(prev => ({ ...prev, [item.label]: val }));
            }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Total: {totalScore}/{maxPossible}</span>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : existingMyScore ? 'Update Score' : 'Save Score'}
        </button>
      </div>
    </div>
  );
}
