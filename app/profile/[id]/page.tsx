'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getStudentProfileById, updateStudentProfile } from '@/app/actions/users';
import { getProjectsByUserId } from '@/app/actions/projects';
import { getIdeasByUserId } from '@/app/actions/ideas';
import { getTeamsByUserId } from '@/app/actions/teams';
import { useAuth } from '@/context/AuthContext';
import type { StudentProfile, Project, Idea, Team } from '@/types';
import ProjectCard from '@/components/cards/ProjectCard';
import IdeaCard from '@/components/cards/IdeaCard';
import { GitFork, Link2, ExternalLink, MapPin, Calendar, Eye, Users, Layers, Lightbulb, Award } from 'lucide-react';
import styles from './profile.module.css';

const BADGE_INFO: Record<string, { label: string; color: string }> = {
  'first-project': { label: 'First Project', color: 'badge-primary' },
  'top-innovator': { label: 'Top Innovator', color: 'badge-warning' },
  'trending-builder': { label: 'Trending Builder', color: 'badge-accent' },
  'team-player': { label: 'Team Player', color: 'badge-success' },
  'idea-champion': { label: 'Idea Champion', color: 'badge-primary' },
  'community-star': { label: 'Community Star', color: 'badge-success' },
  'early-adopter': { label: 'Early Adopter', color: 'badge-neutral' },
  'consistent-builder': { label: 'Consistent Builder', color: 'badge-accent' },
};

