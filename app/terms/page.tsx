import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-8)' }}>Terms of Service</h1>
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-2)' }}>
            <p style={{ marginBottom: 'var(--space-4)' }}>By using IdeaForge, you agree to these Terms of Service. Please read them carefully.</p>
            <h2 style={{ color: 'var(--text-1)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>1. Use of the Platform</h2>
            <p style={{ marginBottom: 'var(--space-4)' }}>You agree to use IdeaForge only for lawful purposes. You must not use the platform to distribute harmful content or harass others.</p>
            <h2 style={{ color: 'var(--text-1)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>2. User Content</h2>
            <p style={{ marginBottom: 'var(--space-4)' }}>You retain ownership of any projects or ideas you submit. By submitting, you grant us a license to display and share your content on the platform.</p>
            <h2 style={{ color: 'var(--text-1)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>3. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
