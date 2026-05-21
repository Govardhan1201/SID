'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, AlertCircle, CheckCircle, KeyRound, Mail, Lock } from 'lucide-react';
import { requestPasswordReset, verifyOTP, resetPassword } from '@/app/actions/forgot-password';
import styles from '../auth.module.css';

type Step = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    if (!res.success && res.error) { setError(res.error); return; }
    setStep('otp');
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    const res = await verifyOTP(email, otp);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Invalid OTP.'); return; }
    setStep('password');
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const res = await resetPassword(email, otp, newPassword);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to reset password.'); return; }
    setStep('done');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Layers size={20} strokeWidth={2.5} /><span>IdeaForge</span></Link>
        <h1 className={styles.heading}>Reset your password</h1>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {(['email', 'otp', 'password'] as const).map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: (['email', 'otp', 'password'].indexOf(step) >= i || step === 'done') ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {error && <div className={styles.errorBox} role="alert"><AlertCircle size={15} /> {error}</div>}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} noValidate>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>Enter your registered email address. We'll send you a 6-digit OTP.</p>
            <div className="field">
              <label className="label" htmlFor="fp-email"><Mail size={14} style={{ display: 'inline', marginRight: 6 }} />Email address</label>
              <input id="fp-email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" maxLength={254} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Sending OTP…' : 'Send OTP'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} noValidate>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>A 6-digit OTP was sent to <strong style={{ color: 'var(--text-1)' }}>{email}</strong>. Check your inbox (and spam folder).</p>
            <div className="field">
              <label className="label" htmlFor="fp-otp"><KeyRound size={14} style={{ display: 'inline', marginRight: 6 }} />Enter OTP</label>
              <input id="fp-otp" type="text" className="input" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" maxLength={6} required inputMode="numeric" style={{ letterSpacing: '0.4em', fontSize: '1.4rem', textAlign: 'center' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Verifying…' : 'Verify OTP'}</button>
            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => { setStep('email'); setOtp(''); setError(''); }}>← Back</button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} noValidate>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>OTP verified! Create a new password for your account.</p>
            <div className="field">
              <label className="label" htmlFor="fp-newpw"><Lock size={14} style={{ display: 'inline', marginRight: 6 }} />New password</label>
              <input id="fp-newpw" type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
            </div>
            <div className="field">
              <label className="label" htmlFor="fp-confirmpw">Confirm new password</label>
              <input id="fp-confirmpw" type="password" className="input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Resetting…' : 'Reset Password'}</button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) 0' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 'var(--text-lg)' }}>Password reset!</p>
            <p style={{ color: 'var(--text-3)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>Your password has been updated. You can now sign in with your new password.</p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>Go to Sign In</Link>
          </div>
        )}

        <p className={styles.switchText}>Remember it? <Link href="/login" className={styles.switchLink}>Sign in</Link></p>
      </div>
    </div>
  );
}
