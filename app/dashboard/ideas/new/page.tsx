'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { IdeaStore } from '@/lib/store';
import { generateId, sanitizeString } from '@/lib/security';
import type { Idea, IdeaStage } from '@/types';
import { ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';
import styles from '../../submit.module.css';

const DOMAINS = ['AI/ML','Web Dev','Mobile','DevOps/Cloud','IoT/Hardware','Blockchain/Web3','Healthcare','Fintech','EdTech','SaaS','Cybersecurity','AR/VR','Data Engineering','Social Impact'];
const STAGES: { value: IdeaStage; label: string; desc: string }[] = [
  { value: 'raw',            label: 'Raw Idea',        desc: 'Just the concept, not fully formed yet' },
  { value: 'refined',        label: 'Refined',          desc: "You've thought through the problem and solution" },
  { value: 'prototype-ready', label: 'Prototype Ready', desc: "You're ready to start building or have started" },
  { value: 'incubating',     label: 'Incubating',       desc: "Actively working on it with a team" },
];
const SDG = ['SDG 1 - No Poverty','SDG 3 - Good Health','SDG 4 - Quality Education','SDG 8 - Decent Work','SDG 10 - Reduced Inequalities','SDG 13 - Climate Action'];

export default function NewIdeaPage() {
  const { userId, studentProfile, isLoading, role } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 3;

  const [title, setTitle]           = useState('');
  const [summary, setSummary]       = useState('');
  const [problem, setProblem]       = useState('');
  const [solution, setSolution]     = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [impact, setImpact]         = useState('');
  const [feasibility, setFeasibility] = useState('');
  const [novelty, setNovelty]       = useState('');
  const [domain, setDomain]         = useState('');
  const [stage, setStage]           = useState<IdeaStage>('raw');
  const [risks, setRisks]           = useState('');
  const [roadmap, setRoadmap]       = useState('');
  const [sdg, setSdg]               = useState<string[]>([]);
  const [neededResources, setNeededResources] = useState('');
  const [neededSkills, setNeededSkills]       = useState('');
  const [tags, setTags]             = useState('');
  const [visibility, setVisibility] = useState<'public' | 'admin-only'>('public');

  useEffect(() => {
    if (!isLoading && (!userId || role !== 'student')) router.replace('/login');
  }, [userId, role, isLoading, router]);

  function toggleSdg(s: string) { setSdg(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]); }

  async function save(status: 'draft' | 'published') {
    if (!userId || !studentProfile) return;
    setSaving(true);
    const idea: Idea = {
      id: generateId(), authorId: userId,
      title: sanitizeString(title), summary: sanitizeString(summary),
      problem: sanitizeString(problem), solution: sanitizeString(solution),
      targetUsers: sanitizeString(targetUsers), impact: sanitizeString(impact),
      feasibility: sanitizeString(feasibility), novelty: sanitizeString(novelty),
      category: domain, domain: sanitizeString(domain),
      sdgAlignment: sdg,
      neededResources: neededResources.split(',').map(s => sanitizeString(s.trim())).filter(Boolean),
      neededSkills: neededSkills.split(',').map(s => sanitizeString(s.trim())).filter(Boolean),
      stage, risks: sanitizeString(risks), roadmap: sanitizeString(roadmap),
      visibility, status, moderationStatus: 'pending', isFeatured: false,
      views: 0, likes: [], bookmarks: [], comments: [],
      tags: tags.split(',').map(t => sanitizeString(t.trim())).filter(Boolean),
      version: 1,
      versionHistory: [{ version: 1, savedAt: new Date().toISOString(), summary: status === 'draft' ? 'Draft saved' : 'Initial submission' }],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    IdeaStore.save(idea);
    setSaving(false);
    router.push(`/idea/${idea.id}`);
  }

  if (isLoading || !userId) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container container--narrow" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/dashboard" className={styles.backLink}><ArrowLeft size={15} />Back to dashboard</Link>
          <div className={styles.header}>
            <h1 className={styles.title}>Submit an idea</h1>
            <p className={styles.sub}>Good ideas are specific. Describe the problem clearly before the solution.</p>
          </div>
          <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${(step / totalSteps) * 100}%` }} /></div>
          <p className={styles.stepLabel}>Step {step} of {totalSteps}</p>

          {step === 1 && (
            <div className={styles.form}>
              <h2 className={styles.stepTitle}>The core idea</h2>
              <div className="field"><label className="label" htmlFor="i-title">Idea title *</label>
                <input id="i-title" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="PillPal — smart pill dispenser for elderly patients" maxLength={120} /></div>
              <div className="field"><label className="label" htmlFor="i-summary">One-line summary *</label>
                <input id="i-summary" className="input" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summarize what this is in one sentence" maxLength={200} /></div>
              <div className="field"><label className="label" htmlFor="i-problem">Problem being solved *</label>
                <textarea id="i-problem" className="textarea" rows={4} value={problem} onChange={e => setProblem(e.target.value)} maxLength={800} placeholder="Who has this problem? How serious is it? Include numbers or examples if you have them." /></div>
              <div className="field"><label className="label" htmlFor="i-solution">Proposed solution *</label>
                <textarea id="i-solution" className="textarea" rows={4} value={solution} onChange={e => setSolution(e.target.value)} maxLength={800} placeholder="How would you solve it? What's technically interesting about your approach?" /></div>
              <div className="field"><label className="label" htmlFor="i-users">Target users</label>
                <input id="i-users" className="input" value={targetUsers} onChange={e => setTargetUsers(e.target.value)} placeholder="e.g. Elderly patients, rural healthcare workers" maxLength={200} /></div>
              <div className={styles.nav}>
                <div />
                <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!title || !summary || !problem || !solution}>Next <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.form}>
              <h2 className={styles.stepTitle}>Depth & context</h2>
              <div className="field"><label className="label" htmlFor="i-impact">Impact</label>
                <textarea id="i-impact" className="textarea" rows={3} value={impact} onChange={e => setImpact(e.target.value)} maxLength={500} placeholder="What changes if this gets built? Who benefits and by how much?" /></div>
              <div className="field"><label className="label" htmlFor="i-feasibility">Feasibility</label>
                <textarea id="i-feasibility" className="textarea" rows={3} value={feasibility} onChange={e => setFeasibility(e.target.value)} maxLength={500} placeholder="How would you build this? What would it cost? How long would it take?" /></div>
              <div className="field"><label className="label" htmlFor="i-novelty">Why is this novel?</label>
                <textarea id="i-novelty" className="textarea" rows={3} value={novelty} onChange={e => setNovelty(e.target.value)} maxLength={500} placeholder="What makes this different from existing solutions?" /></div>
              <div className="field"><label className="label" htmlFor="i-risks">Risks & limitations</label>
                <textarea id="i-risks" className="textarea" rows={2} value={risks} onChange={e => setRisks(e.target.value)} maxLength={400} placeholder="What could go wrong? What are the technical or regulatory hurdles?" /></div>
              <div className="field"><label className="label" htmlFor="i-roadmap">Roadmap</label>
                <textarea id="i-roadmap" className="textarea" rows={2} value={roadmap} onChange={e => setRoadmap(e.target.value)} maxLength={400} placeholder="Phase 1 → Phase 2 → Phase 3…" /></div>
              <div className={styles.nav}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} />Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.form}>
              <h2 className={styles.stepTitle}>Stage, resources & visibility</h2>

              <div className="field"><label className="label">Idea stage *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {STAGES.map(s => (
                    <button key={s.value} type="button" onClick={() => setStage(s.value)}
                      className={`${styles.visBtn} ${stage === s.value ? styles.visBtnActive : ''}`}
                      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{s.label}</span>
                        <span className={styles.visSub} style={{ display: 'block' }}>{s.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field"><label className="label" htmlFor="i-domain">Domain *</label>
                <select id="i-domain" className="select" value={domain} onChange={e => setDomain(e.target.value)}>
                  <option value="">Select domain…</option>
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="field"><label className="label" htmlFor="i-resources">Resources needed</label>
                <input id="i-resources" className="input" value={neededResources} onChange={e => setNeededResources(e.target.value)} placeholder="Hardware, API access, funding… (comma-separated)" maxLength={300} /></div>
              <div className="field"><label className="label" htmlFor="i-skills">Skills you're looking for</label>
                <input id="i-skills" className="input" value={neededSkills} onChange={e => setNeededSkills(e.target.value)} placeholder="Android developer, ML engineer… (comma-separated)" maxLength={300} /></div>
              <div className="field"><label className="label" htmlFor="i-tags">Tags</label>
                <input id="i-tags" className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="IoT, Healthcare, ESP32 (comma-separated)" maxLength={200} /></div>

              <div className="field"><label className="label">SDG Alignment</label>
                <div className={styles.chipGrid}>{SDG.map(s => <button key={s} type="button" className={`${styles.pickChip} ${sdg.includes(s) ? styles.pickChipActive : ''}`} onClick={() => toggleSdg(s)}>{s}</button>)}</div>
              </div>

              <div className="field"><label className="label">Visibility</label>
                <div className={styles.visRow}>
                  <button type="button" className={`${styles.visBtn} ${visibility === 'public' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('public')}>
                    <Eye size={15} /><span>Public</span><span className={styles.visSub}>Anyone can find this idea</span>
                  </button>
                  <button type="button" className={`${styles.visBtn} ${visibility === 'admin-only' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('admin-only')}>
                    <span>🔒</span><span>Recruiter + Admin only</span><span className={styles.visSub}>Hidden from general public</span>
                  </button>
                </div>
              </div>

              <div className={styles.nav}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}><ArrowLeft size={16} />Back</button>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={() => save('draft')} disabled={saving}><Save size={14} />Save draft</button>
                  <button className="btn btn-primary" onClick={() => save('published')} disabled={saving || !title || !problem || !solution || !domain}>
                    {saving ? 'Publishing…' : 'Publish idea'}
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
