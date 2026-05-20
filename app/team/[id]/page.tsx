'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getTeamById } from '@/app/actions/teams';
import { getStudentProfileById } from '@/app/actions/users';
import { getProjectById } from '@/app/actions/projects';
import { getIdeaById } from '@/app/actions/ideas';
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

  const [loading, setLoading] = useState(true);
  const [leader, setLeader] = useState<any>(null);
  const [teamProjects, setTeamProjects] = useState<any[]>([]);
  const [teamIdeas, setTeamIdeas] = useState<any[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      const t = await getTeamById(id);
      if (!t) { router.replace('/teams'); return; }
      setTeam(t as any);

      if (t.leaderId) {
        setLeader(await getStudentProfileById(t.leaderId));
      }

      const pIds = Array.isArray((t as any).projectIds) ? (t as any).projectIds : [];
      const iIds = Array.isArray((t as any).ideaIds) ? (t as any).ideaIds : [];
      
      const pData = await Promise.all(pIds.map((pid: string) => getProjectById(pid)));
      const iData = await Promise.all(iIds.map((iid: string) => getIdeaById(iid)));
      
      setTeamProjects(pData.filter(Boolean));
      setTeamIdeas(iData.filter(Boolean));

      const profiles: Record<string, any> = {};
      const membersArr = Array.isArray((t as any).memberIds) ? (t as any).memberIds : [];
      for (const mId of membersArr) {
        if (!profiles[mId]) {
          const s = await getStudentProfileById(mId);
          if (s) profiles[mId] = s;
        }
      }
      setMemberProfiles(profiles);

      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading || !team) return null;

  const membersArr = Array.isArray((team as any).memberIds) ? (team as any).memberIds : [];
  const isMember = userId ? membersArr.includes(userId) : false;

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
                  <Users size={13} /> {membersArr.length} members
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Layers size={13} /> {teamProjects.length} projects
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Lightbulb size={13} /> {teamIdeas.length} ideas
                </span>
              </div>

              {(team.rolesNeeded?.length || 0) > 0 && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                    Looking for
                  </p>
                  <div className="chip-list">
                    {team.rolesNeeded.map(r => <span key={r} className="chip">{r}</span>)}
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
              {!team.isOpen && !isMember && userId && (
                <span className="badge badge-neutral">Invite Only</span>
              )}
              {isMember && userId && (
                <button className="btn btn-secondary btn-sm" disabled>
                  Already joined
                </button>
              )}
              {userId === team.leaderId && (
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'var(--space-2)' }} onClick={() => alert('Invite link copied to clipboard! (demo)')}>
                  <UserPlus size={14} /> Invite Member
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
            <button className={`tab-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Members ({membersArr.length})</button>
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
              {membersArr.map((mId: string) => {
                const s = memberProfiles[mId];
                if (!s) return null;
                return (
                  <Link key={mId} href={`/profile/${mId}`} className="card card-hover" style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <img src={s.avatar} alt={s.name} className="avatar avatar-md" />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 'var(--text-sm)' }}>{s.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>{mId === team.leaderId ? 'Leader' : 'Member'}</div>
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
