'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StudentStore, RecruiterStore } from '@/lib/store';
import { sanitizeString } from '@/lib/security';
import type { StudentProfile, RecruiterProfile } from '@/types';
import { Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './onboarding.module.css';

const SKILLS = ['React', 'Node.js', 'Python', 'ML/AI', 'Flutter', 'Java', 'Go', 'Rust', 'TypeScript', 'Vue.js', 'Django', 'Docker', 'Kubernetes', 'AWS', 'Blockchain', 'Solidity', 'C++', 'Arduino', 'Unity', 'Figma', 'SQL', 'MongoDB', 'Redis', 'GraphQL', 'Next.js'];
const DOMAINS = ['AI/ML', 'Web Dev', 'Mobile', 'DevOps/Cloud', 'IoT/Hardware', 'Blockchain/Web3', 'Healthcare', 'Fintech', 'EdTech', 'SaaS', 'Cybersecurity', 'AR/VR', 'Data Engineering', 'Social Impact'];
const INDUSTRIES = ['Fintech', 'E-Commerce', 'SaaS', 'Healthcare', 'EdTech', 'Deep Tech', 'Gaming', 'Consulting', 'Product', 'Manufacturing'];

function OnboardingForm() {
  const params = useSearchParams();
  const role = params.get('role') as 'student' | 'recruiter' | null;
  const uid = params.get('uid') ?? '';
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Student fields
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('2');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);

  // Recruiter fields
  const [recName, setRecName] = useState('');
  const [company, setCompany] = useState('');
  const [recRole, setRecRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [hiringInterests, setHiringInterests] = useState<string[]>([]);
  const [website, setWebsite] = useState('');

  const totalSteps = role === 'student' ? 3 : 2;

  function toggleItem(list: string[], setList: (l: string[]) => void, item: string) {
    if (list.includes(item)) setList(list.filter(x => x !== item));
    else setList([...list, item]);
  }

  async function finish() {
    setSaving(true);
    if (role === 'student') {
      const profile: StudentProfile = {
        userId: uid,
        name: sanitizeString(name),
        avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1&textColor=ffffff`,
        banner: '',
        bio: sanitizeString(bio),
        college: sanitizeString(college),
        branch: sanitizeString(branch),
        year: parseInt(year),
        skills, domains,
        github: sanitizeString(github),
        linkedin: sanitizeString(linkedin),
        portfolio: '', resume: '', certificates: [], achievements: [],
        badges: ['early-adopter'],
        followers: [], following: [], bookmarks: [],
        profileViews: 0, isProfileComplete: true, agreeToTerms: true,
      };
      StudentStore.save(profile);
    } else if (role === 'recruiter') {
      const profile: RecruiterProfile = {
        userId: uid,
        name: sanitizeString(recName),
        company: sanitizeString(company),
        logo: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(company)}&backgroundColor=18181b&textColor=ffffff`,
        industry: sanitizeString(industry),
        role: sanitizeString(recRole),
        hiringInterests,
        description: '',
        website: sanitizeString(website),
        linkedin: '',
        savedCandidates: [], shortlisted: [], contactedStudents: [],
      };
      RecruiterStore.save(profile);
    }
    refreshProfile();
    setSaving(false);
    router.push(role === 'recruiter' ? '/recruiter' : '/dashboard');
  }

  if (role === 'student') return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Layers size={20} strokeWidth={2.5} /><span>IdeaForge</span></Link>
        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <p className={styles.stepLabel}>Step {step} of {totalSteps}</p>

        {step === 1 && (
          <>
            <h1 className={styles.heading}>Tell us about yourself</h1>
            <div className="field"><label className="label" htmlFor="ob-name">Full name</label>
              <input id="ob-name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Aryan Mehta" maxLength={100} />
            </div>
            <div className="field"><label className="label" htmlFor="ob-college">College</label>
              <input id="ob-college" className="input" value={college} onChange={e => setCollege(e.target.value)} placeholder="IIT Bombay" maxLength={200} />
            </div>
            <div className={styles.row2}>
              <div className="field"><label className="label" htmlFor="ob-branch">Branch</label>
                <input id="ob-branch" className="input" value={branch} onChange={e => setBranch(e.target.value)} placeholder="Computer Science" maxLength={100} />
              </div>
              <div className="field"><label className="label" htmlFor="ob-year">Year</label>
                <select id="ob-year" className="select" value={year} onChange={e => setYear(e.target.value)}>
                  {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label className="label" htmlFor="ob-bio">Short bio</label>
              <textarea id="ob-bio" className="textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="What are you working on? What kind of projects do you enjoy?" maxLength={500} rows={3} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(2)} disabled={!name || !college}>
              Next <ArrowRight size={16} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.heading}>What do you know how to build?</h1>
            <p className={styles.hint}>Pick the skills you're comfortable with. You can update this any time.</p>
            <div className={styles.chipGrid}>
              {SKILLS.map(s => (
                <button key={s} type="button"
                  className={`${styles.pickChip} ${skills.includes(s) ? styles.pickChipActive : ''}`}
                  onClick={() => toggleItem(skills, setSkills, s)}>{s}</button>
              ))}
            </div>
            <div className={styles.navRow}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} />Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next <ArrowRight size={16} /></button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className={styles.heading}>What domains interest you?</h1>
            <div className={styles.chipGrid}>
              {DOMAINS.map(d => (
                <button key={d} type="button"
                  className={`${styles.pickChip} ${domains.includes(d) ? styles.pickChipActive : ''}`}
                  onClick={() => toggleItem(domains, setDomains, d)}>{d}</button>
              ))}
            </div>
            <div className="field" style={{ marginTop: 'var(--space-4)' }}><label className="label" htmlFor="ob-github">GitHub URL (optional)</label>
              <input id="ob-github" className="input" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/yourhandle" />
            </div>
            <div className="field"><label className="label" htmlFor="ob-linkedin">LinkedIn URL (optional)</label>
              <input id="ob-linkedin" className="input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourhandle" />
            </div>
            <div className={styles.navRow}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}><ArrowLeft size={16} />Back</button>
              <button className="btn btn-primary" onClick={finish} disabled={saving}>
                {saving ? 'Saving…' : 'Finish setup'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Recruiter onboarding
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Layers size={20} strokeWidth={2.5} /><span>IdeaForge</span></Link>
        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <p className={styles.stepLabel}>Step {step} of {totalSteps}</p>

        {step === 1 && (
          <>
            <h1 className={styles.heading}>Your company details</h1>
            <div className="field"><label className="label" htmlFor="rc-name">Your name</label>
              <input id="rc-name" className="input" value={recName} onChange={e => setRecName(e.target.value)} placeholder="Neha Kapoor" maxLength={100} />
            </div>
            <div className="field"><label className="label" htmlFor="rc-company">Company</label>
              <input id="rc-company" className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Razorpay" maxLength={200} />
            </div>
            <div className="field"><label className="label" htmlFor="rc-role">Your role</label>
              <input id="rc-role" className="input" value={recRole} onChange={e => setRecRole(e.target.value)} placeholder="Engineering Recruiter" maxLength={100} />
            </div>
            <div className="field"><label className="label" htmlFor="rc-industry">Industry</label>
              <select id="rc-industry" className="select" value={industry} onChange={e => setIndustry(e.target.value)}>
                <option value="">Select industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="field"><label className="label" htmlFor="rc-website">Company website (optional)</label>
              <input id="rc-website" className="input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://razorpay.com" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(2)} disabled={!recName || !company}>
              Next <ArrowRight size={16} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.heading}>What kind of talent are you looking for?</h1>
            <div className={styles.chipGrid}>
              {SKILLS.map(s => (
                <button key={s} type="button"
                  className={`${styles.pickChip} ${hiringInterests.includes(s) ? styles.pickChipActive : ''}`}
                  onClick={() => toggleItem(hiringInterests, setHiringInterests, s)}>{s}</button>
              ))}
            </div>
            <div className={styles.navRow}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} />Back</button>
              <button className="btn btn-primary" onClick={finish} disabled={saving}>
                {saving ? 'Saving…' : 'Go to dashboard'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <Suspense><OnboardingForm /></Suspense>;
}
