'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { IdeaStore } from '@/lib/store';
import { sanitizeString } from '@/lib/security';
import type { Idea, IdeaStage } from '@/types';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import styles from '../../../submit.module.css';

const DOMAINS = ['AI/ML','Web Dev','Mobile','DevOps/Cloud','IoT/Hardware','Blockchain/Web3','Healthcare','Fintech','EdTech','SaaS','Cybersecurity','AR/VR','Data Engineering','Social Impact'];
const STAGES: { value: IdeaStage; label: string }[] = [
  { value: 'raw', label: 'Raw Idea' },
  { value: 'refined', label: 'Refined' },
  { value: 'prototype-ready', label: 'Prototype Ready' },
  { value: 'incubating', label: 'Incubating' },
];

export default function EditIdeaPage() {
  const { id } = useParams<{ id: string }>();
  const { userId, role, isLoading } = useAuth();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle]         = useState('');
  const [summary, setSummary]     = useState('');
  const [problem, setProblem]     = useState('');
  const [solution, setSolution]   = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [impact, setImpact]       = useState('');
  const [feasibility, setFeasibility] = useState('');
  const [novelty, setNovelty]     = useState('');
  const [domain, setDomain]       = useState('');
  const [stage, setStage]         = useState<IdeaStage>('raw');
  const [risks, setRisks]         = useState('');
  const [roadmap, setRoadmap]     = useState('');
  const [neededSkills, setNeededSkills] = useState('');
  const [tags, setTags]           = useState('');
  const [visibility, setVisibility] = useState<'public' | 'admin-only'>('public');

  useEffect(() => {
    if (!isLoading && !userId) { router.replace('/login'); return; }
    const i = IdeaStore.getById(id);
    if (!i) { router.replace('/dashboard'); return; }
    if (i.authorId !== userId && role !== 'admin') { router.replace('/dashboard'); return; }
    setIdea(i);
    setTitle(i.title); setSummary(i.summary); setProblem(i.problem);
    setSolution(i.solution); setTargetUsers(i.targetUsers); setImpact(i.impact);
    setFeasibility(i.feasibility); setNovelty(i.novelty); setDomain(i.domain);
    setStage(i.stage); setRisks(i.risks ?? ''); setRoadmap(i.roadmap ?? '');
    setNeededSkills(i.neededSkills.join(', ')); setTags(i.tags.join(', '));
    setVisibility(i.visibility);
  }, [id, userId, role, isLoading, router]);

  async function save() {
    if (!idea || !userId) return;
    setSaving(true);
    const updated: Idea = {
      ...idea,
      title: sanitizeString(title), summary: sanitizeString(summary),
      problem: sanitizeString(problem), solution: sanitizeString(solution),
      targetUsers: sanitizeString(targetUsers), impact: sanitizeString(impact),
      feasibility: sanitizeString(feasibility), novelty: sanitizeString(novelty),
      domain: sanitizeString(domain), stage, risks: sanitizeString(risks),
      roadmap: sanitizeString(roadmap),
      neededSkills: neededSkills.split(',').map(s => sanitizeString(s.trim())).filter(Boolean),
      tags: tags.split(',').map(t => sanitizeString(t.trim())).filter(Boolean),
      visibility, version: idea.version + 1,
      versionHistory: [...idea.versionHistory, { version: idea.version + 1, savedAt: new Date().toISOString(), summary: 'Updated' }],
      updatedAt: new Date().toISOString(),
    };
    IdeaStore.save(updated);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function deleteIdea() {
    if (!idea || !confirm('Delete this idea permanently?')) return;
    IdeaStore.delete(idea.id);
    router.replace('/dashboard');
  }

  if (isLoading || !idea) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container container--narrow" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/dashboard" className={styles.backLink}><ArrowLeft size={15} />Back to dashboard</Link>
          <div className={styles.header}>
            <h1 className={styles.title}>Edit idea</h1>
            <p className={styles.sub}>{idea.title}</p>
          </div>

          <div className={styles.form}>
            <div className="field"><label className="label" htmlFor="ei-title">Title</label>
              <input id="ei-title" className="input" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} /></div>
            <div className="field"><label className="label" htmlFor="ei-summary">One-line summary</label>
              <input id="ei-summary" className="input" value={summary} onChange={e => setSummary(e.target.value)} maxLength={200} /></div>
            <div className="field"><label className="label" htmlFor="ei-problem">Problem</label>
              <textarea id="ei-problem" className="textarea" rows={4} value={problem} onChange={e => setProblem(e.target.value)} maxLength={800} /></div>
            <div className="field"><label className="label" htmlFor="ei-solution">Solution</label>
              <textarea id="ei-solution" className="textarea" rows={4} value={solution} onChange={e => setSolution(e.target.value)} maxLength={800} /></div>
            <div className="field"><label className="label" htmlFor="ei-users">Target users</label>
              <input id="ei-users" className="input" value={targetUsers} onChange={e => setTargetUsers(e.target.value)} maxLength={200} /></div>
            <div className="field"><label className="label" htmlFor="ei-impact">Impact</label>
              <textarea id="ei-impact" className="textarea" rows={3} value={impact} onChange={e => setImpact(e.target.value)} maxLength={500} /></div>
            <div className="field"><label className="label" htmlFor="ei-feasibility">Feasibility</label>
              <textarea id="ei-feasibility" className="textarea" rows={3} value={feasibility} onChange={e => setFeasibility(e.target.value)} maxLength={500} /></div>
            <div className="field"><label className="label" htmlFor="ei-novelty">Why is this novel?</label>
              <textarea id="ei-novelty" className="textarea" rows={3} value={novelty} onChange={e => setNovelty(e.target.value)} maxLength={500} /></div>
            <div className="field"><label className="label" htmlFor="ei-risks">Risks</label>
              <textarea id="ei-risks" className="textarea" rows={2} value={risks} onChange={e => setRisks(e.target.value)} maxLength={400} /></div>
            <div className="field"><label className="label" htmlFor="ei-roadmap">Roadmap</label>
              <textarea id="ei-roadmap" className="textarea" rows={2} value={roadmap} onChange={e => setRoadmap(e.target.value)} maxLength={400} /></div>
            <div className={styles.row2}>
              <div className="field"><label className="label" htmlFor="ei-domain">Domain</label>
                <select id="ei-domain" className="select" value={domain} onChange={e => setDomain(e.target.value)}>
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select></div>
              <div className="field"><label className="label" htmlFor="ei-stage">Stage</label>
                <select id="ei-stage" className="select" value={stage} onChange={e => setStage(e.target.value as IdeaStage)}>
                  {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select></div>
            </div>
            <div className="field"><label className="label" htmlFor="ei-skills">Skills needed (comma-separated)</label>
              <input id="ei-skills" className="input" value={neededSkills} onChange={e => setNeededSkills(e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="ei-tags">Tags (comma-separated)</label>
              <input id="ei-tags" className="input" value={tags} onChange={e => setTags(e.target.value)} /></div>

            <div className={styles.visRow} style={{ marginTop: 'var(--space-4)' }}>
              <button type="button" className={`${styles.visBtn} ${visibility === 'public' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('public')}>
                <Eye size={15} /><span>Public</span><span className={styles.visSub}>Visible to everyone</span>
              </button>
              <button type="button" className={`${styles.visBtn} ${visibility === 'admin-only' ? styles.visBtnActive : ''}`} onClick={() => setVisibility('admin-only')}>
                <span>🔒</span><span>Recruiter + Admin only</span><span className={styles.visSub}>Hidden from general public</span>
              </button>
            </div>

            <div className={styles.nav} style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <button className="btn btn-danger btn-sm" onClick={deleteIdea}><Trash2 size={13} /> Delete idea</button>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginLeft: 'auto', alignItems: 'center' }}>
                {saved && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--success)' }}>Saved!</span>}
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  <Save size={14} /> {saving ? 'Saving…' : 'Save changes'}
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
