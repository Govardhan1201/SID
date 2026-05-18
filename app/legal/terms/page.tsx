import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--bg-1)]">
      <Navbar />
      <main className="max-w-[800px] mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-[var(--text-1)] mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert">
          <p className="text-[var(--text-2)] mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-[var(--text-2)] mb-4">
            By accessing or using IdeaForge, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">2. User Conduct</h2>
          <p className="text-[var(--text-2)] mb-4">
            You agree to use the platform only for lawful purposes. Harassment, plagiarism, or any form of cheating during hackathons is strictly prohibited and may result in account termination.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">3. Intellectual Property</h2>
          <p className="text-[var(--text-2)] mb-4">
            Users retain ownership of the projects they submit. By submitting a project, you grant IdeaForge a non-exclusive license to display the project on our platform.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-1)] mt-8 mb-4">4. Disclaimer of Warranties</h2>
          <p className="text-[var(--text-2)] mb-4">
            The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or that the platform will be error-free.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
