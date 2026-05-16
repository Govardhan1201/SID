'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Layers, AlertCircle, CheckCircle } from 'lucide-react';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    // In a real app, this would call an API; here we simulate success
    setSent(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Layers size={20} strokeWidth={2.5} /><span>IdeaForge</span></Link>
        <h1 className={styles.heading}>Reset your password</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', lineHeight: 1.6 }}>
          Enter the email you signed up with. If it exists in our system, we'll send reset instructions.
        </p>

        {sent ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius)', padding: 'var(--space-4)', color: 'var(--success)' }}>
            <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Check your inbox</p>
              <p style={{ fontSize: 'var(--text-xs)', marginTop: 2, opacity: 0.8 }}>
                If <strong>{email}</strong> is registered, you'll receive a reset link within 5 minutes.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className={styles.errorBox} role="alert"><AlertCircle size={15} /> {error}</div>}
            <div className="field">
              <label className="label" htmlFor="fp-email">Email address</label>
              <input id="fp-email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" maxLength={254} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send reset link</button>
          </form>
        )}

        <p className={styles.switchText}>
          Remember it? <Link href="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
