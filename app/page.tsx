'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getAllStudentProfiles } from '@/app/actions/users';
import { getVisibleProjects } from '@/app/actions/projects';
import { getVisibleIdeas } from '@/app/actions/ideas';
import {
  Layers, ArrowRight, Terminal, Code2, Users, Zap,
  GitBranch, Shield, Search, ChevronRight, Star, HelpCircle
} from 'lucide-react';
import styles from './page.module.css';

const DOMAINS = ['AI/ML','Web Dev','Mobile','DevOps/Cloud','IoT/Hardware','Blockchain/Web3','Healthcare','Fintech','EdTech','SaaS','Cybersecurity','AR/VR','Data Engineering','Social Impact'];

const TERMINAL_LINES = [
  { delay: 0,    text: '$ ideaforge init --platform student-innovation', type: 'cmd' },
  { delay: 800,  text: '✓ Connecting to talent discovery network...', type: 'ok' },
  { delay: 1600, text: '✓ Loading 1,240+ student projects', type: 'ok' },
  { delay: 2400, text: '✓ Indexing ideas, teams, and profiles', type: 'ok' },
  { delay: 3200, text: '→ Platform ready. 47 recruiters online.', type: 'info' },
];

const FEATURES = [
  {
    icon: <Code2 size={20} />,
    title: 'Showcase real projects',
    desc: 'Not a resume — a live portfolio. Share your GitHub, demo, problem statement, and impact metrics.',
  },
  {
    icon: <Zap size={20} />,
    title: 'Submit ideas',
    desc: 'Not built yet? Submit the concept. Get visibility, collaborators, and recruiter interest early.',
  },
  {
    icon: <Users size={20} />,
    title: 'Form teams',
    desc: 'Find students with complementary skills. Build together for hackathons, internships, and startups.',
  },
  {
    icon: <Search size={20} />,
    title: 'Get discovered',
    desc: 'Recruiters from top companies browse by skill, domain, and college. Your work speaks for itself.',
  },
  {
    icon: <GitBranch size={20} />,
    title: 'Track versions',
    desc: 'Every project update is versioned. Show progression from MVP to deployed product.',
  },
  {
    icon: <Shield size={20} />,
    title: 'Moderated quality',
    desc: 'Admin review ensures signal over noise. Featured projects get 5× more recruiter eyeballs.',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [visibleLines, setVisibleLines] = useState(0);
  const [stats, setStats] = useState({ students: 0, projects: 0, ideas: 0 });

  useEffect(() => {
    // Animate terminal lines
    TERMINAL_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });
    // Load real platform stats
    async function loadStats() {
      const [students, projects, ideas] = await Promise.all([
        getAllStudentProfiles(),
        getVisibleProjects('public'),
        getVisibleIdeas('public')
      ]);
      setStats({
        students: students.length,
        projects: projects.length,
        ideas: ideas.length,
      });
    }
    loadStats();
  }, []);

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <header className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/" className={styles.logo}>
            <Layers size={20} strokeWidth={2.5} />
            <span>IdeaForge</span>
          </Link>
          <div className={styles.navLinks}>
            <span className={styles.navStat}>
              <span className={styles.dot} />
              {stats.students} students online
            </span>
          </div>
          <div className={styles.navActions}>
            <Link href="/login"  className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.gridBg} aria-hidden />
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <Star size={11} />
                <span>Student Innovation Platform</span>
              </div>
              <h1 className={styles.heroTitle}>
                Where engineering<br />
                <span className={styles.heroAccent}>students ship</span><br />
                real products.
              </h1>
              <p className={styles.heroSub}>
                Showcase projects. Submit ideas. Form teams. Get discovered by top recruiters — all in one place.
              </p>
              <div className={styles.heroCta}>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Start building your profile <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg">
                  Sign in to explore
                </Link>
              </div>
              <p className={styles.heroNote}>
                Free for students. No credit card required.
              </p>
            </div>

            {/* Terminal window */}
            <div className={styles.terminal}>
              <div className={styles.terminalBar}>
                <span className={styles.dot1} />
                <span className={styles.dot2} />
                <span className={styles.dot3} />
                <span className={styles.terminalTitle}>ideaforge — zsh</span>
              </div>
              <div className={styles.terminalBody}>
                {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                  <div key={i} className={`${styles.termLine} ${styles[line.type]}`}>
                    {line.text}
                  </div>
                ))}
                {visibleLines < TERMINAL_LINES.length && (
                  <div className={styles.cursor} />
                )}
                {visibleLines >= TERMINAL_LINES.length && (
                  <div className={styles.termLine} style={{ marginTop: '12px' }}>
                    <span className={styles.termPrompt}>$</span>
                    <span className={styles.termBlinkCursor}>▋</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsInner}>
            {[
              { value: stats.students || '12', label: 'Students', suffix: '+' },
              { value: stats.projects || '8',  label: 'Projects', suffix: '+' },
              { value: stats.ideas    || '5',  label: 'Ideas',    suffix: '+' },
              { value: '4',  label: 'Recruiters', suffix: '+' },
            ].map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}{s.suffix}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className={styles.sectionLabel}>// platform.features</p>
            <h2 className={styles.sectionTitle}>Everything you need to get noticed</h2>
            <p className={styles.sectionSub}>Built for students who build. Not for students who just list courses on a resume.</p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Domain cloud ── */}
      <section className={styles.domains}>
        <div className="container">
          <p className={styles.sectionLabel}>// domains.available</p>
          <h2 className={styles.sectionTitle}>All verticals. One platform.</h2>
          <div className={styles.domainGrid}>
            {DOMAINS.map(d => (
              <div key={d} className={styles.domainTag}>
                <ChevronRight size={11} />
                {d}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For who ── */}
      <section className={styles.forWho}>
        <div className="container">
          <div className={styles.forWhoGrid}>
            <div className={styles.forWhoCard}>
              <div className={styles.forWhoLabel}>for students</div>
              <h3 className={styles.forWhoTitle}>Your work deserves a real showcase.</h3>
              <ul className={styles.forWhoList}>
                {['Submit projects with problem, solution, and impact','Share your idea even before you build it','Form a team and ship together','Get pinged by recruiters who actually care about what you built'].map(t => (
                  <li key={t}><ChevronRight size={13} className={styles.listIcon} />{t}</li>
                ))}
              </ul>
              <Link href="/signup?role=student" className="btn btn-primary">
                Join as a student <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.forWhoCard}>
              <div className={`${styles.forWhoLabel} ${styles.forWhoLabelAlt}`}>for recruiters</div>
              <h3 className={styles.forWhoTitle}>Stop filtering resumes. Start reading code.</h3>
              <ul className={styles.forWhoList}>
                {['Browse real projects by domain, skill, or college','See GitHub, demo links, and actual impact metrics','Shortlist candidates and reach out directly','Discover students before they start applying anywhere'].map(t => (
                  <li key={t}><ChevronRight size={13} className={styles.listIcon} />{t}</li>
                ))}
              </ul>
              <Link href="/signup?role=recruiter" className="btn btn-accent">
                Join as a recruiter <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow} aria-hidden />
            <p className={styles.ctaLabel}>// get.started</p>
            <h2 className={styles.ctaTitle}>Start building your public presence today.</h2>
            <p className={styles.ctaSub}>Join hundreds of students already on the platform. Free forever.</p>
            <div className={styles.ctaActions}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Create your account <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerLogo}>
              <Layers size={16} strokeWidth={2.5} />
              <span>IdeaForge</span>
            </div>
            <p className={styles.footerNote}>Built for students who build.</p>
            <div className={styles.footerLinks}>
              <Link href="/login">Sign in</Link>
              <Link href="/signup">Get started</Link>
            </div>
            <div className={styles.footerLinks}>
              <a href="https://github.com/Govardhan1201" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://x.com/Govardhan1201" target="_blank" rel="noopener noreferrer">X</a>
              <a href="https://www.linkedin.com/in/govardhan1201" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} IdeaForge. All rights reserved.</p>
        </div>
      </footer>

      {/* How it Works FAB — shown to unauthenticated users so they know what the platform does */}
      {!isAuthenticated && (
        <Link
          href="/how-it-works"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0, 242, 254, 0.4)',
            zIndex: 999,
            transition: 'transform 0.2s, box-shadow 0.2s',
            color: '#000',
          }}
          title="How it Works"
          aria-label="How it works"
        >
          <HelpCircle size={24} />
        </Link>
      )}
    </div>
  );
}
