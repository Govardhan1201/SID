'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHackathonProject, updateHackathonProject } from '@/app/actions/hackathon';
import type { Hackathon, HackathonTeam, HackathonProject } from '@/types';
import { Save, AlertCircle } from 'lucide-react';
import styles from './project-form.module.css';

interface Props {
  hackathon: Hackathon;
  team: HackathonTeam;
  existingProject?: HackathonProject;
}

export default function HackathonProjectForm({ hackathon, team, existingProject }: Props) {
  const router = useRouter();
  
  const [title, setTitle] = useState(existingProject?.title || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [trackId, setTrackId] = useState(existingProject?.trackId || team.trackId || '');
  const [githubLink, setGithubLink] = useState(existingProject?.githubLink || '');
  const [demoLink, setDemoLink] = useState(existingProject?.demoLink || '');
  const [videoLink, setVideoLink] = useState(existingProject?.videoLink || '');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isPastDeadline = new Date(hackathon.deadline) < new Date();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPastDeadline) return;
    
    setError('');
    if (!title.trim()) return setError('Project name is required');
    if (!trackId) return setError('Please select a track');
    if (!description.trim()) return setError('Please provide a short description');

    setSaving(true);
    
    try {
      if (existingProject) {
        await updateHackathonProject(existingProject.id, {
          trackId: trackId,
          title: title.trim(),
          tagline: description.trim().substring(0, 100),
          description: description.trim(),
          githubLink: githubLink.trim(),
          demoLink: demoLink.trim(),
          videoLink: videoLink.trim(),
        });
      } else {
        await createHackathonProject({
          hackathonId: hackathon.id,
          teamId: team.id,
          trackId: trackId,
          title: title.trim(),
          tagline: description.trim().substring(0, 100),
          description: description.trim(),
          problemSolved: '',
          techStack: [],
          githubLink: githubLink.trim(),
          demoLink: demoLink.trim(),
          videoLink: videoLink.trim(),
          presentationLink: '',
          screenshots: [],
          status: 'submitted',
        });
      }

      router.push(`/hackathon/${hackathon.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to submit project. Please try again.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {isPastDeadline && (
        <div className={styles.deadlineAlert}>
          <AlertCircle size={16} /> The submission deadline has passed. You cannot modify this project.
        </div>
      )}
      
      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.section}>
        <div className="field">
          <label className="label">Project Name *</label>
          <input 
            type="text" 
            className="input" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isPastDeadline}
            placeholder="What did your team build?"
            maxLength={100}
          />
        </div>

        <div className="field">
          <label className="label">Track *</label>
          <select 
            className="select" 
            value={trackId}
            onChange={e => setTrackId(e.target.value)}
            disabled={isPastDeadline}
          >
            <option value="">-- Select a track --</option>
            {hackathon.tracks.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <p className="hint">The track your team is competing in.</p>
        </div>

        <div className="field">
          <label className="label">Short Description *</label>
          <textarea 
            className="textarea" 
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isPastDeadline}
            placeholder="Briefly describe what your project does..."
            rows={4}
            maxLength={500}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Links (Optional)</h3>
        
        <div className="field">
          <label className="label">GitHub Repository URL</label>
          <input 
            type="url" 
            className="input" 
            value={githubLink}
            onChange={e => setGithubLink(e.target.value)}
            disabled={isPastDeadline}
            placeholder="https://github.com/..."
          />
        </div>

        <div className="field">
          <label className="label">Live Demo URL</label>
          <input 
            type="url" 
            className="input" 
            value={demoLink}
            onChange={e => setDemoLink(e.target.value)}
            disabled={isPastDeadline}
            placeholder="https://..."
          />
        </div>

        <div className="field">
          <label className="label">Demo Video URL</label>
          <input 
            type="url" 
            className="input" 
            value={videoLink}
            onChange={e => setVideoLink(e.target.value)}
            disabled={isPastDeadline}
            placeholder="YouTube, Loom, etc."
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          type="button" 
          className="btn btn-ghost" 
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={saving || isPastDeadline}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Submit Project'}
        </button>
      </div>
    </form>
  );
}
