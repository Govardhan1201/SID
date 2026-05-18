'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { 
  getHackathonById, 
  getTeamsByHackathon, 
  getParticipantsByHackathon, 
  getProjectsByHackathon,
  updateHackathonStatus,
  addHackathonAnnouncement,
  deleteHackathonAnnouncement,
  deleteHackathon
} from '@/app/actions/hackathon';
// Fallback for standings if needed locally, though standings should ideally also migrate.
import { HackathonStandingsStore } from '@/lib/hackathon-store';
import type { 
  Hackathon, 
  HackathonTeam, 
  HackathonParticipant, 
  HackathonProject,
  HackathonStandings 
} from '@/types';
import ImportWizard from '@/components/hackathon/ImportWizard';
import StandingsTable from '@/components/hackathon/StandingsTable';
import DeadlineCountdown from '@/components/hackathon/DeadlineCountdown';
import { triggerCredentialsDownload } from '@/lib/credentials-export';
import { downloadProjectSubmissionsCsv } from '@/lib/csv-export';
import { generateId } from '@/lib/security';
import { 
  Settings, Users, Trophy, Layers, Copy, CheckCircle, ExternalLink,
  ChevronLeft, LayoutDashboard, Calendar, Download, Megaphone, Trash2, Plus
} from 'lucide-react';
import styles from './manage.module.css';

type Tab = 'overview' | 'import' | 'announcements' | 'standings' | 'settings';

