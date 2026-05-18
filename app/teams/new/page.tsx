'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createTeam } from '@/app/actions/teams';
import { useAuth } from '@/context/AuthContext';
import { generateId } from '@/lib/security';
import type { Team } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const ROLES = ['leader', 'developer', 'designer', 'presenter', 'member'] as const;

export default function NewTeamPage() {
  const { userId, role, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!userId || role !== 'student')) router.replace('/login');
  }, [userId, role, isLoading, router]);

  async function create() {
    if (!userId || !name) return;
    setSaving(true);
    const teamData = {
      name: name.trim(), description: description.trim(),
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1&textColor=ffffff`,
      leaderId: userId,
      memberIds: [userId],
      projectIds: [], ideaIds: [],
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      rolesNeeded: lookingFor.split(',').map(s => s.trim()).filter(Boolean),
      isOpen, activity: [],
    };
    const newTeam = await createTeam(teamData);
    setSaving(false);
    router.push(`/team/${newTeam.id}`);
  }

  if (isLoading) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container container--narrow" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-4)', marginBottom: 'var(--space-6)' }}>
            <ArrowLeft size={15} /> All teams
          </Link>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--space-2)' }}>Create a team</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-3)', marginBottom: 'var(--space-8)' }}>
            You'll be the team leader. You can invite members after creating the team.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <div className="field"><label className="label" htmlFor="t-name">Team name *</label>
              <input id="t-name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Byte Builders" maxLength={60} /></div>
            <div className="field"><label className="label" htmlFor="t-desc">What does your team build?</label>
              <textarea id="t-desc" className="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} maxLength={400} placeholder="We build production-ready side projects and hackathon submissions." /></div>
            <div className="field"><label className="label" htmlFor="t-skills">Team skills (comma-separated)</label>
              <input id="t-skills" className="input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Python, ML, Figma" maxLength={300} /></div>
            <div className="field"><label className="label" htmlFor="t-looking">Looking for (comma-separated)</label>
              <input id="t-looking" className="input" value={lookingFor} onChange={e => setLookingFor(e.target.value)} placeholder="UI/UX Designer, Backend Engineer" maxLength={300} /></div>
            <div className="field">
              <label className="label">Team visibility</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" onClick={() => setIsOpen(true)} className="btn" style={{ flex: 1, borderColor: isOpen ? 'var(--primary)' : 'var(--border)', background: isOpen ? 'rgba(99,102,241,0.06)' : 'var(--bg-2)', color: isOpen ? 'var(--primary-l)' : 'var(--text-2)' }}>
                  Open — anyone can request to join
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ flex: 1, borderColor: !isOpen ? 'var(--primary)' : 'var(--border)', background: !isOpen ? 'rgba(99,102,241,0.06)' : 'var(--bg-2)', color: !isOpen ? 'var(--primary-l)' : 'var(--text-2)' }}>
                  Closed — invite only
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border)' }}>
              <Link href="/teams" className="btn btn-secondary">Cancel</Link>
              <button className="btn btn-primary" onClick={create} disabled={saving || !name}>{saving ? 'Creating…' : 'Create team'}</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
