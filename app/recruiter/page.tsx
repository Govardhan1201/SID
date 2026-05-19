'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { getAllStudentProfiles, updateRecruiterProfile } from '@/app/actions/users';
import { getVisibleProjects } from '@/app/actions/projects';
import { getVisibleIdeas } from '@/app/actions/ideas';
import type { StudentProfile } from '@/types';
import StudentCard from '@/components/cards/StudentCard';
import { Search, Bookmark, User, LayoutDashboard, Settings, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import styles from './recruiter.module.css';

const SKILL_FILTERS = ['React','Node.js','Python','ML/AI','Flutter','Go','Rust','TypeScript','Django','Docker','Kubernetes','Blockchain','C++','Figma','SQL'];
const DOMAIN_FILTERS = ['AI/ML','Web Dev','Mobile','DevOps/Cloud','IoT/Hardware','Blockchain/Web3','Healthcare','Fintech','EdTech','SaaS','Cybersecurity'];

type RecTab = 'discover' | 'shortlist' | 'dashboard';

export default function RecruiterPage() {
  const { userId, role, recruiterProfile, isLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<RecTab>('dashboard');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [query, setQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalIdeas, setTotalIdeas] = useState(0);

  useEffect(() => {
    if (!isLoading && (!userId || role !== 'recruiter')) router.replace('/login');
  }, [userId, role, isLoading, router]);

  useEffect(() => {
    async function load() {
      const s = await getAllStudentProfiles();
      setStudents(s as unknown as StudentProfile[]);
      if (recruiterProfile) setShortlist(recruiterProfile.shortlisted || []);

      const p = await getVisibleProjects('recruiter');
      setTotalProjects(p.length);
      const i = await getVisibleIdeas('recruiter');
      setTotalIdeas(i.length);
    }
    load();
  }, [recruiterProfile]);

  function filtered() {
    return students.filter(s => {
      const q = query.toLowerCase();
      const matchQ = !q || [s.name, s.college, s.branch, ...s.skills, ...s.domains].some(f => f.toLowerCase().includes(q));
      const matchSkill = !skillFilter || s.skills.some(sk => sk.toLowerCase().includes(skillFilter.toLowerCase()));
      const matchDomain = !domainFilter || s.domains.some(d => d.toLowerCase().includes(domainFilter.toLowerCase()));
      return matchQ && matchSkill && matchDomain;
    });
  }

  async function toggleShortlist(uid: string) {
    if (!userId || !recruiterProfile) return;
    const next = shortlist.includes(uid) ? shortlist.filter(x => x !== uid) : [...shortlist, uid];
    setShortlist(next);
    await updateRecruiterProfile(userId, { shortlisted: next });
    refreshProfile();
  }

  const shortlisted = students.filter(s => shortlist.includes(s.userId));

  if (isLoading || !recruiterProfile) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.recCard}>
                <img src={recruiterProfile.logo} alt={recruiterProfile.company} className="avatar avatar-lg" />
                <div>
                  <p className={styles.recName}>{recruiterProfile.name}</p>
                  <p className={styles.recSub}>{recruiterProfile.role}</p>
                  <p className={styles.recSub}>{recruiterProfile.company}</p>
                </div>
              </div>
              {([['dashboard','Dashboard',<LayoutDashboard key="d" size={16}/>],
                ['discover','Discover Talent',<Search key="s" size={16}/>],
                ['shortlist',`Shortlist (${shortlist.length})`,<Bookmark key="b" size={16}/>]] as const).map(([t,label,icon])=>(
                <button key={t} className={`sidebar__item ${tab===t?'active':''}`} onClick={()=>setTab(t as RecTab)}>
                  {icon} {label}
                </button>
              ))}
              <hr className="divider"/>
              <Link href="/settings" className="sidebar__item"><Settings size={16}/> Settings</Link>
            </aside>

            {/* Content */}
            <div className={styles.content}>

              {/* ── Dashboard tab ── */}
              {tab === 'dashboard' && (
                <>
                  <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Recruiter Dashboard</h1>
                    <button className="btn btn-primary btn-sm" onClick={() => setTab('discover')}>
                      Discover talent <ArrowRight size={14}/>
                    </button>
                  </div>

                  <div className="grid-4">
                    <div className="stat-card"><p className="stat-card__label">Students</p><p className="stat-card__value">{students.length}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Projects</p><p className="stat-card__value">{totalProjects}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Ideas</p><p className="stat-card__value">{totalIdeas}</p></div>
                    <div className="stat-card"><p className="stat-card__label">Shortlisted</p><p className="stat-card__value">{shortlist.length}</p></div>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Your shortlist</h2>
                    {shortlisted.length === 0
                      ? <div className="empty-state" style={{padding:'var(--space-8) 0'}}><Bookmark size={32}/><p className="empty-state__title">No candidates shortlisted yet</p><button className="btn btn-primary btn-sm" onClick={()=>setTab('discover')}>Start discovering</button></div>
                      : <div className="grid-3">{shortlisted.map(s=><StudentCard key={s.userId} profile={s}/>)}</div>
                    }
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Top active students</h2>
                    <div className="grid-3">
                      {students.sort((a,b)=>b.profileViews-a.profileViews).slice(0,3).map(s=><StudentCard key={s.userId} profile={s}/>)}
                    </div>
                  </div>
                </>
              )}

              {/* ── Discover tab ── */}
              {tab === 'discover' && (
                <>
                  <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Discover Talent</h1>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(f=>!f)}>
                      <SlidersHorizontal size={14}/> Filters
                    </button>
                  </div>

                  <div className={styles.searchRow}>
                    <div className={styles.searchWrap}>
                      <Search size={15} className={styles.searchIcon}/>
                      <input type="search" className={styles.searchInput} placeholder="Search by name, college, skill, domain…"
                        value={query} onChange={e=>setQuery(e.target.value)} maxLength={200}/>
                      {query && <button className={styles.clearBtn} onClick={()=>setQuery('')}><X size={14}/></button>}
                    </div>
                  </div>

                  {showFilters && (
                    <div className={styles.filterArea}>
                      <div>
                        <p className={styles.filterLabel}>Skill</p>
                        <div className={styles.filterChips}>
                          <button className={`${styles.fChip} ${!skillFilter?styles.fChipActive:''}`} onClick={()=>setSkillFilter('')}>All</button>
                          {SKILL_FILTERS.map(s=><button key={s} className={`${styles.fChip} ${skillFilter===s?styles.fChipActive:''}`} onClick={()=>setSkillFilter(skillFilter===s?'':s)}>{s}</button>)}
                        </div>
                      </div>
                      <div>
                        <p className={styles.filterLabel}>Domain</p>
                        <div className={styles.filterChips}>
                          <button className={`${styles.fChip} ${!domainFilter?styles.fChipActive:''}`} onClick={()=>setDomainFilter('')}>All</button>
                          {DOMAIN_FILTERS.map(d=><button key={d} className={`${styles.fChip} ${domainFilter===d?styles.fChipActive:''}`} onClick={()=>setDomainFilter(domainFilter===d?'':d)}>{d}</button>)}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className={styles.resultCount}>{filtered().length} students found</p>

                  <div className="grid-3">
                    {filtered().map(s => (
                      <div key={s.userId} className={styles.studentWrap}>
                        <StudentCard profile={s}/>
                        <div className={styles.studentActions}>
                          <Link href={`/profile/${s.userId}`} className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center'}}>
                            <User size={13}/> View profile
                          </Link>
                          <button
                            className={`btn btn-sm ${shortlist.includes(s.userId)?'btn-primary':'btn-ghost'}`}
                            onClick={()=>toggleShortlist(s.userId)}
                          >
                            <Bookmark size={13} fill={shortlist.includes(s.userId)?'currentColor':'none'}/>
                            {shortlist.includes(s.userId)?'Shortlisted':'Shortlist'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Shortlist tab ── */}
              {tab === 'shortlist' && (
                <>
                  <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Shortlist</h1>
                  </div>
                  {shortlisted.length === 0
                    ? <div className="empty-state"><Bookmark size={40}/><p className="empty-state__title">No candidates shortlisted</p><button className="btn btn-primary btn-sm" onClick={()=>setTab('discover')}>Discover talent</button></div>
                    : (
                      <div className="grid-3">
                        {shortlisted.map(s=>(
                          <div key={s.userId} className={styles.studentWrap}>
                            <StudentCard profile={s}/>
                            <div className={styles.studentActions}>
                              <Link href={`/profile/${s.userId}`} className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center'}}><User size={13}/> Profile</Link>
                              <button className="btn btn-danger btn-sm" onClick={()=>toggleShortlist(s.userId)}>Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
