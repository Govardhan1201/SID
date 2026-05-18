'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Send, Bug, MessageSquare, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'govardhannagireddy1356@gmail.com',
          subject: `[IdeaForge ${type.toUpperCase()}] from ${email}`,
          html: `<p><strong>From:</strong> ${email}</p><p><strong>Type:</strong> ${type}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`
        })
      });

      if (res.ok) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-1)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-1)] mb-4">Contact Support</h1>
          <p className="text-[var(--text-2)] text-lg">Found a bug or need help? Send us a message.</p>
        </div>

        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-xl p-6 sm:p-8">
          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-1)] mb-2">Message Sent!</h3>
              <p className="text-[var(--text-2)] mb-6">We've received your request and will get back to you shortly.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Issue Type</label>
                  <select name="type" required className="w-full bg-[var(--bg-3)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-1)] outline-none focus:border-[var(--primary)] transition-colors">
                    <option value="bug">🐛 Report a Bug</option>
                    <option value="support">💬 General Support</option>
                    <option value="feedback">💡 Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Your Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="name@example.com"
                    className="w-full bg-[var(--bg-3)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-1)] outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Message</label>
                <textarea 
                  name="message" 
                  required 
                  rows={6}
                  placeholder="Please describe your issue or feedback in detail..."
                  className="w-full bg-[var(--bg-3)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-1)] outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white font-medium py-3 rounded-lg hover:bg-[var(--primary-light)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send size={18} /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
