import Link from 'next/link';
import { Layers, GitFork, X, Link2 } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <Layers size={18} strokeWidth={2.5} />
            <span>IdeaForge</span>
          </Link>
          <p className={styles.tagline}>
            Where engineering students showcase what they built<br />and recruiters find who built it.
          </p>
          <div className={styles.social}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitFork size={16} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><X size={16} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Link2 size={16} /></a>
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Platform</h4>
            <Link href="/explore">Explore Projects</Link>
            <Link href="/explore?tab=ideas">Explore Ideas</Link>
            <Link href="/explore?tab=students">Find Students</Link>
            <Link href="/teams">Teams</Link>
          </div>
          <div className={styles.col}>
            <h4>For Students</h4>
            <Link href="/signup">Create Profile</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/projects/new">Submit Project</Link>
            <Link href="/dashboard/ideas/new">Submit Idea</Link>
          </div>
          <div className={styles.col}>
            <h4>For Recruiters</h4>
            <Link href="/signup?role=recruiter">Join as Recruiter</Link>
            <Link href="/recruiter">Talent Discovery</Link>
            <Link href="/recruiter/shortlist">My Shortlist</Link>
          </div>
          <div className={styles.col}>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} IdeaForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
