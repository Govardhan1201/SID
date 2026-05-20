'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { getHackathonById, getTeamsByHackathon, getProjectsByHackathon, getParticipantsByHackathon } from '@/app/actions/hackathon';
import { HackathonStandingsStore } from '@/lib/hackathon-store';
import type { 
  Hackathon, 
  HackathonTeam, 
  HackathonProject,
  HackathonStandings 
} from '@/types';
import DeadlineCountdown from '@/components/hackathon/DeadlineCountdown';
import TrackBadge from '@/components/hackathon/TrackBadge';
import { Trophy, Clock, Users, ArrowRight, CheckCircle2, ChevronRight, AlertCircle, Medal, Megaphone } from 'lucide-react';
import styles from './hackathon.module.css';

export default function HackathonPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { userId, isLoading } = useAuth();
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [myTeam, setMyTeam] = useState<HackathonTeam | null>(null);
  const [myProject, setMyProject] = useState<HackathonProject | null>(null);
  const [allProjects, setAllProjects] = useState<HackathonProject[]>([]);
  const [standings, setStandings] = useState<HackathonStandings | null>(null);
  const [allTeams, setAllTeams] = useState<HackathonTeam[]>([]);

  useEffect(() => {
    async function loadData() {
      const h = await getHackathonById(id);
      if (!h) { router.replace('/explore'); return; }
      setHackathon(h as unknown as Hackathon);

      const projs = await getProjectsByHackathon(id);
      setAllProjects(projs as unknown as HackathonProject[]);
      
      const teams = await getTeamsByHackathon(id);
      setAllTeams(teams as unknown as HackathonTeam[]);

      if (h.status === 'completed' || h.status === 'judging') {
        const st = HackathonStandingsStore.getByHackathon(id);
        if (st?.isPublished) setStandings(st);
      }

      if (userId) {
        const participants = await getParticipantsByHackathon(id);
        const participant = participants.find(p => p.userId === userId);
        if (participant) {
          const team = teams.find(t => t.id === participant.teamId);
          if (team) {
            setMyTeam(team as unknown as HackathonTeam);
            const proj = projs.find(p => p.teamId === team.id);
            if (proj) setMyProject(proj as unknown as HackathonProject);
          }
        }
      }
    }
    loadData();
  }, [id, userId, router]);

  if (isLoading || !hackathon) return null;

  const isPastDeadline = new Date(hackathon.deadline) < new Date();
  
  function getTeamByProjectId(linkedPortfolioProjectId: string | null) {
    if (!linkedPortfolioProjectId) return null;
    const p = allProjects.find(proj => proj.linkedPortfolioProjectId === linkedPortfolioProjectId);
    if (!p) return null;
    return allTeams.find(t => t.id === p.teamId);
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        
        {/* HERO */}
        <section className={styles.hero}>
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className={styles.heroMeta}>
              <span className={`badge ${hackathon.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                {hackathon.status.toUpperCase()}
              </span>
              <DeadlineCountdown deadline={hackathon.deadline} />
            </div>
            
            <h1 className={styles.title}>{hackathon.name}</h1>
            {hackathon.tagline && <p className={styles.tagline}>{hackathon.tagline}</p>}
            
            <div className={styles.heroStats}>
              <span><Users size={16} /> {allTeams.length} Teams Registered</span>
              <span><CheckCircle2 size={16} /> {allProjects.length} Projects Submitted</span>
            </div>
          </div>
          <div className={styles.heroBg} />
        </section>

        <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
          <div className={styles.layout}>
            
            {/* MAIN CONTENT */}
            <div className={styles.mainContent}>
              
              {/* My Team / Participant Action Area */}
              {userId && myTeam && hackathon.status !== 'completed' && (
                <div className={styles.actionCard}>
                  <div className={styles.actionHeader}>
                    <div>
                      <h3 className={styles.actionTitle}>Your Team: {myTeam.name}</h3>
                      <p className={styles.actionSub}>Track: {myTeam.trackId ? hackathon.tracks.find(t => t.id === myTeam.trackId)?.name : 'Not selected'}</p>
                    </div>
                    {myProject ? (
                      <span className="badge badge-success"><CheckCircle2 size={13} /> Project Submitted</span>
                    ) : (
                      <span className="badge badge-warning"><Clock size={13} /> Pending Submission</span>
                    )}
                  </div>
                  
                  {isPastDeadline ? (
                    <div className={styles.deadlineAlert}>
                      <AlertCircle size={16} /> The submission deadline has passed.
                    </div>
                  ) : (
                    <div className={styles.actionButtons}>
                      {myProject ? (
                        <Link href={`/hackathon/${hackathon.id}/project/edit`} className="btn btn-secondary">
                          Edit Submission
                        </Link>
                      ) : (
                        <Link href={`/hackathon/${hackathon.id}/project/new`} className="btn btn-primary">
                          Submit Project <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Announcements */}
              {hackathon.announcements && hackathon.announcements.length > 0 && (
                <section className={styles.section} style={{ marginBottom: 'var(--space-8)' }}>
                  <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Megaphone size={20} color="var(--primary)" /> Live Announcements
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {hackathon.announcements.map(ann => (
                      <div key={ann.id} style={{ padding: 'var(--space-4)', borderLeft: `4px solid var(--${ann.type === 'urgent' ? 'danger' : ann.type === 'info' ? 'primary' : ann.type})`, background: 'var(--surface-1)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: `var(--${ann.type === 'urgent' ? 'danger' : ann.type === 'info' ? 'primary' : ann.type})`, textTransform: 'uppercase' }}>{ann.type}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>{new Date(ann.timestamp).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-1)' }}>{ann.text}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Description */}
              {hackathon.description && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>About the Hackathon</h2>
                  <div className={styles.description}>{hackathon.description}</div>
                </section>
              )}

              {/* Tracks */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Problem Tracks</h2>
                <div className={styles.tracksGrid}>
                  {hackathon.tracks.map(track => (
                    <div key={track.id} className={styles.trackCard}>
                      <h3 className={styles.trackName}>{track.name}</h3>
                      {track.description && <p className={styles.trackDesc}>{track.description}</p>}
                      {track.problemStatement && (
                        <div className={styles.trackProblem}>
                          <strong>Problem Statement:</strong>
                          <p>{track.problemStatement}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Results / Standings */}
              {standings && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Trophy size={20} color="var(--primary)" /> Final Standings
                  </h2>
                  <div className={styles.standingsList}>
                    {hackathon.tracks.map(track => {
                      const trackResult = standings.results.find(r => r.trackId === track.id);
                      const winnerTeamId = trackResult?.rankings.find(r => r.rank === 1)?.teamId;
                      const runnerUpTeamId = trackResult?.rankings.find(r => r.rank === 2)?.teamId;
                      
                      if (!winnerTeamId && !runnerUpTeamId) return null;
                      
                      const winner = winnerTeamId ? allProjects.find(p => p.teamId === winnerTeamId) : null;
                      const runnerUp = runnerUpTeamId ? allProjects.find(p => p.teamId === runnerUpTeamId) : null;

                      return (
                        <div key={track.id} className={styles.standingCard}>
                          <div className={styles.standingHeader}>
                            <TrackBadge track={track} />
                          </div>
                          <div className={styles.standingBody}>
                            {winner && (
                              <div className={styles.winnerRow}>
                                <Trophy size={24} color="#fbbf24" className={styles.winnerIcon} />
                                <div>
                                  <div className={styles.winnerLabel}>Winner</div>
                                  <Link href={`/project/${winner.linkedPortfolioProjectId}`} className={styles.winnerTitle}>
                                    {winner.title}
                                  </Link>
                                  <div className={styles.winnerTeam}>Team: {getTeamByProjectId(winner.linkedPortfolioProjectId)?.name}</div>
                                </div>
                              </div>
                            )}
                            {runnerUp && (
                              <div className={styles.runnerUpRow}>
                                <Medal size={20} color="#9ca3af" className={styles.runnerUpIcon} />
                                <div>
                                  <div className={styles.runnerUpLabel}>Runner Up</div>
                                  <Link href={`/project/${runnerUp.linkedPortfolioProjectId}`} className={styles.runnerUpTitle}>
                                    {runnerUp.title}
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Submissions Grid */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>All Submissions ({allProjects.length})</h2>
                {allProjects.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle2 size={32} className="empty-state__icon" />
                    <p className="empty-state__title">No submissions yet.</p>
                  </div>
                ) : (
                  <div className={styles.submissionsGrid}>
                    {allProjects.map(proj => {
                      const team = getTeamByProjectId(proj.linkedPortfolioProjectId);
                      const track = hackathon.tracks.find(t => t.id === proj.trackId);
                      return (
                        <div key={proj.id} className={styles.subCard}>
                          <div className={styles.subTop}>
                            {track && <TrackBadge track={track} />}
                          </div>
                          <Link href={`/project/${proj.linkedPortfolioProjectId}`} className={styles.subTitleLink}>
                            <h3 className={styles.subTitle}>{proj.title}</h3>
                          </Link>
                          <p className={styles.subTeam}>Team: <strong>{team?.name || 'Unknown'}</strong></p>
                          <Link href={`/project/${proj.linkedPortfolioProjectId}`} className={styles.subLink}>
                            View Project <ChevronRight size={14} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>

            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                <h3 className={styles.sideTitle}>Key Dates</h3>
                <div className={styles.dateList}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Hackathon Created</span>
                    <span className={styles.dateValue}>{new Date(hackathon.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Submission Deadline</span>
                    <span className={styles.dateValue} style={{ color: isPastDeadline ? 'var(--danger)' : 'inherit' }}>
                      {new Date(hackathon.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {hackathon.registrationLink ? (
                <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--primary-dim)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                  <h3 className={styles.sideTitle} style={{ color: 'var(--primary)' }}>Register Now</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 'var(--space-4)' }}>
                    Registration for this hackathon is handled externally.
                  </p>
                  <a href={hackathon.registrationLink.startsWith('http') ? hackathon.registrationLink : `https://${hackathon.registrationLink}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%' }}>Register Externally <ArrowRight size={15} style={{ marginLeft: 6 }} /></a>
                </div>
              ) : (
                !userId && hackathon.status !== 'completed' && (
                  <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--primary-dim)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                    <h3 className={styles.sideTitle} style={{ color: 'var(--primary)' }}>Are you a participant?</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 'var(--space-4)' }}>
                      Log in with your email to view your team and submit your project.
                    </p>
                    <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>Log In</Link>
                  </div>
                )
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
