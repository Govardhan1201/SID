import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { Lightbulb, Code, Users, Rocket, Target, ShieldCheck } from 'lucide-react';
import styles from './HowItWorks.module.css';

export default function HowItWorksPage() {
  return (
    <div className="page">
      <Navbar />
      <main className="main" style={{ background: 'var(--bg-1)' }}>
        
        {/* HERO SECTION */}
        <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ paddingTop: 'var(--space-24)', paddingBottom: 'var(--space-24)', textAlign: 'center', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: 'var(--space-6)', letterSpacing: '-0.02em' }}>IdeaForge User Manual</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              A step-by-step guide to mastering IdeaForge. Whether you're a student looking to build, or a recruiter searching for talent, learn how to leverage the platform to its fullest.
            </p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-32)' }}>
          
          {/* SECTION 1: FOR STUDENTS */}
          <section className="mb-24">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)' }}><Code size={14} /> For Students & Builders</span>
              <h2 style={{ fontSize: '2.5rem' }}>Your Journey Starts Here</h2>
            </div>

            <div className={styles.stepGrid}>
              
              {/* Step 1 */}
              <div className={styles.stepRow}>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Create Your Developer Profile</h3>
                  <p>Your profile is your digital resume. Add your GitHub, LinkedIn, technical skills, and domains of interest.</p>
                  <ul>
                    <li>Upload an avatar and cover image.</li>
                    <li>List all the programming languages and tools you know.</li>
                    <li>Add a short bio to let others know what you love building.</li>
                  </ul>
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
                  <ul>
                    <li>Go to the Explore page to discover trending ideas.</li>
                    <li>Submit your own projects with a live demo link and tech stack tags.</li>
                    <li>Bookmark projects for inspiration.</li>
                  </ul>
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
                  <ul>
                    <li>Browse the Student directory to find designers, frontend devs, or backend engineers.</li>
                    <li>Create an open team or set it to 'Invite Only'.</li>
                    <li>Send join requests to existing open teams.</li>
                  </ul>
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
                  <ul>
                    <li>View live announcements and countdowns.</li>
                    <li>Submit your project repository and video presentation.</li>
                    <li>View final standings and win awards!</li>
                  </ul>
                </div>
                <div className={styles.stepImageWrapper}>
                  <Image src="/manual/manual_hackathon_page_1779271624175.png" alt="Hackathon Detail Page" width={800} height={450} className={styles.stepImage} />
                </div>
              </div>

            </div>
          </section>

          <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-16) 0' }} />

          {/* SECTION 2: FOR RECRUITERS */}
          <section className="mb-24">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <span className="badge badge-success" style={{ marginBottom: 'var(--space-4)' }}><Target size={14} /> For Recruiters & Talent Hunters</span>
              <h2 style={{ fontSize: '2.5rem' }}>Discover Top Talent</h2>
            </div>

            <div className={styles.stepGrid}>
              <div className={styles.stepRow}>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Browse Validated Portfolios</h3>
                  <p>Instead of relying on resumes, see what students have actually built.</p>
                  <ul>
                    <li>Search candidates by specific tech stacks (e.g., React, Go, Machine Learning).</li>
                    <li>View a candidate's match score based on your hiring requirements.</li>
                    <li>Click 'Shortlist' to save candidates to your CRM for future outreach.</li>
                  </ul>
                </div>
                <div className={styles.stepImageWrapper}>
                  <Image src="/manual/manual_recruiter_view_1779272147938.png" alt="Recruiter Talent Discovery View" width={800} height={450} className={styles.stepImage} />
                </div>
              </div>
            </div>
          </section>

          <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-16) 0' }} />

          {/* FINAL CTA */}
          <div style={{ textAlign: 'center', background: 'var(--bg-2)', padding: 'var(--space-16)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>Ready to start building?</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 'var(--space-8)' }}>Join thousands of students and recruiters already on the platform.</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <Link href="/signup" className="btn btn-primary btn-lg">Create an Account</Link>
              <Link href="/explore" className="btn btn-secondary btn-lg">Explore Projects</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
