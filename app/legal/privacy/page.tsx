import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-1)]">
      <Navbar />
      <main className="max-w-[800px] mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-[var(--text-1)] mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert">
          <p className="text-[var(--text-2)] mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-[var(--text-2)] mb-4">
            We collect information you provide directly to us when you create an account, participate in hackathons, or use our platform. This includes your name, email address, educational background, and project submissions.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-[var(--text-2)] mb-4">
            We use the information we collect to operate our platform, facilitate hackathon management, connect students with recruiters, and improve our services.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">3. Data Sharing</h2>
          <p className="text-[var(--text-2)] mb-4">
            Your public profile and project submissions may be visible to other users and recruiters on the platform. We do not sell your personal data to third parties.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">4. Cookies</h2>
          <p className="text-[var(--text-2)] mb-4">
            We use cookies to maintain your session securely and analyze platform usage. You can control cookie preferences through your browser settings.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
