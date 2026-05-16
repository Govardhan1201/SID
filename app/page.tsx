'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProjectCard from '@/components/cards/ProjectCard';
import IdeaCard from '@/components/cards/IdeaCard';
import StudentCard from '@/components/cards/StudentCard';
import { ProjectStore, IdeaStore, StudentStore, UserStore } from '@/lib/store';
import { isSeeded } from '@/lib/store';
import { seedDatabase } from '@/lib/seed';
import type { Project, Idea, StudentProfile } from '@/types';
import { ArrowRight, Search, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  const [projects, setProjects]  = useState<Project[]>([]);
  const [ideas, setIdeas]        = useState<Idea[]>([]);
  const [students, setStudents]  = useState<StudentProfile[]>([]);
  const [query, setQuery]        = useState('');
  const [ready, setReady]        = useState(false);

  useEffect(() => {
    async function load() {
      if (!isSeeded()) await seedDatabase();
      setProjects(ProjectStore.getPublic().filter(p => p.isFeatured).slice(0, 3));
      setIdeas(IdeaStore.getPublic().filter(i => i.isFeatured).slice(0, 3));
      setStudents(StudentStore.getAll().slice(0, 4));
      setReady(true);
    }
    load();
  }, []);

  // Live platform numbers from seed data
  const totalStudents  = UserStore.getAll().filter(u => u.role === 'student').length;
  const totalProjects  = ProjectStore.getAll().filter(p => p.status === 'published').length;
  const totalIdeas     = IdeaStore.getAll().filter(i => i.status === 'published').length;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) window.location.href = `/explore?q=${encodeURIComponent(query.trim())}`;
  }

  return (
    <div className="page">
      <Navbar />

      <main className="main">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className="container container--narrow">
            <div className={styles.heroLabel}>
              <span className="badge badge-primary">Now live in beta</span>
            </div>

            <h1 className={styles.heroTitle}>
              The place where engineering students<br />show what they actually built.
            </h1>

            <p className={styles.heroBody}>
              IdeaForge is a portfolio and talent platform for students who build things.
              Upload your hackathon project or ideathon idea, keep it organized with a real submission form,
              and let recruiters or teammates find you based on your actual work — not just your resume.
            </p>

            <form onSubmit={handleSearch} className={styles.searchForm} role="search">
              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  id="hero-search"
                  type="search"
                  className={styles.searchInput}
                  placeholder="Search projects, ideas, students, or tech stack…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  aria-label="Search IdeaForge"
                  maxLength={200}
                />
                <button type="submit" className="btn btn-primary btn-sm">Search</button>
              </div>
            </form>

            <div className={styles.heroCTAs}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Create your profile <ArrowRight size={16} />
              </Link>
              <Link href="/explore" className="btn btn-secondary btn-lg">
                Browse projects
              </Link>
            </div>
          </div>
        </section>

        {/* ── Numbers bar ──────────────────────────────────────────────────── */}
        <section className={styles.numbersBar}>
          <div className="container">
            <div className={styles.numbers}>
              <div className={styles.number}>
                <span className={styles.numberVal}>{ready ? totalStudents.toLocaleString() : '—'}</span>
                <span className={styles.numberLabel}>Students on platform</span>
              </div>
              <div className={styles.numberDivider} />
              <div className={styles.number}>
                <span className={styles.numberVal}>{ready ? totalProjects.toLocaleString() : '—'}</span>
                <span className={styles.numberLabel}>Projects submitted</span>
              </div>
              <div className={styles.numberDivider} />
              <div className={styles.number}>
                <span className={styles.numberVal}>{ready ? totalIdeas.toLocaleString() : '—'}</span>
                <span className={styles.numberLabel}>Ideas posted</span>
              </div>
              <div className={styles.numberDivider} />
              <div className={styles.number}>
                <span className={styles.numberVal}>4</span>
                <span className={styles.numberLabel}>Recruiters hiring</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <h2>How it works</h2>
              <p>
                Three kinds of people use IdeaForge. Here's what each of them gets.
              </p>
            </div>

            <div className={styles.howGrid}>
              {/* Students */}
              <div className={styles.roleBlock}>
                <div className={styles.roleTag}>For students</div>
                <h3>Submit once. Get discovered forever.</h3>
                <p>
                  Fill in a structured form for your hackathon project or ideathon idea — problem, solution,
                  tech stack, team, links, screenshots. It lives on a clean public page with your name on it.
                  Recruiters search by skill, domain, or college. Your work does the talking.
                </p>
                <ul className={styles.checkList}>
                  <li><CheckCircle size={15} /> Public project + idea pages</li>
                  <li><CheckCircle size={15} /> Draft, version history, edit anytime</li>
                  <li><CheckCircle size={15} /> Analytics on who viewed your work</li>
                  <li><CheckCircle size={15} /> Team creation and collaboration</li>
                </ul>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  Create student profile
                </Link>
              </div>

              {/* Recruiters */}
              <div className={styles.roleBlock}>
                <div className={styles.roleTag} style={{ color: 'var(--accent)', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
                  For recruiters
                </div>
                <h3>Find builders, not just candidates.</h3>
                <p>
                  Search students by what they've actually built. Filter by tech stack, domain, college,
                  or year. Every profile shows real projects with code links and demos.
                  Shortlist candidates and contact them through the platform messenger.
                </p>
                <ul className={styles.checkList}>
                  <li><CheckCircle size={15} /> Search by skills, tech, domain, college</li>
                  <li><CheckCircle size={15} /> See both public and unlisted work</li>
                  <li><CheckCircle size={15} /> Save shortlists and candidate notes</li>
                  <li><CheckCircle size={15} /> Contact students directly</li>
                </ul>
                <Link href="/signup?role=recruiter" className="btn btn-secondary btn-sm">
                  Join as recruiter
                </Link>
              </div>

              {/* Admin */}
              <div className={styles.roleBlock}>
                <div className={styles.roleTag} style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  For admins
                </div>
                <h3>Keep the platform worth using.</h3>
                <p>
                  Full content moderation queue, user management, featured content controls,
                  category and tag management, analytics dashboards, and audit logs.
                  Everything needed to run a healthy platform without constant fire-fighting.
                </p>
                <ul className={styles.checkList}>
                  <li><CheckCircle size={15} /> Moderation queue with approve/reject</li>
                  <li><CheckCircle size={15} /> Feature content on homepage</li>
                  <li><CheckCircle size={15} /> Platform-wide analytics</li>
                  <li><CheckCircle size={15} /> User management + audit log</li>
                </ul>
                <Link href="/login" className="btn btn-secondary btn-sm">
                  Admin login
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured projects ─────────────────────────────────────────────── */}
        {ready && projects.length > 0 && (
          <section className={`section ${styles.darkSection}`}>
            <div className="container">
              <div className={styles.sectionHead}>
                <h2>Featured projects this week</h2>
                <Link href="/explore" className={styles.viewAll}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid-3">
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── Top ideas ─────────────────────────────────────────────────────── */}
        {ready && ideas.length > 0 && (
          <section className="section">
            <div className="container">
              <div className={styles.sectionHead}>
                <h2>Ideas looking for collaborators</h2>
                <Link href="/explore?tab=ideas" className={styles.viewAll}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid-3">
                {ideas.map(i => <IdeaCard key={i.id} idea={i} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── Student profiles ──────────────────────────────────────────────── */}
        {ready && students.length > 0 && (
          <section className={`section ${styles.darkSection}`}>
            <div className="container">
              <div className={styles.sectionHead}>
                <h2>Builders on the platform</h2>
                <Link href="/explore?tab=students" className={styles.viewAll}>
                  Browse all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid-4">
                {students.map(s => <StudentCard key={s.userId} profile={s} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="section">
          <div className="container container--narrow">
            <div className={styles.cta}>
              <h2>Your project deserves a proper home.</h2>
              <p>
                That hackathon repo sitting on GitHub with no README, no demo, and no one looking at it —
                give it a page that actually explains what you built and why it matters.
                Takes about 15 minutes to submit.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Get started — it's free
                </Link>
                <Link href="/explore" className="btn btn-ghost btn-lg">
                  See what others built
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
