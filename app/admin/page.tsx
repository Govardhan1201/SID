'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { UserStore, ProjectStore, IdeaStore, StudentStore, AuditStore } from '@/lib/store';
import { generateId } from '@/lib/security';
import type { Project, Idea } from '@/types';
import { LayoutDashboard, Users, Layers, Lightbulb, Shield, Settings, CheckCircle, XCircle, Star, Archive, Flag, ChevronRight } from 'lucide-react';
import styles from './admin.module.css';

type AdminTab = 'overview' | 'content' | 'users' | 'audit';

export default function AdminPage() {
  const { userId, role, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    if (!isLoading && (!userId || role !== 'admin')) router.replace('/login');
  }, [userId, role, isLoading, router]);

  useEffect(() => {
    setProjects(ProjectStore.getAll());
    setIdeas(IdeaStore.getAll());
  }, []);

  const users = UserStore.getAll();
  const students = users.filter(u => u.role === 'student');
  const recruiters = users.filter(u => u.role === 'recruiter');
  const pendingP = projects.filter(p => p.moderationStatus === 'pending');
  const pendingI = ideas.filter(i => i.moderationStatus === 'pending');
  const auditLogs = AuditStore.getAll().slice(0, 20);

  function logAction(action: string, targetType: string, targetId: string, details: string) {
    if (!userId) return;
    AuditStore.log({ id: generateId(), adminId: userId, action, targetType, targetId, details, timestamp: new Date().toISOString() });
  }

  function moderateProject(id: string, status: 'approved' | 'rejected' | 'featured' | 'archived') {
    const p = ProjectStore.getById(id);
    if (!p) return;
    ProjectStore.save({ ...p, moderationStatus: status, isFeatured: status === 'featured' });
    logAction(status, 'project', id, `Project "${p.title}" ${status}`);
    setProjects(ProjectStore.getAll());
  }
  function moderateIdea(id: string, status: 'approved' | 'rejected' | 'featured' | 'archived') {
    const i = IdeaStore.getById(id);
    if (!i) return;
    IdeaStore.save({ ...i, moderationStatus: status, isFeatured: status === 'featured' });
    logAction(status, 'idea', id, `Idea "${i.title}" ${status}`);
    setIdeas(IdeaStore.getAll());
  }
  function toggleBan(uid: string) {
    const u = UserStore.getById(uid);
    if (!u || u.role === 'admin') return;
    UserStore.save({ ...u, isBanned: !u.isBanned });
    logAction(u.isBanned ? 'unban' : 'ban', 'user', uid, `User ${u.email} ${u.isBanned ? 'unbanned' : 'banned'}`);
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
                ['overview','Overview',<LayoutDashboard key="d" size={16}/>],
                ['content',`Moderation Queue (${pendingP.length + pendingI.length})`,<Flag key="f" size={16}/>],
                ['users','Users',<Users key="u" size={16}/>],
                ['audit','Audit Log',<Settings key="s" size={16}/>],
              ] as const).map(([t,label,icon])=>(
                <button key={t} className={`sidebar__item ${tab===t?'active':''}`} onClick={()=>setTab(t as AdminTab)}>
                  {icon} {label}
                </button>
              ))}
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
                    <div className="stat-card"><p className="stat-card__label">Public projects</p><p className="stat-card__value">{projects.filter(p=>p.visibility==='public').length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Admin-only</p><p className="stat-card__value">{projects.filter(p=>p.visibility==='admin-only').length}</p></div>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Top domains</h2>
                    <div className={styles.domainList}>
                      {topDomains.map(([domain, count]) => (
                        <div key={domain} className={styles.domainRow}>
                          <span className={styles.domainName}>{domain}</span>
                          <div className={styles.domainBar}><div className={styles.domainFill} style={{width:`${(count/projects.length)*100}%`}}/></div>
                          <span className={styles.domainCount}>{count} projects</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Featured content</h2>
                    <div className={styles.featuredList}>
                      {projects.filter(p=>p.isFeatured).map(p=>(
                        <div key={p.id} className={styles.featuredRow}>
                          <div>
                            <Link href={`/project/${p.id}`} className={styles.featuredTitle}>{p.title}</Link>
                            <span className="badge badge-neutral" style={{marginLeft:'var(--space-2)'}}>{p.domain}</span>
                          </div>
                          <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'approved')}>Unfeature</button>
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
                        const author = StudentStore.getById(p.authorId);
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
                        const author = StudentStore.getById(i.authorId);
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
                              <button className="btn btn-danger btn-sm" onClick={()=>moderateIdea(i.id,'rejected')}><XCircle size={13}/>Reject</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* All published projects */}
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>All published projects</h2>
                    {projects.filter(p=>p.status==='published').map(p=>(
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
                          {p.moderationStatus !== 'featured' && <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'featured')}><Star size={13}/>Feature</button>}
                          {p.moderationStatus !== 'archived' && <button className="btn btn-secondary btn-sm" onClick={()=>moderateProject(p.id,'archived')}><Archive size={13}/>Archive</button>}
                        </div>
                      </div>
                    ))}
                  </div>
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
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
