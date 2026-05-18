'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProjectCard from '@/components/cards/ProjectCard';
import IdeaCard from '@/components/cards/IdeaCard';
import StudentCard from '@/components/cards/StudentCard';
import { getVisibleProjects } from '@/app/actions/projects';
import { getVisibleIdeas } from '@/app/actions/ideas';
import { getAllStudentProfiles } from '@/app/actions/users';
import { getAllTeams } from '@/app/actions/teams';
import { useAuth } from '@/context/AuthContext';
import type { Project, Idea, StudentProfile, Team } from '@/types';
import { Search, SlidersHorizontal, Users, Layers, Lightbulb, User, X } from 'lucide-react';
import styles from './explore.module.css';
import Link from 'next/link';

type Tab = 'projects' | 'ideas' | 'students' | 'teams';

const DOMAINS = ['All', 'AI/ML', 'Web Dev', 'Mobile', 'DevOps/Cloud', 'IoT/Hardware', 'Blockchain/Web3', 'Healthcare', 'Fintech', 'EdTech', 'SaaS', 'Cybersecurity', 'AR/VR'];
const SORT_OPTIONS = [
  { value: 'latest',     label: 'Latest' },
  { value: 'popular',    label: 'Most viewed' },
  { value: 'liked',      label: 'Most liked' },
  { value: 'bookmarked', label: 'Most bookmarked' },
];

