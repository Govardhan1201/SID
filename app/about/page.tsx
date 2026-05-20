import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-8)' }}>About IdeaForge</h1>
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-2)' }}>
            <p style={{ marginBottom: 'var(--space-4)' }}>IdeaForge is a platform built to empower students, creators, and innovators. We believe that great ideas shouldn't die in notebooks. They should be forged into reality.</p>
            <p style={{ marginBottom: 'var(--space-4)' }}>Our mission is to connect passionate builders with the right teams, provide visibility for their projects, and help organizers host seamless hackathons.</p>
            <p>Join us in shaping the future of innovation.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
