'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { ProjectStore } from '@/lib/store';
import { sanitizeString } from '@/lib/security';
import type { Project } from '@/types';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import styles from '../../../submit.module.css';

const DOMAINS = ['AI/ML','Web Dev','Mobile','DevOps/Cloud','IoT/Hardware','Blockchain/Web3','Healthcare','Fintech','EdTech','SaaS','Cybersecurity','AR/VR','Data Engineering','Social Impact'];
const STATUSES = ['Idea','Prototype','MVP','Open Source Beta','Live (Beta)','Deployed','Used in Production','POC Complete'];

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { userId, role, isLoading } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle]         = useState('');
  const [tagline, setTagline]     = useState('');
  const [summary, setSummary]     = useState('');
  const [problem, setProblem]     = useState('');
  const [solution, setSolution]   = useState('');
  const [impact, setImpact]       = useState('');
  const [techStack, setTechStack] = useState('');
  const [domain, setDomain]       = useState('');
  const [buildStatus, setBuildStatus] = useState('');
  const [github, setGithub]       = useState('');
  const [liveDemo, setLiveDemo]   = useState('');
  const [demoVideo, setDemoVideo] = useState('');
  const [challengesFaced, setChallenges] = useState('');
  const [learnings, setLearnings] = useState('');
  const [futureScope, setFuture]  = useState('');
  const [tags, setTags]           = useState('');
  const [visibility, setVisibility] = useState<'public' | 'admin-only'>('public');
  const [status, setStatus]       = useState<'draft' | 'published'>('published');

  useEffect(() => {
    if (!isLoading && !userId) { router.replace('/login'); return; }
    const p = ProjectStore.getById(id);
    if (!p) { router.replace('/dashboard'); return; }
    if (p.authorId !== userId && role !== 'admin') { router.replace('/dashboard'); return; }
    setProject(p);
    setTitle(p.title); setTagline(p.tagline); setSummary(p.summary);
    setProblem(p.problemStatement); setSolution(p.solution); setImpact(p.impact);
    setTechStack(p.techStack.join(', ')); setDomain(p.domain); setBuildStatus(p.buildStatus);
    setGithub(p.githubLink); setLiveDemo(p.liveDemo ?? ''); setDemoVideo(p.demoVideo ?? '');
    setChallenges(p.challengesFaced ?? ''); setLearnings(p.learnings ?? ''); setFuture(p.futureScope ?? '');
    setTags(p.tags.join(', ')); setVisibility(p.visibility); setStatus(p.status as 'draft' | 'published');
  }, [id, userId, role, isLoading, router]);

  async function save(newStatus?: 'draft' | 'published') {
    if (!project || !userId) return;
    setSaving(true);
    const updated: Project = {
      ...project,
      title: sanitizeString(title), tagline: sanitizeString(tagline),
      summary: sanitizeString(summary), problemStatement: sanitizeString(problem),
      solution: sanitizeString(solution), impact: sanitizeString(impact),
      techStack: techStack.split(',').map(t => sanitizeString(t.trim())).filter(Boolean),
      domain: sanitizeString(domain), buildStatus: sanitizeString(buildStatus),
      githubLink: sanitizeString(github), liveDemo: sanitizeString(liveDemo),
      demoVideo: sanitizeString(demoVideo), challengesFaced: sanitizeString(challengesFaced),
      learnings: sanitizeString(learnings), futureScope: sanitizeString(futureScope),
      tags: tags.split(',').map(t => sanitizeString(t.trim())).filter(Boolean),
      visibility, status: newStatus ?? status,
      version: project.version + 1,
      versionHistory: [...project.versionHistory, { version: project.version + 1, savedAt: new Date().toISOString(), summary: 'Updated' }],
      updatedAt: new Date().toISOString(),
    };
    ProjectStore.save(updated);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function deleteProject() {
    if (!project || !confirm('Delete this project permanently?')) return;
    ProjectStore.delete(project.id);
    router.replace('/dashboard');
  }

  if (isLoading || !project) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container container--narrow" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/dashboard" className={styles.backLink}><ArrowLeft size={15} />Back to dashboard</Link>
          <div className={styles.header}>
            <h1 className={styles.title}>Edit project</h1>
            <p className={styles.sub}>{project.title}</p>
          </div>

          <div className={styles.form}>
            <h2 className={styles.stepTitle}>Basic info</h2>
            <div className="field"><label className="label" htmlFor="ep-title">Title</label>
              <input id="ep-title" className="input" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} /></div>
            <div className="field"><label className="label" htmlFor="ep-tagline">Tagline</label>
              <input id="ep-tagline" className="input" value={tagline} onChange={e => setTagline(e.target.value)} maxLength={160} /></div>
            <div className="field"><label className="label" htmlFor="ep-summary">Summary</label>
              <textarea id="ep-summary" className="textarea" rows={3} value={summary} onChange={e => setSummary(e.target.value)} maxLength={500} /></div>
            <div className={styles.row2}>
              <div className="field"><label className="label" htmlFor="ep-domain">Domain</label>
                <select id="ep-domain" className="select" value={domain} onChange={e => setDomain(e.target.value)}>
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="field"><label className="label" htmlFor="ep-buildstatus">Build status</label>
                <select id="ep-buildstatus" className="select" value={buildStatus} onChange={e => setBuildStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <h2 className={styles.stepTitle} style={{ marginTop: 'var(--space-6)' }}>Problem & Solution</h2>
            <div className="field"><label className="label" htmlFor="ep-problem">Problem statement</label>
              <textarea id="ep-problem" className="textarea" rows={4} value={problem} onChange={e => setProblem(e.target.value)} maxLength={1000} /></div>
            <div className="field"><label className="label" htmlFor="ep-solution">Solution</label>
              <textarea id="ep-solution" className="textarea" rows={4} value={solution} onChange={e => setSolution(e.target.value)} maxLength={1000} /></div>
            <div className="field"><label className="label" htmlFor="ep-impact">Impact</label>
              <textarea id="ep-impact" className="textarea" rows={3} value={impact} onChange={e => setImpact(e.target.value)} maxLength={500} /></div>
            <div className="field"><label className="label" htmlFor="ep-challenges">Challenges faced</label>
              <textarea id="ep-challenges" className="textarea" rows={2} value={challengesFaced} onChange={e => setChallenges(e.target.value)} maxLength={500} /></div>
            <div className="field"><label className="label" htmlFor="ep-learnings">What you learned</label>
              <textarea id="ep-learnings" className="textarea" rows={2} value={learnings} onChange={e => setLearnings(e.target.value)} maxLength={500} /></div>
            <div className="field"><label className="label" htmlFor="ep-future">Future scope</label>
              <textarea id="ep-future" className="textarea" rows={2} value={futureScope} onChange={e => setFuture(e.target.value)} maxLength={300} /></div>

            <h2 className={styles.stepTitle} style={{ marginTop: 'var(--space-6)' }}>Links & tags</h2>
            <div className="field"><label className="label" htmlFor="ep-tech">Tech stack (comma-separated)</label>
              <input id="ep-tech" className="input" value={techStack} onChange={e => setTechStack(e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="ep-github">GitHub link</label>
              <input id="ep-github" type="url" className="input" value={github} onChange={e => setGithub(e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="ep-demo">Live demo</label>
              <input id="ep-demo" type="url" className="input" value={liveDemo} onChange={e => setLiveDemo(e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="ep-video">Demo video</label>
              <input id="ep-video" type="url" className="input" value={demoVideo} onChange={e => setDemoVideo(e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="ep-tags">Tags (comma-separated)</label>
              <input id="ep-tags" className="input" value={tags} onChange={e => setTags(e.target.value)} /></div>

            <h2 className={styles.stepTitle} style={{ marginTop: 'var(--space-6)' }}>Visibility</h2>
            <div className={styles.visRow}>
              <button type="button" className={`${styles.visBtn} ${visibility === 'public' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('public')}>
                <Eye size={15} /><span>Public</span><span className={styles.visSub}>Visible to everyone</span>
              </button>
              <button type="button" className={`${styles.visBtn} ${visibility === 'admin-only' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('admin-only')}>
                <span>🔒</span><span>Recruiter + Admin only</span><span className={styles.visSub}>Hidden from general public</span>
              </button>
            </div>

            <div className={styles.nav} style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <button className="btn btn-danger btn-sm" onClick={deleteProject}><Trash2 size={13} /> Delete project</button>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginLeft: 'auto' }}>
                {saved && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--success)', alignSelf: 'center' }}>Saved!</span>}
                <button className="btn btn-secondary" onClick={() => save('draft')} disabled={saving}><Save size={14} /> Save draft</button>
                <button className="btn btn-primary" onClick={() => save('published')} disabled={saving}>
                  {saving ? 'Saving…' : 'Save & publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
