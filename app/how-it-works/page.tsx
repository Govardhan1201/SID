import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Lightbulb, Code, Users, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)', maxWidth: '900px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)', textAlign: 'center' }}>How IdeaForge Works</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-2)', textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            From sparking an idea to shipping a product, IdeaForge gives you the tools to succeed.
          </p>

          <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
            <div className="card" style={{ padding: 'var(--space-8)', display: 'flex', gap: 'var(--space-6)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lightbulb size={32} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>1. Share Your Ideas</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Pitch your innovative concepts to the community. Get feedback, attract potential collaborators, and validate your thoughts before writing a single line of code.</p>
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-8)', display: 'flex', gap: 'var(--space-6)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={32} color="var(--success)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>2. Form a Team</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Browse student profiles to find the perfect co-founders. Filter by skills, domains, and interests. Form teams seamlessly and start collaborating on your projects.</p>
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-8)', display: 'flex', gap: 'var(--space-6)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--warning-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Code size={32} color="var(--warning)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>3. Participate in Hackathons</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Register for upcoming hackathons hosted by organizers right here on IdeaForge. Build under pressure, get mentorship, and compete for prizes.</p>
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-8)', display: 'flex', gap: 'var(--space-6)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Rocket size={32} color="var(--danger)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>4. Launch & Showcase</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Publish your finished projects to your portfolio. Recruiters and the community can view your work, try out your demos, and appreciate your technical skills.</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-16)', textAlign: 'center' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">Get Started Now</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
