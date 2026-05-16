'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { ProjectStore, IdeaStore } from '@/lib/store';
import { generateId, sanitizeString } from '@/lib/security';
import type { Project } from '@/types';
import { ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';
import styles from '../../submit.module.css';

const DOMAINS = ['AI/ML', 'Web Dev', 'Mobile', 'DevOps/Cloud', 'IoT/Hardware', 'Blockchain/Web3', 'Healthcare', 'Fintech', 'EdTech', 'SaaS', 'Cybersecurity', 'AR/VR', 'Data Engineering', 'Social Impact'];
const SDG_OPTIONS = ['SDG 1 - No Poverty', 'SDG 3 - Good Health', 'SDG 4 - Quality Education', 'SDG 8 - Decent Work', 'SDG 9 - Industry & Innovation', 'SDG 10 - Reduced Inequalities', 'SDG 11 - Sustainable Cities', 'SDG 13 - Climate Action', 'SDG 17 - Partnerships'];
const STATUSES = [{ value: 'Idea', label: 'Idea' }, { value: 'Prototype', label: 'Prototype' }, { value: 'MVP', label: 'MVP' }, { value: 'Deployed', label: 'Deployed' }, { value: 'Open Source Beta', label: 'Open Source Beta' }];

function NewProjectForm() {
  const { userId, studentProfile, isLoading, role } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 4;

  // Form fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [impact, setImpact] = useState('');
  const [techStack, setTechStack] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('');
  const [sdg, setSdg] = useState<string[]>([]);
  const [github, setGithub] = useState('');
  const [liveDemo, setLiveDemo] = useState('');
  const [demoVideo, setDemoVideo] = useState('');
  const [buildStatus, setBuildStatus] = useState('');
  const [challenges, setChallenges] = useState('');
  const [learnings, setLearnings] = useState('');
  const [futureScope, setFutureScope] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'admin-only'>('public');

  useEffect(() => {
    if (!isLoading && (!userId || role !== 'student')) router.replace('/login');
  }, [userId, role, isLoading, router]);

  function toggleSdg(s: string) { setSdg(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]); }

  function aiSuggestTags() {
    const text = [title, tagline, domain, techStack].join(' ').toLowerCase();
    const suggestions: string[] = [];
    if (text.includes('ai') || text.includes('ml') || text.includes('model')) suggestions.push('AI', 'Machine Learning');
    if (text.includes('react') || text.includes('next')) suggestions.push('React', 'Web App');
    if (text.includes('health')) suggestions.push('Healthcare', 'MedTech');
    if (text.includes('finance') || text.includes('payment')) suggestions.push('Fintech');
    if (text.includes('edu') || text.includes('learn')) suggestions.push('EdTech');
    if (suggestions.length) setTags(prev => [...new Set([...(prev.split(',').map(s => s.trim()).filter(Boolean)), ...suggestions])].join(', '));
  }

  async function saveProject(status: 'draft' | 'published') {
    if (!userId || !studentProfile) return;
    setSaving(true);
    const project: Project = {
      id: generateId(),
      authorId: userId,
      title: sanitizeString(title),
      tagline: sanitizeString(tagline),
      summary: sanitizeString(summary),
      description: sanitizeString(description),
      problemStatement: sanitizeString(problem),
      solution: sanitizeString(solution),
      impact: sanitizeString(impact),
      techStack: techStack.split(',').map(t => sanitizeString(t.trim())).filter(Boolean),
      category: sanitizeString(category),
      domain: sanitizeString(domain),
      sdgMapping: sdg,
      teamMembers: [{ userId, name: studentProfile.name, role: 'Lead', avatar: studentProfile.avatar }],
      githubLink: sanitizeString(github),
      liveDemo: sanitizeString(liveDemo),
      demoVideo: sanitizeString(demoVideo),
      pptLink: '',
      screenshots: [], attachments: [],
      buildStatus: sanitizeString(buildStatus),
      challengesFaced: sanitizeString(challenges),
      learnings: sanitizeString(learnings),
      futureScope: sanitizeString(futureScope),
      tags: tags.split(',').map(t => sanitizeString(t.trim())).filter(Boolean),
      visibility,
      status,
      moderationStatus: 'pending',
      isFeatured: false,
      views: 0, likes: [], bookmarks: [], comments: [],
      version: 1,
      versionHistory: [{ version: 1, savedAt: new Date().toISOString(), summary: status === 'draft' ? 'Draft saved' : 'Initial submission' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ProjectStore.save(project);
    setSaving(false);
    router.push(`/project/${project.id}`);
  }

  if (isLoading || !userId) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container container--narrow" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/dashboard" className={styles.backLink}><ArrowLeft size={15} />Back to dashboard</Link>

          <div className={styles.header}>
            <h1 className={styles.title}>Submit a project</h1>
            <p className={styles.sub}>Be specific. Vague submissions get less attention from recruiters.</p>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
          <p className={styles.stepLabel}>Step {step} of {totalSteps}</p>

          {step === 1 && (
            <div className={styles.form}>
              <h2 className={styles.stepTitle}>The basics</h2>
              <div className="field"><label className="label" htmlFor="p-title">Project title *</label>
                <input id="p-title" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="MedAssist AI" maxLength={120} /></div>
              <div className="field"><label className="label" htmlFor="p-tagline">One-line tagline *</label>
                <input id="p-tagline" className="input" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="AI triage assistant for rural clinics" maxLength={160} /></div>
              <div className="field"><label className="label" htmlFor="p-summary">Short summary (2–3 sentences) *</label>
                <textarea id="p-summary" className="textarea" value={summary} onChange={e => setSummary(e.target.value)} rows={3} maxLength={500} placeholder="What does this project do and why did you build it?" /></div>
              <div className={styles.row2}>
                <div className="field"><label className="label" htmlFor="p-domain">Domain *</label>
                  <select id="p-domain" className="select" value={domain} onChange={e => setDomain(e.target.value)}>
                    <option value="">Select domain…</option>
                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="field"><label className="label" htmlFor="p-category">Category</label>
                  <input id="p-category" className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Healthcare App" maxLength={60} /></div>
              </div>
              <div className="field"><label className="label" htmlFor="p-status">Build status *</label>
                <select id="p-status" className="select" value={buildStatus} onChange={e => setBuildStatus(e.target.value)}>
                  <option value="">Select status…</option>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className={styles.nav}>
                <div />
                <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!title || !tagline || !summary || !domain || !buildStatus}>Next <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.form}>
              <h2 className={styles.stepTitle}>Problem & solution</h2>
              <div className="field"><label className="label" htmlFor="p-problem">Problem statement *</label>
                <textarea id="p-problem" className="textarea" rows={4} value={problem} onChange={e => setProblem(e.target.value)} maxLength={1000} placeholder="What specific problem does this solve? Who faces it? How big is it?" /></div>
              <div className="field"><label className="label" htmlFor="p-solution">Your solution *</label>
                <textarea id="p-solution" className="textarea" rows={4} value={solution} onChange={e => setSolution(e.target.value)} maxLength={1000} placeholder="How does your project solve this? What's technically interesting about your approach?" /></div>
              <div className="field"><label className="label" htmlFor="p-impact">Impact</label>
                <textarea id="p-impact" className="textarea" rows={3} value={impact} onChange={e => setImpact(e.target.value)} maxLength={500} placeholder="What results have you seen? Pilot numbers, user feedback, performance improvements…" /></div>
              <div className="field"><label className="label" htmlFor="p-challenges">Challenges you faced</label>
                <textarea id="p-challenges" className="textarea" rows={3} value={challenges} onChange={e => setChallenges(e.target.value)} maxLength={500} placeholder="What was harder than expected?" /></div>
              <div className="field"><label className="label" htmlFor="p-learnings">What you learned</label>
                <textarea id="p-learnings" className="textarea" rows={3} value={learnings} onChange={e => setLearnings(e.target.value)} maxLength={500} placeholder="Key insights from building this…" /></div>
              <div className="field"><label className="label" htmlFor="p-future">Future scope</label>
                <textarea id="p-future" className="textarea" rows={2} value={futureScope} onChange={e => setFutureScope(e.target.value)} maxLength={300} placeholder="Where could this go next?" /></div>
              <div className={styles.nav}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} />Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!problem || !solution}>Next <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.form}>
              <h2 className={styles.stepTitle}>Tech stack & links</h2>
              <div className="field"><label className="label" htmlFor="p-tech">Tech stack *</label>
                <input id="p-tech" className="input" value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, Node.js, Python, MongoDB (comma-separated)" maxLength={300} />
                <span className="hint">Separate with commas. This is how recruiters search for your project.</span>
              </div>
              <div className="field"><label className="label" htmlFor="p-github">GitHub link</label>
                <input id="p-github" type="url" className="input" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/you/project" /></div>
              <div className="field"><label className="label" htmlFor="p-demo">Live demo</label>
                <input id="p-demo" type="url" className="input" value={liveDemo} onChange={e => setLiveDemo(e.target.value)} placeholder="https://yourproject.vercel.app" /></div>
              <div className="field"><label className="label" htmlFor="p-video">Demo video link</label>
                <input id="p-video" type="url" className="input" value={demoVideo} onChange={e => setDemoVideo(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
              <div className="field"><label className="label">SDG Alignment (optional)</label>
                <div className={styles.chipGrid}>{SDG_OPTIONS.map(s => <button key={s} type="button" className={`${styles.pickChip} ${sdg.includes(s) ? styles.pickChipActive : ''}`} onClick={() => toggleSdg(s)}>{s}</button>)}</div>
              </div>
              <div className={styles.nav}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}><ArrowLeft size={16} />Back</button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>Next <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.form}>
              <h2 className={styles.stepTitle}>Tags & visibility</h2>
              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <label className="label" htmlFor="p-tags">Tags / keywords</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={aiSuggestTags}>AI suggest tags</button>
                </div>
                <input id="p-tags" className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="AI, Healthcare, Flutter, NLP (comma-separated)" maxLength={200} /></div>

              <div className="field">
                <label className="label">Visibility</label>
                <div className={styles.visRow}>
                  <button type="button" className={`${styles.visBtn} ${visibility === 'public' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('public')}>
                    <Eye size={16} />
                    <span>Public</span>
                    <span className={styles.visSub}>Anyone can find and view this</span>
                  </button>
                  <button type="button" className={`${styles.visBtn} ${visibility === 'admin-only' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('admin-only')}>
                    <span>🔒</span>
                    <span>Recruiter + Admin only</span>
                    <span className={styles.visSub}>Hidden from public — recruiters and admins can still see it</span>
                  </button>
                </div>
              </div>

              <div className={styles.nav}>
                <button className="btn btn-ghost" onClick={() => setStep(3)}><ArrowLeft size={16} />Back</button>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={() => saveProject('draft')} disabled={saving}><Save size={14} /> Save draft</button>
                  <button className="btn btn-primary" onClick={() => saveProject('published')} disabled={saving || !title || !problem || !solution}>
                    {saving ? 'Publishing…' : 'Publish project'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function NewProjectPage() { return <Suspense><NewProjectForm /></Suspense>; }
