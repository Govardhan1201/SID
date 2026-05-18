'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { getProjectsByUserId } from '@/app/actions/projects';
import { getIdeasByUserId } from '@/app/actions/ideas';
import { getNotifications, markNotificationAsRead } from '@/app/actions/users';
import { getHackathonById, getParticipantsByHackathon } from '@/app/actions/hackathon';
import type { Project, Idea, Notification } from '@/types';
import {
  LayoutDashboard, Layers, Lightbulb, Settings, Plus,
  Eye, Heart, Bookmark, Bell, Award, ArrowRight,
  CheckCircle, Clock, Archive, Check,
} from 'lucide-react';
import styles from './dashboard.module.css';

const STATUS_ICON: Record<string, React.ReactNode> = {
  published: <CheckCircle size={13} />,
  draft:     <Clock size={13} />,
  archived:  <Archive size={13} />,
  pending:   <Clock size={13} />,
};
const STATUS_COLOR: Record<string, string> = {
  published: 'badge-success',
  draft:     'badge-neutral',
  archived:  'badge-neutral',
  pending:   'badge-warning',
};

type DashTab = 'overview' | 'projects' | 'ideas' | 'notifications';

function DashboardContent() {
  const { userId, role, studentProfile, isLoading } = useAuth();
  const router      = useRouter();
  const params      = useSearchParams();

  const [tab,           setTab]          = useState<DashTab>((params.get('tab') as DashTab) ?? 'overview');
  const [projects,      setProjects]     = useState<Project[]>([]);
  const [ideas,         setIdeas]        = useState<Idea[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [myHackathons,  setMyHackathons]  = useState<Array<{ id: string; name: string; status: string }>>([]);

  useEffect(() => {
    if (!isLoading && (!userId || role !== 'student')) router.replace('/login');
  }, [userId, role, isLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      setProjects(await getProjectsByUserId(userId) as unknown as Project[]);
      setIdeas(await getIdeasByUserId(userId) as unknown as Idea[]);
      setNotifications(await getNotifications(userId) as unknown as Notification[]);
      
      try {
        // Find active hackathons the user is part of
        // To avoid expensive global queries, ideally we'd have a getUserHackathons action,
        // but for now we will get hackathons safely without blowing up local storage.
        const { getAllHackathons } = require('@/app/actions/hackathon');
        const allHacks = await getAllHackathons();
        const myHacks = [];
        
        for (const h of allHacks) {
          if (h.status === 'draft') continue;
          const participants = await getParticipantsByHackathon(h.id);
          if (participants.some((p: any) => p.userId === userId)) {
            myHacks.push(h);
          }
        }
        setMyHackathons(myHacks);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [userId]);

  // Sync tab from URL when it changes
  useEffect(() => {
    const urlTab = params.get('tab') as DashTab;
    if (urlTab && urlTab !== tab) setTab(urlTab);
  }, [params]);

  if (isLoading || !studentProfile) return null;

  const totalViews    = projects.reduce((s, p) => s + (p.views || 0), 0) + ideas.reduce((s, i) => s + (i.views || 0), 0);
  const totalLikes    = projects.reduce((s, p) => s + (p.likes?.length || 0), 0) + ideas.reduce((s, i) => s + (i.likes?.length || 0), 0);
  const totalBookmarks = projects.reduce((s, p) => s + (p.bookmarks?.length || 0), 0);
  const unread        = notifications.filter(n => !n.isRead).length;

  const completeness = [
    !!studentProfile.name, !!studentProfile.bio, !!studentProfile.college,
    !!studentProfile.github, !!studentProfile.linkedin,
    studentProfile.skills?.length > 0, studentProfile.domains?.length > 0,
    projects.length > 0,
  ];
  const completeCount = completeness.filter(Boolean).length;
  const completePct   = Math.round((completeCount / completeness.length) * 100);

  async function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await markNotificationAsRead(id);
    } catch(e) {}
  }

  async function markAllRead() {
    if (!userId) return;
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
    } catch(e) {}
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <div className={styles.layout}>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.studentCard}>
                <img src={studentProfile.avatar} alt={studentProfile.name} className="avatar avatar-xl" />
                <div>
                  <span className={styles.studentName}>{studentProfile.name}</span>
                  <span className={styles.studentSub}>{studentProfile.college}</span>
                  <Link href={`/profile/${userId}`} className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)', paddingLeft: 0 }}>
                    View public profile <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
              {[
                { id: 'overview',       icon: <LayoutDashboard size={16} />, label: 'Overview' },
                { id: 'projects',       icon: <Layers size={16} />,          label: `Projects (${projects.length})` },
                { id: 'ideas',          icon: <Lightbulb size={16} />,       label: `Ideas (${ideas.length})` },
                { id: 'notifications',  icon: <Bell size={16} />,            label: `Notifications${unread > 0 ? ` (${unread})` : ''}` },
              ].map(item => (
                <button key={item.id}
                  className={`sidebar__item ${tab === item.id ? 'active' : ''}`}
                  onClick={() => setTab(item.id as DashTab)}>
                  {item.icon} {item.label}
                  {item.id === 'notifications' && unread > 0 && (
                    <span className="notif-dot" style={{ marginLeft: 'auto' }} />
                  )}
                </button>
              ))}
              <hr className="divider" />
              <Link href="/settings" className="sidebar__item"><Settings size={16} /> Settings</Link>
            </aside>

            {/* Content */}
            <div className={styles.content}>

              {/* ── Overview ── */}
              {tab === 'overview' && (
                <>
                  <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Dashboard</h1>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <Link href="/dashboard/projects/new" className="btn btn-primary btn-sm"><Plus size={14} /> New project</Link>
                      <Link href="/dashboard/ideas/new"    className="btn btn-secondary btn-sm"><Plus size={14} /> New idea</Link>
                    </div>
                  </div>

                  {/* Active Hackathon Alert */}
                  {myHackathons.map(h => (
                    <div key={h.id} className={styles.completeCard} style={{ background: 'var(--primary-dim)', borderColor: 'rgba(56, 189, 248, 0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)' }}>
                      <div>
                        <p className={styles.completeTitle} style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Award size={16} /> {h.name} is {h.status}!
                        </p>
                        <p className={styles.completeSub} style={{ color: 'var(--text-2)' }}>You are registered for this hackathon.</p>
                      </div>
                      <Link href={`/hackathon/${h.id}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                        Go to Hackathon <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}

                  {/* Profile completeness */}
                  {completePct < 100 && (
                    <div className={styles.completeCard}>
                      <div className={styles.completeTop}>
                        <div>
                          <p className={styles.completeTitle}>Complete your profile</p>
                          <p className={styles.completeSub}>{completePct}% done — a complete profile gets 3× more recruiter views</p>
                        </div>
                        <span className={styles.completePct}>{completePct}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${completePct}%` }} /></div>
                      <Link href="/settings" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>Complete profile</Link>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid-4">
                    <div className="stat-card"><p className="stat-card__label">Total views</p><p className="stat-card__value">{totalViews.toLocaleString()}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Likes received</p><p className="stat-card__value">{totalLikes}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Bookmarks</p><p className="stat-card__value">{totalBookmarks}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Followers</p><p className="stat-card__value">{studentProfile.followers?.length || 0}</p></div>
                  </div>

                  {/* Recent submissions */}
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}><Layers size={15} /> Recent submissions</h2>
                      <button className="tab-btn" onClick={() => setTab('projects')}>View all</button>
                    </div>
                    {projects.slice(0, 3).map(p => (
                      <div key={p.id} className={styles.subRow}>
                        <div className={styles.subInfo}>
                          <Link href={`/project/${p.id}`} className={styles.subTitle}>{p.title}</Link>
                          <span className={`badge ${STATUS_COLOR[p.status]}`}>{STATUS_ICON[p.status]} {p.status}</span>
                          {p.visibility === 'admin-only' && <span className="badge badge-warning">Admin-only</span>}
                        </div>
                        <div className={styles.subStats}>
                          <span><Eye size={12} /> {p.views}</span>
                          <span><Heart size={12} /> {p.likes?.length || 0}</span>
                        </div>
                        <Link href={`/dashboard/projects/edit/${p.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                        <Layers size={32} className="empty-state__icon" />
                        <p className="empty-state__title">No projects yet</p>
                        <Link href="/dashboard/projects/new" className="btn btn-primary btn-sm">Submit your first project</Link>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  {studentProfile.badges.length > 0 && (
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}><Award size={15} /> Your badges</h2>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {studentProfile.badges.map(b => (
                          <span key={b} className="badge badge-primary" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {b.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Projects ── */}
              {tab === 'projects' && (
                <>
                  <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>My Projects</h1>
                    <Link href="/dashboard/projects/new" className="btn btn-primary btn-sm"><Plus size={14} /> New project</Link>
                  </div>
                  {projects.length === 0
                    ? <div className="empty-state"><Layers size={40} className="empty-state__icon" /><p className="empty-state__title">No projects yet</p><Link href="/dashboard/projects/new" className="btn btn-primary btn-sm">Submit your first project</Link></div>
                    : projects.map(p => (
                      <div key={p.id} className={styles.subRow}>
                        <div className={styles.subInfo}>
                          <Link href={`/project/${p.id}`} className={styles.subTitle}>{p.title}</Link>
                          <span className={`badge ${STATUS_COLOR[p.status]}`}>{p.status}</span>
                          {p.visibility === 'admin-only' && <span className="badge badge-warning">Admin-only</span>}
                          <span className="badge badge-neutral">{p.domain}</span>
                        </div>
                        <div className={styles.subStats}>
                          <span><Eye size={12} /> {p.views}</span>
                          <span><Heart size={12} /> {p.likes?.length || 0}</span>
                          <span><Bookmark size={12} /> {p.bookmarks?.length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Link href={`/dashboard/projects/edit/${p.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                          <Link href={`/project/${p.id}`} className="btn btn-ghost btn-sm">View</Link>
                        </div>
                      </div>
                    ))
                  }
                </>
              )}

              {/* ── Ideas ── */}
              {tab === 'ideas' && (
                <>
                  <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>My Ideas</h1>
                    <Link href="/dashboard/ideas/new" className="btn btn-primary btn-sm"><Plus size={14} /> New idea</Link>
                  </div>
                  {ideas.length === 0
                    ? <div className="empty-state"><Lightbulb size={40} className="empty-state__icon" /><p className="empty-state__title">No ideas yet</p><Link href="/dashboard/ideas/new" className="btn btn-primary btn-sm">Submit your first idea</Link></div>
                    : ideas.map(i => (
                      <div key={i.id} className={styles.subRow}>
                        <div className={styles.subInfo}>
                          <Link href={`/idea/${i.id}`} className={styles.subTitle}>{i.title}</Link>
                          <span className={`badge ${STATUS_COLOR[i.status]}`}>{i.status}</span>
                          {i.visibility === 'admin-only' && <span className="badge badge-warning">Admin-only</span>}
                          <span className="badge badge-neutral">{i.stage}</span>
                        </div>
                        <div className={styles.subStats}>
                          <span><Eye size={12} /> {i.views}</span>
                          <span><Heart size={12} /> {i.likes?.length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Link href={`/dashboard/ideas/edit/${i.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                          <Link href={`/idea/${i.id}`} className="btn btn-ghost btn-sm">View</Link>
                        </div>
                      </div>
                    ))
                  }
                </>
              )}

              {/* ── Notifications ── */}
              {tab === 'notifications' && (
                <>
                  <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Notifications</h1>
                    {unread > 0 && (
                      <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
                        <Check size={13} /> Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0
                    ? <div className="empty-state"><Bell size={40} className="empty-state__icon" /><p className="empty-state__title">No notifications yet</p></div>
                    : notifications.map(n => (
                      <div key={n.id} className={`${styles.notifRow} ${!n.isRead ? styles.notifUnread : ''}`}>
                        {!n.isRead && <div className="notif-dot" />}
                        <div className={styles.notifText}>
                          <p>{n.message}</p>
                          <span className={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <Link
                          href={n.link}
                          className="btn btn-ghost btn-sm"
                          onClick={() => markRead(n.id)}
                        >
                          View
                        </Link>
                        {!n.isRead && (
                          <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)} title="Mark as read">
                            <Check size={13} />
                          </button>
                        )}
                      </div>
                    ))
                  }
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

export default function DashboardPage() {
  return <Suspense><DashboardContent /></Suspense>;
}
