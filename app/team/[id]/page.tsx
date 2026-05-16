'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TeamStore, StudentStore, ProjectStore, IdeaStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import type { Team } from '@/types';
import ProjectCard from '@/components/cards/ProjectCard';
import IdeaCard from '@/components/cards/IdeaCard';
import { ArrowLeft, Users, Layers, Lightbulb, UserPlus } from 'lucide-react';

type TeamTab = 'projects' | 'ideas' | 'members';

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [tab, setTab] = useState<TeamTab>('projects');

  useEffect(() => {
    const t = TeamStore.getById(id);
    if (!t) { router.replace('/teams'); return; }
    setTeam(t);
  }, [id, router]);

  if (!team) return null;

  const leader = StudentStore.getById(team.leaderId);
  const teamProjects = team.projectIds.map(pid => ProjectStore.getById(pid)).filter(Boolean) as ReturnType<typeof ProjectStore.getById>[];
  const teamIdeas = team.ideaIds.map(iid => IdeaStore.getById(iid)).filter(Boolean) as ReturnType<typeof IdeaStore.getById>[];
  const isMember = userId ? team.members.some(m => m.userId === userId) : false;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/teams" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-6)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-4)' }}>
            <ArrowLeft size={15} /> All teams
          </Link>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
            <img src={team.avatar} alt={team.name} className="avatar avatar-2xl" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.03em' }}>{team.name}</h1>
                {team.isOpen && <span className="badge badge-success">Open to join</span>}
              </div>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 'var(--space-4)', maxWidth: 560 }}>{team.description}</p>

              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={13} /> {team.members.length} members
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Layers size={13} /> {teamProjects.length} projects
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Lightbulb size={13} /> {teamIdeas.length} ideas
                </span>
              </div>

              {team.lookingFor.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                    Looking for
                  </p>
                  <div className="chip-list">
                    {team.lookingFor.map(r => <span key={r} className="chip">{r}</span>)}
                  </div>
                </div>
              )}

              <div className="chip-list" style={{ marginBottom: 'var(--space-5)' }}>
                {team.skills.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
              </div>

              {team.isOpen && !isMember && userId && (
                <button className="btn btn-primary btn-sm" onClick={() => alert('Join request sent! (demo)')}>
                  <UserPlus size={14} /> Request to join
                </button>
              )}
            </div>

            {/* Leader card */}
            {leader && (
              <div className="card" style={{ padding: 'var(--space-5)', minWidth: 200 }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-4)', marginBottom: 'var(--space-3)' }}>Team leader</p>
                <Link href={`/profile/${leader.userId}`} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <img src={leader.avatar} alt={leader.name} className="avatar avatar-md" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-1)' }}>{leader.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>{leader.college}</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>Projects ({teamProjects.length})</button>
            <button className={`tab-btn ${tab === 'ideas' ? 'active' : ''}`} onClick={() => setTab('ideas')}>Ideas ({teamIdeas.length})</button>
            <button className={`tab-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Members ({team.members.length})</button>
          </div>

          {tab === 'projects' && (
            teamProjects.length > 0
              ? <div className="grid-3">{teamProjects.filter(p=>p).map(p => <ProjectCard key={p!.id} project={p!} currentUserId={userId ?? undefined} />)}</div>
              : <div className="empty-state"><Layers size={36} /><p className="empty-state__title">No projects yet</p></div>
          )}
          {tab === 'ideas' && (
            teamIdeas.length > 0
              ? <div className="grid-3">{teamIdeas.filter(i=>i).map(i => <IdeaCard key={i!.id} idea={i!} currentUserId={userId ?? undefined} />)}</div>
              : <div className="empty-state"><Lightbulb size={36} /><p className="empty-state__title">No ideas yet</p></div>
          )}
          {tab === 'members' && (
            <div className="grid-3">
              {team.members.map(m => {
                const s = StudentStore.getById(m.userId);
                if (!s) return null;
                return (
                  <Link key={m.userId} href={`/profile/${m.userId}`} className="card card-hover" style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <img src={s.avatar} alt={s.name} className="avatar avatar-md" />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 'var(--text-sm)' }}>{s.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>{m.role}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>{s.college}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