type ProfileTab = 'projects' | 'ideas' | 'teams';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { userId, role } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tab, setTab] = useState<ProfileTab>('projects');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoadingProfile(true);
      const p = await getStudentProfileById(id);
      if (!p) {
        setIsLoadingProfile(false);
        return;
      }
      setProfile(p as unknown as StudentProfile);

      const visRole = role ?? 'public';
      const allPs = await getProjectsByUserId(id);
      const ps = allPs.filter((p: any) => {
        if (p.status !== 'published') return false;
        if (p.visibility === 'admin-only') return visRole === 'admin' || visRole === 'recruiter';
        return true;
      });
      setProjects(ps as unknown as Project[]);
      
      const allIs = await getIdeasByUserId(id);
      setIdeas(allIs.filter((i: any) => {
        if (i.status !== 'published') return false;
        if (i.visibility === 'admin-only') return visRole === 'admin' || visRole === 'recruiter';
        return true;
      }) as unknown as Idea[]);
      
      setTeams(await getTeamsByUserId(id) as unknown as Team[]);
      if (userId) setIsFollowing(p.followers.includes(userId));
      setIsLoadingProfile(false);
    }
    loadData();
  }, [id, userId, role]);

  async function toggleFollow() {
    if (!userId || !profile) return;
    const p = { ...profile };
    if (isFollowing) p.followers = p.followers.filter(f => f !== userId);
    else p.followers = [...p.followers, userId];
    setProfile(p); 
    setIsFollowing(!isFollowing);
    
    try {
      await updateStudentProfile(profile.userId, { followers: p.followers });
    } catch(e) {}
  }

  if (isLoadingProfile) return (
    <div className="page"><Navbar />
      <main className="main"><div className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>Loading profile...</div>
      </div></main><Footer /></div>
  );

  if (!profile && !isLoadingProfile) return (
    <div className="page"><Navbar />
      <main className="main"><div className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div className="empty-state"><p className="empty-state__title">Profile not found</p><Link href="/explore?tab=students" className="btn btn-primary btn-sm">Browse students</Link></div>
      </div></main><Footer /></div>
  );

  const isOwn = userId === profile.userId;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        {/* Banner + avatar */}
        <div className={styles.bannerArea}>
          <div className={styles.banner} />
          <div className="container">
            <div className={styles.avatarRow}>
              <img src={profile.avatar} alt={profile.name} className={`${styles.avatar}`} />
              <div className={styles.actionRow}>
                {isOwn
                  ? <Link href="/settings" className="btn btn-secondary btn-sm">Edit profile</Link>
                  : userId && <button className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm`} onClick={toggleFollow}>{isFollowing ? 'Following' : 'Follow'}</button>}
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
          <div className={styles.layout}>
            {/* Main */}
            <div className={styles.main}>
              {/* Identity */}
              <div className={styles.identity}>
                <h1 className={styles.name}>{profile.name}</h1>
                <p className={styles.sub}>{profile.branch} · Year {profile.year}</p>
                <p className={styles.college}><MapPin size={13} /> {profile.college}</p>
                {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
              </div>

              {/* Stats */}
              <div className={styles.statsRow}>
                <div className={styles.stat}><span className={styles.statVal}>{profile.profileViews.toLocaleString()}</span><span className={styles.statLabel}><Eye size={12} /> Views</span></div>
                <div className={styles.stat}><span className={styles.statVal}>{projects.length}</span><span className={styles.statLabel}><Layers size={12} /> Projects</span></div>
                <div className={styles.stat}><span className={styles.statVal}>{ideas.length}</span><span className={styles.statLabel}><Lightbulb size={12} /> Ideas</span></div>
                <div className={styles.stat}><span className={styles.statVal}>{profile.followers.length}</span><span className={styles.statLabel}><Users size={12} /> Followers</span></div>
                <div className={styles.stat}><span className={styles.statVal}>{profile.following.length}</span><span className={styles.statLabel}>Following</span></div>
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}><Award size={15} /> Badges</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {profile.badges.map(b => (
                      <span key={b} className={`badge ${BADGE_INFO[b]?.color ?? 'badge-neutral'}`}>{BADGE_INFO[b]?.label ?? b}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="tabs">
                <button className={`tab-btn ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>Projects ({projects.length})</button>
                <button className={`tab-btn ${tab === 'ideas' ? 'active' : ''}`} onClick={() => setTab('ideas')}>Ideas ({ideas.length})</button>
                <button className={`tab-btn ${tab === 'teams' ? 'active' : ''}`} onClick={() => setTab('teams')}>Teams ({teams.length})</button>
              </div>

              {tab === 'projects' && (
                projects.length > 0
                  ? <div className="grid-2">{projects.map(p => <ProjectCard key={p.id} project={p} currentUserId={userId ?? undefined} />)}</div>
                  : <div className="empty-state"><Layers size={36} /><p className="empty-state__title">No projects yet</p>{isOwn && <Link href="/dashboard/projects/new" className="btn btn-primary btn-sm">Submit your first project</Link>}</div>
              )}
              {tab === 'ideas' && (
                ideas.length > 0
                  ? <div className="grid-2">{ideas.map(i => <IdeaCard key={i.id} idea={i} currentUserId={userId ?? undefined} />)}</div>
                  : <div className="empty-state"><Lightbulb size={36} /><p className="empty-state__title">No ideas yet</p>{isOwn && <Link href="/dashboard/ideas/new" className="btn btn-primary btn-sm">Submit your first idea</Link>}</div>
              )}
              {tab === 'teams' && (
                teams.length > 0
                  ? <div className="grid-2">{teams.map(t => (
                    <Link key={t.id} href={`/team/${t.id}`} className="card card-hover" style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      <img src={t.avatar} alt={t.name} className="avatar avatar-md" />
                      <div><div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{t.name}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>{t.memberIds?.length || 0} members</div></div>
                    </Link>
                  ))}</div>
                  : <div className="empty-state"><Users size={36} /><p className="empty-state__title">Not in any teams yet</p></div>
              )}
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                <p className={styles.sideLabel}>Skills</p>
                <div className="chip-list">{profile.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
              </div>
              <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                <p className={styles.sideLabel}>Domains</p>
                <div className="chip-list">{profile.domains.map(d => <span key={d} className="badge badge-primary">{d}</span>)}</div>
              </div>
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <p className={styles.sideLabel}>Links</p>
                <div className={styles.links}>
                  {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className={styles.linkItem}><GitFork size={14} /> GitHub</a>}
                  {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkItem}><Link2 size={14} /> LinkedIn</a>}
                  {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className={styles.linkItem}><ExternalLink size={14} /> Portfolio</a>}
                </div>
                {profile.resume && <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 'var(--space-3)', justifyContent: 'center' }}>Download Resume</a>}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
