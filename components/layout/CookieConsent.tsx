'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('if_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('if_cookie_consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[var(--bg-2)] border-t border-[var(--border)] p-4 shadow-lg z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-[var(--text-2)] max-w-4xl">
        We use cookies to improve your experience, securely manage your session, and analyze platform usage. By continuing to use IdeaForge, you agree to our{' '}
        <Link href="/legal/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link> and{' '}
        <Link href="/legal/terms" className="text-[var(--primary)] hover:underline">Terms of Service</Link>.
      </div>
      <button 
        onClick={handleAccept}
        className="px-6 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:bg-[var(--primary-light)] transition-colors whitespace-nowrap"
      >
        Accept & Continue
      </button>
    </div>
  );
}