function ExploreContent() {
  const params = useSearchParams();
  const { role, userId } = useAuth();

  const [tab,         setTab]         = useState<Tab>((params.get('tab') as Tab) ?? 'projects');
  const [query,       setQuery]       = useState(params.get('q') ?? '');
  const [domain,      setDomain]      = useState('All');
  const [sort,        setSort]        = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  const [projects,  setProjects]  = useState<Project[]>([]);
  const [ideas,     setIdeas]     = useState<Idea[]>([]);
  const [students,  setStudents]  = useState<StudentProfile[]>([]);
  const [teams,     setTeams]     = useState<Team[]>([]);

  const visRole = role ?? 'public';

  useEffect(() => {
    async function loadData() {
      setProjects(await getVisibleProjects(visRole as any) as unknown as Project[]);
      setIdeas(await getVisibleIdeas(visRole as any) as unknown as Idea[]);
      setStudents(await getAllStudentProfiles() as unknown as StudentProfile[]);
      setTeams(await getAllTeams() as unknown as Team[]);
    }
    loadData();
  }, [visRole]);

  // ── Like / Bookmark handlers ──────────────────────────────────────
  async function handleProjectLike(id: string) {
    if (!userId) return;
    const p = projects.find(x => x.id === id);
    if (!p) return;
    const liked = p.likes.includes(userId);
    const newLikes = liked ? p.likes.filter(x => x !== userId) : [...p.likes, userId];
    
    setProjects(prev => prev.map(proj => proj.id === id ? { ...proj, likes: newLikes } : proj));
    
    try {
      const { updateProject } = require('@/app/actions/projects');
      await updateProject(id, { likes: newLikes });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleProjectBookmark(id: string) {
    if (!userId) return;
    const p = projects.find(x => x.id === id);
    if (!p) return;
    const bookmarked = p.bookmarks.includes(userId);
    const newBookmarks = bookmarked ? p.bookmarks.filter(x => x !== userId) : [...p.bookmarks, userId];
    
    setProjects(prev => prev.map(proj => proj.id === id ? { ...proj, bookmarks: newBookmarks } : proj));
    
    try {
      const { updateProject } = require('@/app/actions/projects');
      await updateProject(id, { bookmarks: newBookmarks });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleIdeaLike(id: string) {
    if (!userId) return;
    const i = ideas.find(x => x.id === id);
    if (!i) return;
    const liked = i.likes.includes(userId);
    const newLikes = liked ? i.likes.filter(x => x !== userId) : [...i.likes, userId];
    
    setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, likes: newLikes } : idea));
    
    try {
      const { updateIdea } = require('@/app/actions/ideas');
      await updateIdea(id, { likes: newLikes });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleIdeaBookmark(id: string) {
    if (!userId) return;
    const i = ideas.find(x => x.id === id);
    if (!i) return;
    const bookmarked = i.bookmarks.includes(userId);
    const newBookmarks = bookmarked ? i.bookmarks.filter(x => x !== userId) : [...i.bookmarks, userId];
    
    setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, bookmarks: newBookmarks } : idea));
    
    try {
      const { updateIdea } = require('@/app/actions/ideas');
      await updateIdea(id, { bookmarks: newBookmarks });
    } catch (e) {
      console.error(e);
    }
  }

  // ── Filters ───────────────────────────────────────────────────────
  function filterProjects() {
    let list = [...projects];
    if (query) list = list.filter(p => [p.title, p.tagline, p.summary, ...p.techStack, ...p.tags].some(f => f.toLowerCase().includes(query.toLowerCase())));
    if (domain !== 'All') list = list.filter(p => p.domain === domain || p.category === domain);
    if (sort === 'popular')    list.sort((a, b) => b.views - a.views);
    else if (sort === 'liked') list.sort((a, b) => b.likes.length - a.likes.length);
    else if (sort === 'bookmarked') list.sort((a, b) => b.bookmarks.length - a.bookmarks.length);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }

  function filterIdeas() {
    let list = [...ideas];
    if (query) list = list.filter(i => [i.title, i.summary, ...i.tags].some(f => f.toLowerCase().includes(query.toLowerCase())));
    if (domain !== 'All') list = list.filter(i => i.domain === domain || i.category === domain);
    if (sort === 'popular')    list.sort((a, b) => b.views - a.views);
    else if (sort === 'liked') list.sort((a, b) => b.likes.length - a.likes.length);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }

  function filterStudents() {
    let list = [...students];
    if (query) list = list.filter(s => [s.name, s.college, s.branch, ...s.skills, ...s.domains].some(f => f.toLowerCase().includes(query.toLowerCase())));
    return list;
  }

  function filterTeams() {
    let list = [...teams];
    if (query) list = list.filter(t => [t.name, t.description, ...t.skills].some(f => f.toLowerCase().includes(query.toLowerCase())));
    return list;
  }

  const fp = filterProjects();
  const fi = filterIdeas();
  const fs = filterStudents();
  const ft = filterTeams();
  const tabCounts = { projects: fp.length, ideas: fi.length, students: fs.length, teams: ft.length };

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className={styles.topBar}>
          <div className="container">
            <h1 className={styles.pageTitle}>
              Explore <span className={styles.pageTitleMono}>// {tab}</span>
            </h1>
            <div className={styles.controls}>
              <div className={styles.searchWrap}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  id="explore-search"
                  type="search"
                  className={styles.searchInput}
                  placeholder="Search by title, skill, tech, college…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  maxLength={200}
                />
                {query && <button className={styles.clearBtn} onClick={() => setQuery('')}><X size={14} /></button>}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(f => !f)}>
                <SlidersHorizontal size={14} /> Filters
              </button>
              <select className="select" style={{ width: 'auto', fontSize: 'var(--text-sm)' }} value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {showFilters && (
              <div className={styles.filterRow}>
                {DOMAINS.map(d => (
                  <button key={d}
                    className={`${styles.filterChip} ${domain === d ? styles.filterChipActive : ''}`}
                    onClick={() => setDomain(d)}>
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
          <div className="tabs">
            {([
              ['projects', 'Projects', <Layers key="l" size={14} />],
              ['ideas',    'Ideas',    <Lightbulb key="lb" size={14} />],
              ['students', 'Students', <User key="u" size={14} />],
              ['teams',    'Teams',    <Users key="us" size={14} />],
            ] as const).map(([t, label, icon]) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t as Tab)}>
                {icon} {label} <span className={styles.tabCount}>{tabCounts[t as Tab]}</span>
              </button>
            ))}
          </div>

          {tab === 'projects' && (
            fp.length > 0
              ? <div className="grid-3">{fp.map(p =>
                  <ProjectCard
                    key={p.id}
                    project={p}
                    currentUserId={userId ?? undefined}
                    onLike={handleProjectLike}
                    onBookmark={handleProjectBookmark}
                  />
                )}</div>
              : <div className="empty-state">
                  <Search size={40} className="empty-state__icon" />
                  <p className="empty-state__title">No projects found</p>
                  <p className="empty-state__body">Try adjusting your search or filters.</p>
                </div>
          )}

          {tab === 'ideas' && (
            fi.length > 0
              ? <div className="grid-3">{fi.map(i =>
                  <IdeaCard
                    key={i.id}
                    idea={i}
                    currentUserId={userId ?? undefined}
                    onLike={handleIdeaLike}
                    onBookmark={handleIdeaBookmark}
                  />
                )}</div>
              : <div className="empty-state">
                  <Lightbulb size={40} className="empty-state__icon" />
                  <p className="empty-state__title">No ideas found</p>
                  <p className="empty-state__body">Try a different search.</p>
                </div>
          )}

          {tab === 'students' && (
            fs.length > 0
              ? <div className="grid-4">{fs.map(s => <StudentCard key={s.userId} profile={s} />)}</div>
              : <div className="empty-state"><User size={40} className="empty-state__icon" /><p className="empty-state__title">No students found</p></div>
          )}

          {tab === 'teams' && (
            ft.length > 0
              ? <div className="grid-3">{ft.map(t => (
                  <Link key={t.id} href={`/team/${t.id}`} className="card card-hover" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      <img src={t.avatar} alt={t.name} className="avatar avatar-md" />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 'var(--text-sm)' }}>{t.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{t.members.length} members</div>
                      </div>
                      {t.isOpen && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Open</span>}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', lineHeight: 1.5 }}>{t.description}</p>
                    <div className="chip-list">{t.skills.slice(0, 4).map(s => <span key={s} className="chip">{s}</span>)}</div>
                  </Link>
                ))}</div>
              : <div className="empty-state"><Users size={40} className="empty-state__icon" /><p className="empty-state__title">No teams found</p></div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ExplorePage() { return <Suspense><ExploreContent /></Suspense>; }
