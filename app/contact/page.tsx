import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-8)' }}>Contact Us</h1>
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-2)' }}>
            <p style={{ marginBottom: 'var(--space-4)' }}>Have questions, feedback, or need support? We're here to help.</p>
            <p style={{ marginBottom: 'var(--space-4)' }}>Email us directly at: <strong>support@ideaforge.com</strong></p>
            <p>For urgent inquiries or business partnerships, you can reach out via LinkedIn or X from the links in our footer.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
