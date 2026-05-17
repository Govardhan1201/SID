'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { HackathonStore } from '@/lib/hackathon-store';
import { generateJudgeToken } from '@/lib/password-gen';
import { hashPassword, generateId } from '@/lib/security';
import type { Hackathon, HackathonTrack } from '@/types';
import { Plus, Trash2, ChevronLeft, Layers, Calendar, Shield, Info } from 'lucide-react';
import styles from './new.module.css';

function emptyTrack(): HackathonTrack {
  return { id: generateId(), name: '', description: '', problemStatement: '', openInnovation: false };
}

export default function NewHackathonPage() {
  const { role } = useAuth();
  const router   = useRouter();

  const [name,        setName]        = useState('');
  const [tagline,     setTagline]     = useState('');
  const [description, setDescription] = useState('');
  const [deadline,    setDeadline]    = useState('');
  const [judgePass,   setJudgePass]   = useState('');
  const [tracks,      setTracks]      = useState<HackathonTrack[]>([emptyTrack()]);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  if (role !== 'admin') return null;

  function addTrack() {
    if (tracks.length >= 5) return;
    setTracks(t => [...t, emptyTrack()]);
  }

  function removeTrack(id: string) {
    if (tracks.length <= 1) return;
    setTracks(t => t.filter(tr => tr.id !== id));
  }

  function updateTrack(id: string, field: keyof HackathonTrack, value: string | boolean) {
    setTracks(t => t.map(tr => tr.id === id ? { ...tr, [field]: value } : tr));
  }

  async function handleSubmit(status: Hackathon['status']) {
    setError('');
    if (!name.trim())     return setError('Hackathon name is required.');
    if (!deadline)        return setError('Deadline is required.');
    if (!judgePass.trim()) return setError('Judge password is required.');

    const invalidTrack = tracks.find(t => !t.name.trim());
    if (invalidTrack) return setError('All tracks must have a name.');

    setSaving(true);
    try {
      const judgePasswordHash = await hashPassword(judgePass);
      const hackathon: Hackathon = {
        id:               generateId(),
        name:             name.trim(),
        tagline:          tagline.trim(),
        description:      description.trim(),
        banner:           '',
        tracks,
        deadline,
        status,
        judgeToken:       generateJudgeToken(),
        judgePasswordHash,
        createdBy:        '',  // filled by auth context in real app
        createdAt:        new Date().toISOString(),
        updatedAt:        new Date().toISOString(),
      };
      HackathonStore.save(hackathon);
      router.push(`/admin/hackathons/${hackathon.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className={`container container--narrow`} style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

          <Link href="/admin/hackathons" className={styles.back}>
            <ChevronLeft size={14} /> All Hackathons
          </Link>

          <h1 className={styles.title}>Create a Hackathon</h1>
          <p className={styles.sub}>Set up the hackathon details, define tracks, and configure judge access.</p>

          {error && <div className={styles.errorBox}>{error}</div>}

          {/* Basic Info */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Layers size={16} /> Basic Information</h2>
            <div className="field">
              <label className="label">Hackathon Name *</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., InnoSprint 2025" maxLength={80} />
            </div>
            <div className="field">
              <label className="label">Tagline</label>
              <input className="input" value={tagline} onChange={e => setTagline(e.target.value)}
                placeholder="One sentence that captures the spirit" maxLength={120} />
            </div>
            <div className="field">
              <label className="label">Description</label>
              <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)}
                placeholder="What is this hackathon about? Who can participate? What's the prize?" rows={4} />
            </div>
          </section>

          {/* Deadline */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Calendar size={16} /> Deadline</h2>
            <div className="field">
              <label className="label">Submission Deadline *</label>
              <input className="input" type="datetime-local" value={deadline}
                onChange={e => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)} />
              <p className="hint">After this time, teams cannot edit their projects under this hackathon. You can change this later.</p>
            </div>
          </section>

          {/* Tracks */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><Layers size={16} /> Tracks / Themes</h2>
              <button onClick={addTrack} disabled={tracks.length >= 5}
                className="btn btn-secondary btn-sm">
                <Plus size={13} /> Add Track
              </button>
            </div>
            <p className={styles.sectionHint}>Define 1–5 problem tracks. Teams choose one when setting up their project.</p>

            {tracks.map((track, i) => (
              <div key={track.id} className={styles.trackCard}>
                <div className={styles.trackHeader}>
                  <span className={styles.trackIndex}>Track {i + 1}</span>
                  {tracks.length > 1 && (
                    <button onClick={() => removeTrack(track.id)} className={styles.removeBtn}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="field">
                  <label className="label">Track Name *</label>
                  <input className="input" value={track.name}
                    onChange={e => updateTrack(track.id, 'name', e.target.value)}
                    placeholder="e.g., AI/ML, Web Dev, IoT" maxLength={60} />
                </div>
                <div className="field">
                  <label className="label">Description</label>
                  <input className="input" value={track.description}
                    onChange={e => updateTrack(track.id, 'description', e.target.value)}
                    placeholder="Short track description" maxLength={200} />
                </div>
                <div className="field">
                  <label className="label">Problem Statement</label>
                  <textarea className="textarea" value={track.problemStatement}
                    onChange={e => updateTrack(track.id, 'problemStatement', e.target.value)}
                    placeholder="Describe the challenge teams should solve..."
                    rows={3} />
                </div>
                <label className={styles.checkboxRow}>
                  <input type="checkbox" checked={track.openInnovation}
                    onChange={e => updateTrack(track.id, 'openInnovation', e.target.checked)} />
                  <span>Open Innovation — teams define their own problem</span>
                </label>
              </div>
            ))}
          </section>

          {/* Judge Access */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Shield size={16} /> Judge Access</h2>
            <p className={styles.sectionHint}>
              A unique judge link is auto-generated. To access it, judges must also enter this password.
            </p>
            <div className="field">
              <label className="label">Judge Password *</label>
              <input className="input" type="password" value={judgePass}
                onChange={e => setJudgePass(e.target.value)}
                placeholder="Set a password judges will enter to view projects" />
              <p className="hint">Share this privately with your judges. It can be changed from the manage page.</p>
            </div>
            <div className={styles.infoBox}>
              <Info size={13} />
              <span>The judge link will be shown on the manage page after creation. Judges do not need a platform account.</span>
            </div>
          </section>

          {/* Actions */}
          <div className={styles.actions}>
            <button className="btn btn-secondary" onClick={() => handleSubmit('draft')} disabled={saving}>
              Save as Draft
            </button>
            <button className="btn btn-primary" onClick={() => handleSubmit('active')} disabled={saving}>
              {saving ? 'Creating…' : 'Create & Activate'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
