'use client';
import { useState, Suspense } from 'react';
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
import useSWR from 'swr';
import { GridSkeleton } from '@/components/ui/Skeletons';
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

  const visRole = role ?? 'public';

  const { data: projects = [], mutate: mutateProjects, isLoading: loadingProjects } = useSWR(['projects', visRole], () => getVisibleProjects(visRole as any) as unknown as Promise<any[]>);
  const { data: ideas = [], mutate: mutateIdeas, isLoading: loadingIdeas } = useSWR(['ideas', visRole], () => getVisibleIdeas(visRole as any) as unknown as Promise<any[]>);
  const { data: students = [], isLoading: loadingStudents } = useSWR('students', () => getAllStudentProfiles() as unknown as Promise<any[]>);
  const { data: teams = [], isLoading: loadingTeams } = useSWR('teams', () => getAllTeams() as unknown as Promise<any[]>);

  const isLoadingData = loadingProjects || loadingIdeas || loadingStudents || loadingTeams;

  // ── Like / Bookmark handlers ──────────────────────────────────────
  async function handleProjectLike(id: string) {
    if (!userId) return;
    const p = projects.find(x => x.id === id);
    if (!p) return;
    const liked = p.likes?.includes(userId);
    const newLikes = liked ? (p.likes || []).filter((x: any) => x !== userId) : [...(p.likes || []), userId];
    
    mutateProjects(
      projects.map((proj: any) => proj.id === id ? { ...proj, likes: newLikes } : proj),
      false // optimistic
    );
    
    try {
      const { updateProject } = require('@/app/actions/projects');
      await updateProject(id, { likes: newLikes });
      mutateProjects();
    } catch (e) {
      console.error(e);
      mutateProjects(); // rollback
    }
  }

  async function handleProjectBookmark(id: string) {
    if (!userId) return;
    const p = projects.find(x => x.id === id);
    if (!p) return;
    const bookmarked = p.bookmarks?.includes(userId);
    const newBookmarks = bookmarked ? (p.bookmarks || []).filter((x: any) => x !== userId) : [...(p.bookmarks || []), userId];
    
    mutateProjects(
      projects.map((proj: any) => proj.id === id ? { ...proj, bookmarks: newBookmarks } : proj),
      false
    );
    
    try {
      const { updateProject } = require('@/app/actions/projects');
      await updateProject(id, { bookmarks: newBookmarks });
      mutateProjects();
    } catch (e) {
      console.error(e);
      mutateProjects();
    }
  }

  async function handleIdeaLike(id: string) {
    if (!userId) return;
    const i = ideas.find(x => x.id === id);
    if (!i) return;
    const liked = i.likes?.includes(userId);
    const newLikes = liked ? (i.likes || []).filter((x: any) => x !== userId) : [...(i.likes || []), userId];
    
    mutateIdeas(
      ideas.map((idea: any) => idea.id === id ? { ...idea, likes: newLikes } : idea),
      false
    );
    
    try {
      const { updateIdea } = require('@/app/actions/ideas');
      await updateIdea(id, { likes: newLikes });
      mutateIdeas();
    } catch (e) {
      console.error(e);
      mutateIdeas();
    }
  }

  async function handleIdeaBookmark(id: string) {
    if (!userId) return;
    const i = ideas.find(x => x.id === id);
    if (!i) return;
    const bookmarked = i.bookmarks?.includes(userId);
    const newBookmarks = bookmarked ? (i.bookmarks || []).filter((x: any) => x !== userId) : [...(i.bookmarks || []), userId];
    
    mutateIdeas(
      ideas.map((idea: any) => idea.id === id ? { ...idea, bookmarks: newBookmarks } : idea),
      false
    );
    
    try {
      const { updateIdea } = require('@/app/actions/ideas');
      await updateIdea(id, { bookmarks: newBookmarks });
      mutateIdeas();
    } catch (e) {
      console.error(e);
      mutateIdeas();
    }
  }

  // ── Filters ───────────────────────────────────────────────────────
  function filterProjects() {
    let list = [...projects];
    if (query) list = list.filter((p: any) => [p.title, p.tagline, p.summary, ...(p.techStack || []), ...(p.tags || [])].some(f => f?.toLowerCase().includes(query.toLowerCase())));
    if (domain !== 'All') list = list.filter((p: any) => p.domain === domain || p.category === domain);
    if (sort === 'popular')    list.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sort === 'liked') list.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    else if (sort === 'bookmarked') list.sort((a, b) => (b.bookmarks?.length || 0) - (a.bookmarks?.length || 0));
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }

  function filterIdeas() {
    let list = [...ideas];
    if (query) list = list.filter((i: any) => [i.title, i.summary, ...(i.tags || [])].some(f => f?.toLowerCase().includes(query.toLowerCase())));
    if (domain !== 'All') list = list.filter((i: any) => i.domain === domain || i.category === domain);
    if (sort === 'popular')    list.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sort === 'liked') list.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }

  function filterStudents() {
    let list = [...students];
    if (query) list = list.filter(s => [s.name, s.college, s.branch, ...(s.skills || []), ...(s.domains || [])].some(f => f?.toLowerCase().includes(query.toLowerCase())));
    return list;
  }

  function filterTeams() {
    let list = [...teams];
    if (query) list = list.filter(t => [t.name, t.description, ...(t.skills || [])].some(f => f?.toLowerCase().includes(query.toLowerCase())));
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
            isLoadingData ? <GridSkeleton count={6} type="project" /> :
            fp.length > 0
              ? <div className="grid-3">{fp.map((p: any) =>
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
            isLoadingData ? <GridSkeleton count={6} type="idea" /> :
            fi.length > 0
              ? <div className="grid-3">{fi.map((i: any) =>
                  <IdeaCard
                    key={i.id}
                    idea={i}
                    currentUserId={userId ?? undefined}
                    onLike={handleIdeaLike}
                    onBookmark={handleIdeaBookmark}
                  />
                )}</div>
              : <div className="empty-state">
                  <Search size={40} className="empty-state__icon" />
                  <p className="empty-state__title">No ideas found</p>
                  <p className="empty-state__body">Try adjusting your search or filters.</p>
                </div>
          )}

          {tab === 'students' && (
            isLoadingData ? <GridSkeleton count={6} type="student" /> :
            fs.length > 0
              ? <div className="grid-4">{fs.map(s => <StudentCard key={s.userId} profile={s} />)}</div>
              : <div className="empty-state">
                  <Users size={40} className="empty-state__icon" />
                  <p className="empty-state__title">No students found</p>
                </div>
          )}

          {tab === 'teams' && (
            isLoadingData ? <GridSkeleton count={6} type="student" /> :
            ft.length > 0
              ? <div className="grid-3">{ft.map(t => (
                  <div key={t.id} className="card card-hover" style={{ padding: 'var(--space-5)' }}>
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>{t.name}</h3>
                    <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{t.description}</p>
                    <div className="chip-list">
                      {(t.rolesNeeded || t.skills || []).map((s: string) => <span key={s} className="chip">{s}</span>)}
                    </div>
                  </div>
                ))}</div>
              : <div className="empty-state">
                  <Users size={40} className="empty-state__icon" />
                  <p className="empty-state__title">No teams found</p>
                </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ExplorePage() { return <Suspense><ExploreContent /></Suspense>; }
