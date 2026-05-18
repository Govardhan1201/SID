'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { updateStudentProfile, updateRecruiterProfile } from '@/app/actions/users';
import { sanitizeString, isValidUrl } from '@/lib/security';
import type { StudentProfile, RecruiterProfile } from '@/types';
import { User, Building, GitFork, Link2, Globe, Save } from 'lucide-react';
import styles from './settings.module.css';

const SKILLS = ['React','Node.js','Python','ML/AI','Flutter','Java','Go','Rust','TypeScript','Vue.js','Django','Docker','Kubernetes','AWS','Blockchain','Solidity','C++','Arduino','Unity','Figma','SQL','MongoDB','Redis','GraphQL','Next.js'];
const DOMAINS = ['AI/ML','Web Dev','Mobile','DevOps/Cloud','IoT/Hardware','Blockchain/Web3','Healthcare','Fintech','EdTech','SaaS','Cybersecurity','AR/VR','Data Engineering','Social Impact'];

export default function SettingsPage() {
  const { userId, role, studentProfile, recruiterProfile, refreshProfile, isLoading } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'profile' | 'account'>('profile');

  // Student fields
  const [name, setName]         = useState('');
  const [bio, setBio]           = useState('');
  const [college, setCollege]   = useState('');
  const [branch, setBranch]     = useState('');
  const [year, setYear]         = useState('');
  const [github, setGithub]     = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [skills, setSkills]     = useState<string[]>([]);
  const [domains, setDomains]   = useState<string[]>([]);

  // Recruiter fields
  const [recName, setRecName]   = useState('');
  const [company, setCompany]   = useState('');
  const [recRole, setRecRole]   = useState('');
  const [website, setWebsite]   = useState('');
  const [description, setDesc]  = useState('');
  const [hiringInterests, setHI] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !userId) router.replace('/login');
    if (studentProfile) {
      setName(studentProfile.name); setBio(studentProfile.bio);
      setCollege(studentProfile.college); setBranch(studentProfile.branch);
      setYear(String(studentProfile.year)); setGithub(studentProfile.github);
      setLinkedin(studentProfile.linkedin); setPortfolio(studentProfile.portfolio);
      setSkills(studentProfile.skills); setDomains(studentProfile.domains);
    }
    if (recruiterProfile) {
      setRecName(recruiterProfile.name); setCompany(recruiterProfile.company);
      setRecRole(recruiterProfile.role); setWebsite(recruiterProfile.website);
      setDesc(recruiterProfile.description); setHI(recruiterProfile.hiringInterests);
    }
  }, [isLoading, userId, studentProfile, recruiterProfile, router]);

  function toggle(list: string[], setList: (l: string[]) => void, item: string) {
    if (list.includes(item)) setList(list.filter(x => x !== item));
    else setList([...list, item]);
  }

  async function saveProfile() {
    if (!userId) return;
    if (role === 'student' && studentProfile) {
      const p = {
        ...studentProfile,
        name: sanitizeString(name), bio: sanitizeString(bio),
        college: sanitizeString(college), branch: sanitizeString(branch),
        year: parseInt(year) || studentProfile.year,
        github: sanitizeString(github), linkedin: sanitizeString(linkedin),
        portfolio: sanitizeString(portfolio), skills, domains,
      };
      await updateStudentProfile(userId, p);
    }
    if (role === 'recruiter' && recruiterProfile) {
      const p = {
        ...recruiterProfile,
        name: sanitizeString(recName), company: sanitizeString(company),
        role: sanitizeString(recRole), website: sanitizeString(website),
        description: sanitizeString(description), hiringInterests,
      };
      await updateRecruiterProfile(userId, p);
    }
    refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <h1 className={styles.pageTitle}>Settings</h1>

          <div className="tabs" style={{ marginBottom: 'var(--space-8)' }}>
            <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
            <button className={`tab-btn ${tab === 'account' ? 'active' : ''}`} onClick={() => setTab('account')}>Account</button>
          </div>

          {tab === 'profile' && (
            <div className={styles.layout}>
              <div className={styles.form}>
                {role === 'student' && (
                  <>
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}><User size={16} /> Personal info</h2>
                      <div className="field"><label className="label" htmlFor="s-name">Full name</label>
                        <input id="s-name" className="input" value={name} onChange={e => setName(e.target.value)} maxLength={100} /></div>
                      <div className="field"><label className="label" htmlFor="s-bio">Bio</label>
                        <textarea id="s-bio" className="textarea" rows={3} value={bio} onChange={e => setBio(e.target.value)} maxLength={500} placeholder="What are you working on?" /></div>
                      <div className={styles.row2}>
                        <div className="field"><label className="label" htmlFor="s-college">College</label>
                          <input id="s-college" className="input" value={college} onChange={e => setCollege(e.target.value)} maxLength={200} /></div>
                        <div className="field"><label className="label" htmlFor="s-branch">Branch</label>
                          <input id="s-branch" className="input" value={branch} onChange={e => setBranch(e.target.value)} maxLength={100} /></div>
                      </div>
                      <div className="field"><label className="label" htmlFor="s-year">Year</label>
                        <select id="s-year" className="select" value={year} onChange={e => setYear(e.target.value)}>
                          {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Links</h2>
                      <div className="field"><label className="label" htmlFor="s-github"><GitFork size={13} /> GitHub URL</label>
                        <input id="s-github" className="input" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/…" /></div>
                      <div className="field"><label className="label" htmlFor="s-linkedin"><Link2 size={13} /> LinkedIn URL</label>
                        <input id="s-linkedin" className="input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
                      <div className="field"><label className="label" htmlFor="s-portfolio"><Globe size={13} /> Portfolio URL</label>
                        <input id="s-portfolio" className="input" value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://yoursite.com" /></div>
                    </div>

                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Skills</h2>
                      <div className={styles.chipGrid}>
                        {SKILLS.map(s => (
                          <button key={s} type="button"
                            className={`${styles.pickChip} ${skills.includes(s) ? styles.pickChipActive : ''}`}
                            onClick={() => toggle(skills, setSkills, s)}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Domains of interest</h2>
                      <div className={styles.chipGrid}>
                        {DOMAINS.map(d => (
                          <button key={d} type="button"
                            className={`${styles.pickChip} ${domains.includes(d) ? styles.pickChipActive : ''}`}
                            onClick={() => toggle(domains, setDomains, d)}>{d}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {role === 'recruiter' && (
                  <>
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}><Building size={16} /> Company info</h2>
                      <div className="field"><label className="label" htmlFor="r-name">Your name</label>
                        <input id="r-name" className="input" value={recName} onChange={e => setRecName(e.target.value)} maxLength={100} /></div>
                      <div className="field"><label className="label" htmlFor="r-company">Company</label>
                        <input id="r-company" className="input" value={company} onChange={e => setCompany(e.target.value)} maxLength={200} /></div>
                      <div className="field"><label className="label" htmlFor="r-role">Your role</label>
                        <input id="r-role" className="input" value={recRole} onChange={e => setRecRole(e.target.value)} maxLength={100} /></div>
                      <div className="field"><label className="label" htmlFor="r-website">Company website</label>
                        <input id="r-website" className="input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://…" /></div>
                      <div className="field"><label className="label" htmlFor="r-desc">Company description</label>
                        <textarea id="r-desc" className="textarea" rows={3} value={description} onChange={e => setDesc(e.target.value)} maxLength={500} /></div>
                    </div>
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Hiring interests</h2>
                      <div className={styles.chipGrid}>
                        {SKILLS.map(s => (
                          <button key={s} type="button"
                            className={`${styles.pickChip} ${hiringInterests.includes(s) ? styles.pickChipActive : ''}`}
                            onClick={() => toggle(hiringInterests, setHI, s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.saveRow}>
                  <button className="btn btn-primary" onClick={saveProfile}>
                    <Save size={14} /> {saved ? 'Saved!' : 'Save changes'}
                  </button>
                  {saved && <span className={styles.savedMsg}>Changes saved successfully.</span>}
                </div>
              </div>
            </div>
          )}

          {tab === 'account' && (
            <div className={styles.accountSection}>
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h2 className={styles.sectionTitle}>Account details</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)' }}>Role: <strong style={{ color: 'var(--text-1)' }}>{role}</strong></p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginTop: 'var(--space-2)' }}>Password changes and two-factor authentication are coming soon.</p>
              </div>
              <div className="card" style={{ padding: 'var(--space-6)', borderColor: 'rgba(239,68,68,0.3)' }}>
                <h2 className={styles.sectionTitle} style={{ color: 'var(--danger)' }}>Danger zone</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginBottom: 'var(--space-4)' }}>Deleting your account is permanent and cannot be undone.</p>
                <button className="btn btn-danger btn-sm" onClick={() => alert('Account deletion is disabled in demo mode.')}>Delete my account</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
