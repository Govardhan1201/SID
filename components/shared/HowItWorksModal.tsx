'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Code, Target, X } from 'lucide-react';
import styles from '@/app/how-it-works/HowItWorks.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        style={{
          position: 'relative', width: '100%', maxWidth: '900px', maxHeight: '90vh',
          background: 'var(--bg-1)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: '50%', width: '36px', height: '36px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'var(--text-1)'
          }}
        >
          <X size={18} />
        </button>

        {/* Inner Content from original how-it-works page */}
        <div style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>IdeaForge User Manual</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-2)' }}>
              A step-by-step guide to mastering IdeaForge.
            </p>
          </div>

          {/* SECTION 1: FOR STUDENTS */}
          <section className="mb-24">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)' }}><Code size={14} /> For Students & Builders</span>
              <h2 style={{ fontSize: '2rem' }}>Your Journey Starts Here</h2>
            </div>

            <div className={styles.stepGrid}>
              
              {/* Step 1 */}
              <div className={styles.stepRow}>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Create Your Developer Profile</h3>
                  <p>Your profile is your digital resume. Add your GitHub, LinkedIn, technical skills, and domains of interest.</p>
                </div>
                <div className={styles.stepImageWrapper}>
                  <Image src="/manual/manual_profile_creation_1779271391839.png" alt="Profile Creation UI" width={800} height={450} className={styles.stepImage} />
                </div>
              </div>

              {/* Step 2 */}
              <div className={`${styles.stepRow} ${styles.stepRowReverse}`}>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>2</div>
                  <h3>Showcase Projects & Ideas</h3>
                  <p>Share what you've built or what you want to build. Gain visibility, likes, and feedback from the community.</p>
                </div>
                <div className={styles.stepImageWrapper}>
                  <Image src="/manual/manual_dashboard_projects_1779271489735.png" alt="Projects Dashboard" width={800} height={450} className={styles.stepImage} />
                </div>
              </div>

              {/* Step 3 */}
              <div className={styles.stepRow}>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>3</div>
                  <h3>Form Teams & Collaborate</h3>
                  <p>No more building alone. Find teammates with complementary skills to turn ideas into reality.</p>
                </div>
                <div className={styles.stepImageWrapper}>
                  <Image src="/manual/manual_team_formation_1779271586997.png" alt="Team Formation UI" width={800} height={450} className={styles.stepImage} />
                </div>
              </div>

              {/* Step 4 */}
              <div className={`${styles.stepRow} ${styles.stepRowReverse}`}>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>4</div>
                  <h3>Compete in Hackathons</h3>
                  <p>Put your skills to the test. Join hackathons hosted on IdeaForge, pick a track, and submit your team's project before the deadline.</p>
                </div>
                <div className={styles.stepImageWrapper}>
                  <Image src="/manual/manual_hackathon_page_1779271624175.png" alt="Hackathon Detail Page" width={800} height={450} className={styles.stepImage} />
                </div>
              </div>

            </div>
          </section>

          <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-12) 0' }} />

          {/* SECTION 2: FOR RECRUITERS */}
          <section className="mb-24">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <span className="badge badge-success" style={{ marginBottom: 'var(--space-4)' }}><Target size={14} /> For Recruiters & Talent Hunters</span>
              <h2 style={{ fontSize: '2rem' }}>Discover Top Talent</h2>
            </div>

            <div className={styles.stepGrid}>
              <div className={styles.stepRow}>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Browse Validated Portfolios</h3>
                  <p>Instead of relying on resumes, see what students have actually built.</p>
                </div>
                <div className={styles.stepImageWrapper}>
                  <Image src="/manual/manual_recruiter_view_1779272147938.png" alt="Recruiter Talent Discovery View" width={800} height={450} className={styles.stepImage} />
                </div>
              </div>
            </div>
          </section>

          <div style={{ textAlign: 'center', background: 'var(--bg-2)', padding: 'var(--space-12)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-4)' }}>Ready to start building?</h2>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <Link href="/signup" className="btn btn-primary" onClick={onClose}>Create an Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