export default function ManageHackathonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { role, isLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('overview');
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<HackathonTeam[]>([]);
  const [participants, setParticipants] = useState<HackathonParticipant[]>([]);
  const [projects, setProjects] = useState<HackathonProject[]>([]);
  const [standings, setStandings] = useState<HackathonStandings | null>(null);
  const [copied, setCopied] = useState(false);

  // Announcement state
  const [annText, setAnnText] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'urgent'>('info');

  useEffect(() => {
    if (!isLoading && role !== 'admin') router.replace('/dashboard');
  }, [role, isLoading, router]);

  useEffect(() => {
    async function loadData() {
      const h = await getHackathonById(id);
      if (!h) { router.replace('/admin/hackathons'); return; }
      
      setHackathon(h as unknown as Hackathon);
      setTeams((await getTeamsByHackathon(id)) as unknown as HackathonTeam[]);
      setParticipants((await getParticipantsByHackathon(id)) as unknown as HackathonParticipant[]);
      setProjects((await getProjectsByHackathon(id)) as unknown as HackathonProject[]);
      
      // Standings are still on localStorage for this intermediate phase
      setStandings(HackathonStandingsStore.getByHackathon(id));
    }
    loadData();
  }, [id, router]);

  if (isLoading || role !== 'admin' || !hackathon) return null;

  function copyJudgeLink() {
    const url = `${window.location.origin}/hackathon/${hackathon?.id}/judge`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleStatusChange(newStatus: Hackathon['status']) {
    if (!hackathon) return;
    await updateHackathonStatus(hackathon.id, newStatus);
    setHackathon({ ...hackathon, status: newStatus, updatedAt: new Date().toISOString() });
  }

  async function handleImportComplete(newTeams: HackathonTeam[]) {
    // Refresh data
    setTeams((await getTeamsByHackathon(id)) as unknown as HackathonTeam[]);
    setParticipants((await getParticipantsByHackathon(id)) as unknown as HackathonParticipant[]);
  }

  function handleSaveStandings(newStandings: HackathonStandings) {
    HackathonStandingsStore.save(newStandings);
    setStandings(newStandings);
    if (hackathon && hackathon.status !== 'completed') {
      handleStatusChange('completed');
    }
  }

  function downloadAllCredentials() {
    // Re-download credentials for ALL teams
    const userEmails = new Map<string, string>();
    const { UserStore } = require('@/lib/store');
    
    for (const team of teams) {
      for (const uid of team.memberIds) {
        const u = UserStore.getById(uid);
        if (u) userEmails.set(uid, u.email);
      }
    }
    if (hackathon) {
      triggerCredentialsDownload(hackathon, teams, participants, userEmails);
    }
  }

  function handleExportSubmissions() {
    if (hackathon && projects.length > 0) {
      downloadProjectSubmissionsCsv(hackathon, projects, teams);
    }
  }

  async function handleAddAnnouncement() {
    if (!hackathon || !annText.trim()) return;
    const newAnn = await addHackathonAnnouncement(hackathon.id, annText.trim(), annType);
    setHackathon({
      ...hackathon,
      announcements: [newAnn as unknown as any, ...(hackathon.announcements || [])]
    });
    setAnnText('');
  }

  async function handleDeleteAnnouncement(annId: string) {
    if (!hackathon) return;
    await deleteHackathonAnnouncement(annId);
    setHackathon({
      ...hackathon,
      announcements: (hackathon.announcements || []).filter(a => a.id !== annId)
    });
  }

  const isPastDeadline = new Date(hackathon.deadline) < new Date();

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          
          <Link href="/admin/hackathons" className={styles.backLink}>
            <ChevronLeft size={14} /> Back to all hackathons
          </Link>

          <div className={styles.header}>
            <div>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{hackathon.name}</h1>
                <span className={`badge ${hackathon.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                  {hackathon.status}
                </span>
              </div>
              <div className={styles.metaRow}>
                <span><Calendar size={13} /> {new Date(hackathon.createdAt).toLocaleDateString()}</span>
                <span><Layers size={13} /> {hackathon.tracks.length} tracks</span>
                <DeadlineCountdown deadline={hackathon.deadline} />
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <select 
                className="select" 
                value={hackathon.status}
                onChange={e => handleStatusChange(e.target.value as Hackathon['status'])}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="judging">Judging</option>
                <option value="completed">Completed</option>
              </select>
              <Link href={`/hackathon/${hackathon.id}`} className="btn btn-secondary" target="_blank">
                <ExternalLink size={14} /> View Public Page
              </Link>
            </div>
          </div>

          <div className={styles.layout}>
            {/* Sidebar Tabs */}
            <aside className={styles.sidebar}>
              {[
                { id: 'overview', icon: <LayoutDashboard size={16} />, label: 'Overview' },
                { id: 'import', icon: <Users size={16} />, label: 'Participants' },
                { id: 'announcements', icon: <Megaphone size={16} />, label: 'Announcements' },
                { id: 'standings', icon: <Trophy size={16} />, label: 'Standings' },
                { id: 'settings', icon: <Settings size={16} />, label: 'Settings' },
              ].map(t => (
                <button 
                  key={t.id} 
                  className={`sidebar__item ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id as Tab)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </aside>

            {/* Content Area */}
            <div className={styles.content}>
              
              {/* ── OVERVIEW ── */}
              {tab === 'overview' && (
                <>
                  <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
                    <div className="stat-card">
                      <p className="stat-card__label">Participants</p>
                      <p className="stat-card__value">{participants.length}</p>
                    </div>
                    <div className="stat-card">
                      <p className="stat-card__label">Teams</p>
                      <p className="stat-card__value">{teams.length}</p>
                    </div>
                    <div className="stat-card">
                      <p className="stat-card__label">Submissions</p>
                      <p className="stat-card__value">{projects.length}</p>
                    </div>
                  </div>

                  {projects.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={handleExportSubmissions}>
                        <Download size={15} /> Export Submissions CSV
                      </button>
                    </div>
                  )}

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Judge Access</h2>
                    <p className={styles.sectionDesc}>
                      Share this link and password with judges. They don't need platform accounts.
                    </p>
                    
                    <div className={styles.judgeCard}>
                      <div className="field">
                        <label className="label">Judge Portal Link</label>
                        <div className={styles.copyRow}>
                          <input 
                            type="text" 
                            className="input" 
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/hackathon/${hackathon.id}/judge`} 
                            readOnly 
                          />
                          <button className="btn btn-secondary" onClick={copyJudgeLink}>
                            {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      </div>
                      <div className="field">
                        <label className="label">Judge Password</label>
                        <input type="text" className="input" value="******** (Hidden for security)" readOnly />
                        <p className="hint">Set during creation. Update in settings if lost.</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Tracks</h2>
                    <div className={styles.trackList}>
                      {hackathon.tracks.map(t => (
                        <div key={t.id} className={styles.trackItem}>
                          <strong>{t.name}</strong>
                          <span className="badge badge-neutral">{projects.filter(p => p.trackId === t.id).length} projects</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── IMPORT ── */}
              {tab === 'import' && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Participants & Teams</h2>
                    {teams.length > 0 && (
                      <button className="btn btn-secondary btn-sm" onClick={downloadAllCredentials}>
                        <Download size={14} /> Download All Credentials
                      </button>
                    )}
                  </div>
                  
                  <ImportWizard 
                    hackathon={hackathon} 
                    existingParticipants={participants}
                    onImportComplete={handleImportComplete}
                  />

                  {teams.length > 0 && (
                    <div className={styles.section} style={{ marginTop: 'var(--space-8)' }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Imported Teams ({teams.length})</h3>
                      <div className="table-wrapper">
                        <table className="table" style={{ width: '100%', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>Team Name</th>
                              <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>Members</th>
                              <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>Track</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teams.slice(0, 20).map(t => (
                              <tr key={t.id}>
                                <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-2)' }}><strong>{t.name}</strong></td>
                                <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-2)' }}>{t.memberIds.length}</td>
                                <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-2)' }}>{t.trackId ? hackathon.tracks.find(x => x.id === t.trackId)?.name : 'Not selected'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {teams.length > 20 && <div style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--text-4)' }}>Showing 20 of {teams.length}</div>}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── ANNOUNCEMENTS ── */}
              {tab === 'announcements' && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Live Announcements</h2>
                  </div>
                  
                  <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Post New Announcement</h3>
                    <div className="field">
                      <label className="label">Message</label>
                      <textarea 
                        className="textarea" 
                        rows={3} 
                        placeholder="Type your announcement here..."
                        value={annText}
                        onChange={e => setAnnText(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                      <select 
                        className="select" 
                        value={annType} 
                        onChange={e => setAnnType(e.target.value as any)}
                        style={{ width: '150px' }}
                      >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <button className="btn btn-primary" onClick={handleAddAnnouncement} disabled={!annText.trim()}>
                        <Plus size={16} /> Post Announcement
                      </button>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Past Announcements</h3>
                    {(!hackathon.announcements || hackathon.announcements.length === 0) ? (
                      <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                        <Megaphone size={32} style={{ color: 'var(--text-4)' }} />
                        <p style={{ color: 'var(--text-3)' }}>No announcements posted yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {hackathon.announcements.map(ann => (
                          <div key={ann.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-1)' }}>
                            <div>
                              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                <span className={`badge badge-${ann.type === 'urgent' ? 'danger' : ann.type === 'info' ? 'primary' : ann.type}`}>{ann.type}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>{new Date(ann.timestamp).toLocaleString()}</span>
                              </div>
                              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-1)' }}>{ann.text}</p>
                            </div>
                            <button className="btn btn-ghost" style={{ color: 'var(--danger)', padding: 'var(--space-2)' }} onClick={() => handleDeleteAnnouncement(ann.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── STANDINGS ── */}
              {tab === 'standings' && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Publish Standings</h2>
                  </div>
                  {hackathon.status === 'draft' || hackathon.status === 'active' ? (
                    <div className="empty-state">
                      <Trophy size={40} className="empty-state__icon" />
                      <p className="empty-state__title">Judging not active</p>
                      <p className="empty-state__body">Change hackathon status to "Judging" or "Completed" to publish standings.</p>
                    </div>
                  ) : (
                    <StandingsTable 
                      hackathon={hackathon}
                      projects={projects}
                      teams={teams}
                      standings={standings}
                      onSave={handleSaveStandings}
                      isPublished={!!standings?.isPublished}
                    />
                  )}
                </>
              )}

              {/* ── SETTINGS ── */}
              {tab === 'settings' && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Settings</h2>
                  </div>
                  
                  <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Basic Details</h3>
                    <div className="field">
                      <label className="label">Name</label>
                      <input type="text" className="input" defaultValue={hackathon.name} readOnly />
                    </div>
                    <div className="field">
                      <label className="label">Deadline</label>
                      <input 
                        type="datetime-local" 
                        className="input" 
                        defaultValue={new Date(new Date(hackathon.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)} 
                        readOnly 
                      />
                    </div>
                    <p className="hint">For MVP, editing these fields post-creation is disabled. Delete and recreate if needed.</p>
                  </div>

                  <div className="card" style={{ padding: 'var(--space-6)', border: '1px solid var(--danger)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>Danger Zone</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginBottom: 'var(--space-4)' }}>
                      Deleting this hackathon will remove all associated teams and projects. Accounts created during import will remain.
                    </p>
                    <button className="btn" style={{ background: 'var(--danger)', color: 'white', border: 'none' }} onClick={async () => {
                      if (confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
                        await deleteHackathon(hackathon.id);
                        router.replace('/admin/hackathons');
                      }
                    }}>
                      Delete Hackathon
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
