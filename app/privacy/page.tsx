import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-8)' }}>Privacy Policy</h1>
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-2)' }}>
            <p style={{ marginBottom: 'var(--space-4)' }}>Your privacy is important to us. This policy explains how we collect, use, and protect your data.</p>
            <h2 style={{ color: 'var(--text-1)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>1. Information We Collect</h2>
            <p style={{ marginBottom: 'var(--space-4)' }}>We collect information you provide directly, such as your name, email, and project details when you register or use the platform.</p>
            <h2 style={{ color: 'var(--text-1)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>2. How We Use Information</h2>
            <p style={{ marginBottom: 'var(--space-4)' }}>We use your data to operate the platform, connect you with teams, and improve our services. We do not sell your personal information.</p>
            <h2 style={{ color: 'var(--text-1)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>3. Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
