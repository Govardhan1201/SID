'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { getAllUsersAdmin, toggleUserBanStatus, getAllAuditLogs, createAuditLog } from '@/app/actions/admin';
import { getAllProjects, updateProject } from '@/app/actions/projects';
import { getAllIdeas, updateIdea } from '@/app/actions/ideas';
import { getAllStudentProfiles } from '@/app/actions/users';
import type { Project, Idea } from '@/types';
import {
  LayoutDashboard, Users, Layers, Lightbulb, Shield, Settings,
  CheckCircle, XCircle, Star, Archive, Flag, ChevronRight, Trophy,
  ExternalLink, Code, Bell, RotateCcw, ArrowLeft
} from 'lucide-react';
import styles from './admin.module.css';

type AdminTab = 'overview' | 'content' | 'archived' | 'users' | 'audit' | 'notifications';

export default function AdminPage() {
  const { userId, role, isLoading } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && (!userId || role !== 'admin')) router.replace('/login');
  }, [userId, role, isLoading, router]);

  const loadData = async () => {
    const [p, i, u, a, sp] = await Promise.all([
      getAllProjects(),
      getAllIdeas(),
      getAllUsersAdmin(),
      getAllAuditLogs(),
      getAllStudentProfiles()
    ]);
    setProjects(p as unknown as Project[]);
    setIdeas(i as unknown as Idea[]);
    setUsers(u);
    setAuditLogs(a);
    setStudentProfiles(sp);
  };

  useEffect(() => { loadData(); }, []);

  const students  = users.filter(u => u.role === 'student');
  const recruiters = users.filter(u => u.role === 'recruiter');
  const pendingP  = projects.filter(p => p.moderationStatus === 'pending');
  const pendingI  = ideas.filter(i => i.moderationStatus === 'pending');
  const archivedP = projects.filter(p => p.moderationStatus === 'archived');
  const archivedI = ideas.filter(i => i.moderationStatus === 'archived');

  async function logAction(action: string, targetType: string, targetId: string, details: string) {
    if (!userId) return;
    await createAuditLog({ adminId: userId, action, targetType, targetId, details });
  }

  async function moderateProject(id: string, status: 'approved' | 'rejected' | 'featured' | 'archived') {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    await updateProject(id, { moderationStatus: status, isFeatured: status === 'featured' });
    await logAction(status, 'project', id, `Project "${p.title}" ${status}`);
    await loadData();
  }

  async function moderateIdea(id: string, status: 'approved' | 'rejected' | 'featured' | 'archived') {
    const i = ideas.find(x => x.id === id);
    if (!i) return;
    await updateIdea(id, { moderationStatus: status, isFeatured: status === 'featured' });
    await logAction(status, 'idea', id, `Idea "${i.title}" ${status}`);
    await loadData();
  }

  async function toggleBan(uid: string) {
    const u = users.find(x => x.id === uid);
    if (!u || u.role === 'admin') return;
    await toggleUserBanStatus(uid, !u.isBanned);
    await logAction(u.isBanned ? 'unban' : 'ban', 'user', uid, `User ${u.email} ${u.isBanned ? 'unbanned' : 'banned'}`);
    await loadData();
  }

  const domainCounts: Record<string, number> = {};
  projects.forEach(p => { domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1; });
  const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (isLoading) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.adminBadge}><Shield size={16} /> Admin Panel</div>
              {([
                ['overview',       'Overview',                         <LayoutDashboard key="d" size={16}/>],
                ['content',        `Moderation (${pendingP.length + pendingI.length})`, <Flag key="f" size={16}/>],
                ['archived',       `Archived (${archivedP.length + archivedI.length})`, <Archive key="ar" size={16}/>],
                ['users',          'Users',                           <Users key="u" size={16}/>],
                ['audit',          'Audit Log',                       <Settings key="s" size={16}/>],
                ['notifications',  `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, <Bell key="b" size={16}/>],
              ] as const).map(([t, label, icon]) => (
                <button key={t} className={`sidebar__item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t as AdminTab)}>
                  {icon} {label}
                  {t === 'notifications' && unreadCount > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: '#fff', borderRadius: '999px', padding: '0 6px', fontSize: '11px', fontWeight: 700 }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
              <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-2) 0' }} />
              <Link href="/admin/analytics" className="sidebar__item">
                <LayoutDashboard size={16} /> Analytics
              </Link>
              <Link href="/admin/hackathons" className="sidebar__item">
                <Trophy size={16} /> Hackathons
              </Link>
              <Link href="/admin/create-admin" className="sidebar__item">
                <Shield size={16} /> Create Admin
              </Link>
            </aside>

            {/* Content */}
            <div className={styles.content}>

              {/* ── Overview ── */}
              {tab === 'overview' && (
                <>
                  <h1 className={styles.pageTitle}>Platform Overview</h1>
                  <div className="grid-4">
                    <div className="stat-card"><p className="stat-card__label">Total users</p><p className="stat-card__value">{users.length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Students</p><p className="stat-card__value">{students.length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Recruiters</p><p className="stat-card__value">{recruiters.length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Pending review</p><p className="stat-card__value" style={{color:'var(--warning)'}}>{pendingP.length + pendingI.length}</p></div>
                  </div>
                  <div className="grid-4" style={{marginTop:'var(--space-2)'}}>
                    <div className="stat-card"><p className="stat-card__label">Total projects</p><p className="stat-card__value">{projects.length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Total ideas</p><p className="stat-card__value">{ideas.length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Featured projects</p><p className="stat-card__value">{projects.filter(p=>p.isFeatured).length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Archived content</p><p className="stat-card__value">{archivedP.length + archivedI.length}</p></div>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Top domains</h2>
                    <div className={styles.domainList}>
                      {topDomains.map(([domain, count]) => (
                        <div key={domain} className={styles.domainRow}>
                          <span className={styles.domainName}>{domain}</span>
                          <div className={styles.domainBar}><div className={styles.domainFill} style={{width:`${(count/Math.max(projects.length,1))*100}%`}}/></div>
                          <span className={styles.domainCount}>{count} projects</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Featured content</h2>
                    {projects.filter(p=>p.isFeatured).length === 0 && ideas.filter(i=>i.isFeatured).length === 0 && (
                      <p style={{color:'var(--text-4)',fontSize:'var(--text-sm)'}}>No featured content yet.</p>
                    )}
                    <div className={styles.featuredList}>
                      {projects.filter(p=>p.isFeatured).map(p=>(
                        <div key={p.id} className={styles.featuredRow}>
                          <div>
                            <Link href={`/project/${p.id}`} className={styles.featuredTitle}>{p.title}</Link>
                            <span className="badge badge-neutral" style={{marginLeft:'var(--space-2)'}}>{p.domain}</span>
                            <span className="badge badge-primary" style={{marginLeft:'var(--space-2)'}}>Project</span>
                          </div>
                          <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'approved')}>
                            <XCircle size={13}/> Unfeature
                          </button>
                        </div>
                      ))}
                      {ideas.filter(i=>i.isFeatured).map(i=>(
                        <div key={i.id} className={styles.featuredRow}>
                          <div>
                            <Link href={`/idea/${i.id}`} className={styles.featuredTitle}>{i.title}</Link>
                            <span className="badge badge-neutral" style={{marginLeft:'var(--space-2)'}}>{i.domain}</span>
                            <span className="badge badge-accent" style={{marginLeft:'var(--space-2)'}}>Idea</span>
                          </div>
                          <button className="btn btn-secondary btn-sm" onClick={()=>moderateIdea(i.id,'approved')}>
                            <XCircle size={13}/> Unfeature
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Content moderation ── */}
              {tab === 'content' && (
                <>
                  <h1 className={styles.pageTitle}>Moderation Queue</h1>

                  {pendingP.length + pendingI.length === 0 && (
                    <div className="empty-state"><CheckCircle size={40} style={{color:'var(--success)'}}/><p className="empty-state__title">Queue is clear</p><p className="empty-state__body">All submissions have been reviewed.</p></div>
                  )}

                  {pendingP.length > 0 && (
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}><Layers size={15}/> Pending projects ({pendingP.length})</h2>
                      {pendingP.map(p => {
                        const author = studentProfiles.find(x => x.userId === p.authorId);
                        return (
                          <div key={p.id} className={styles.modCard}>
                            <div className={styles.modInfo}>
                              <Link href={`/project/${p.id}`} className={styles.modTitle}>{p.title}</Link>
                              <p className={styles.modSub}>{p.tagline}</p>
                              <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-2)',flexWrap:'wrap'}}>
                                <span className="badge badge-neutral">{p.domain}</span>
                                <span className="badge badge-neutral">{p.visibility}</span>
                                {author && <span className="badge badge-neutral">{author.name} · {author.college}</span>}
                              </div>
                              {/* ── Link verification ── */}
                              <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-3)',flexWrap:'wrap'}}>
                                {p.githubLink && (
                                  <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                    <Code size={13}/> GitHub ↗
                                  </a>
                                )}
                                {p.liveDemo && (
                                  <a href={p.liveDemo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                    <ExternalLink size={13}/> Live Demo ↗
                                  </a>
                                )}
                                {!p.githubLink && !p.liveDemo && (
                                  <span style={{fontSize:'var(--text-xs)',color:'var(--text-4)'}}>No links provided</span>
                                )}
                              </div>
                            </div>
                            <div className={styles.modActions}>
                              <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'approved')}><CheckCircle size={13}/>Approve</button>
                              <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'featured')}><Star size={13}/>Feature</button>
                              <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'archived')}><Archive size={13}/>Archive</button>
                              <button className="btn btn-danger btn-sm" onClick={()=>moderateProject(p.id,'rejected')}><XCircle size={13}/>Reject</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {pendingI.length > 0 && (
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}><Lightbulb size={15}/> Pending ideas ({pendingI.length})</h2>
                      {pendingI.map(i => {
                        const author = studentProfiles.find(x => x.userId === i.authorId);
                        return (
                          <div key={i.id} className={styles.modCard}>
                            <div className={styles.modInfo}>
                              <Link href={`/idea/${i.id}`} className={styles.modTitle}>{i.title}</Link>
                              <p className={styles.modSub}>{i.summary}</p>
                              <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-2)',flexWrap:'wrap'}}>
                                <span className="badge badge-neutral">{i.domain}</span>
                                <span className="badge badge-neutral">{i.stage}</span>
                                {author && <span className="badge badge-neutral">{author.name}</span>}
                              </div>
                            </div>
                            <div className={styles.modActions}>
                              <button className="btn btn-secondary btn-sm" onClick={()=>moderateIdea(i.id,'approved')}><CheckCircle size={13}/>Approve</button>
                              <button className="btn btn-secondary btn-sm" onClick={()=>moderateIdea(i.id,'featured')}><Star size={13}/>Feature</button>
                              <button className="btn btn-secondary btn-sm" onClick={()=>moderateIdea(i.id,'archived')}><Archive size={13}/>Archive</button>
                              <button className="btn btn-danger btn-sm" onClick={()=>moderateIdea(i.id,'rejected')}><XCircle size={13}/>Reject</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* All approved/published projects */}
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>All published projects</h2>
                    {projects.filter(p=>p.status==='published' && p.moderationStatus !== 'archived' && p.moderationStatus !== 'rejected').map(p=>(
                      <div key={p.id} className={styles.modCard}>
                        <div className={styles.modInfo}>
                          <Link href={`/project/${p.id}`} className={styles.modTitle}>{p.title}</Link>
                          <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-1)',flexWrap:'wrap'}}>
                            <span className={`badge ${p.moderationStatus==='featured'?'badge-warning':p.moderationStatus==='approved'?'badge-success':'badge-neutral'}`}>{p.moderationStatus}</span>
                            <span className="badge badge-neutral">{p.visibility}</span>
                            <span className="badge badge-neutral">{p.domain}</span>
                          </div>
                        </div>
                        <div className={styles.modActions}>
                          {p.moderationStatus !== 'featured'
                            ? <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'featured')}><Star size={13}/>Feature</button>
                            : <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'approved')}><XCircle size={13}/>Unfeature</button>
                          }
                          <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'archived')}><Archive size={13}/>Archive</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Archived content ── */}
              {tab === 'archived' && (
                <>
                  <h1 className={styles.pageTitle}>Archived Content</h1>
                  {archivedP.length + archivedI.length === 0 && (
                    <div className="empty-state"><Archive size={40}/><p className="empty-state__title">Nothing archived</p></div>
                  )}
                  {archivedP.length > 0 && (
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}><Layers size={15}/> Archived projects ({archivedP.length})</h2>
                      {archivedP.map(p => (
                        <div key={p.id} className={styles.modCard}>
                          <div className={styles.modInfo}>
                            <Link href={`/project/${p.id}`} className={styles.modTitle}>{p.title}</Link>
                            <p className={styles.modSub}>{p.tagline}</p>
                            <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-1)'}}><span className="badge badge-neutral">{p.domain}</span></div>
                          </div>
                          <div className={styles.modActions}>
                            <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'approved')}><RotateCcw size={13}/>Restore</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>moderateProject(p.id,'rejected')}><XCircle size={13}/>Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {archivedI.length > 0 && (
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}><Lightbulb size={15}/> Archived ideas ({archivedI.length})</h2>
                      {archivedI.map(i => (
                        <div key={i.id} className={styles.modCard}>
                          <div className={styles.modInfo}>
                            <Link href={`/idea/${i.id}`} className={styles.modTitle}>{i.title}</Link>
                            <p className={styles.modSub}>{i.summary}</p>
                            <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-1)'}}><span className="badge badge-neutral">{i.domain}</span></div>
                          </div>
                          <div className={styles.modActions}>
                            <button className="btn btn-secondary btn-sm" onClick={()=>moderateIdea(i.id,'approved')}><RotateCcw size={13}/>Restore</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>moderateIdea(i.id,'rejected')}><XCircle size={13}/>Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── Users ── */}
              {tab === 'users' && (
                <>
                  <h1 className={styles.pageTitle}>User Management</h1>
                  <div className={styles.userTable}>
                    <div className={styles.userTableHead}>
                      <span>Email</span><span>Role</span><span>Status</span><span>Joined</span><span>Actions</span>
                    </div>
                    {users.map(u=>(
                      <div key={u.id} className={styles.userRow}>
                        <span className={styles.userEmail}>{u.email}</span>
                        <span><span className={`badge ${u.role==='admin'?'badge-warning':u.role==='recruiter'?'badge-accent':'badge-primary'}`}>{u.role}</span></span>
                        <span><span className={`badge ${u.isBanned?'badge-danger':'badge-success'}`}>{u.isBanned?'Banned':'Active'}</span></span>
                        <span className={styles.userDate}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                        <span>
                          {u.role !== 'admin' && (
                            <button className={`btn btn-sm ${u.isBanned?'btn-secondary':'btn-danger'}`} onClick={()=>toggleBan(u.id)}>
                              {u.isBanned?'Unban':'Ban'}
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Audit Log ── */}
              {tab === 'audit' && (
                <>
                  <h1 className={styles.pageTitle}>Audit Log</h1>
                  {auditLogs.length === 0
                    ? <div className="empty-state"><Shield size={32}/><p className="empty-state__title">No actions logged yet</p></div>
                    : auditLogs.map(log=>(
                      <div key={log.id} className={styles.auditRow}>
                        <div className={styles.auditDot}/>
                        <div>
                          <p className={styles.auditMsg}>{log.details}</p>
                          <p className={styles.auditTime}>{new Date(log.timestamp).toLocaleString('en-IN')} · Admin: {log.adminId}</p>
                        </div>
                        <ChevronRight size={14} style={{color:'var(--text-4)',marginLeft:'auto'}}/>
                      </div>
                    ))
                  }
                </>
              )}

              {/* ── Notifications ── */}
              {tab === 'notifications' && (
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'var(--space-4)'}}>
                    <h1 className={styles.pageTitle}>Notifications</h1>
                    {unreadCount > 0 && (
                      <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>
                  {notifications.length === 0
                    ? <div className="empty-state"><Bell size={32}/><p className="empty-state__title">No notifications</p></div>
                    : notifications.map((n: any) => (
                      <div key={n.id} className={styles.auditRow} style={{cursor:'pointer', opacity: n.isRead ? 0.6 : 1}} onClick={()=>markRead(n.id)}>
                        <div className={styles.auditDot} style={{background: n.isRead ? 'var(--text-4)' : 'var(--primary)'}}/>
                        <div>
                          <p className={styles.auditMsg}>{n.message}</p>
                          <p className={styles.auditTime}>{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                        {!n.isRead && <span className="badge badge-primary" style={{marginLeft:'auto'}}>New</span>}
                      </div>
                    ))
                  }
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
