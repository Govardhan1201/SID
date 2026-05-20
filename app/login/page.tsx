'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkRateLimit } from '@/lib/security';
import { Layers, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!checkRateLimit(`login_${email}`, 5, 60000)) {
      setError('Too many login attempts. Wait a minute and try again.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Login failed.');
      return;
    }

    const role = result.role;

    if (role === 'admin') router.replace('/admin');
    else if (role === 'recruiter') router.replace('/recruiter');
    else router.replace('/dashboard');
  }

  return (
    <div className={styles.page}>
      <div className={styles.leftPane}>
        {/* Abstract shapes or fluid background is handled via CSS pseudo elements */}
      </div>
      <div className={styles.rightPane}>
        <div className={styles.card} style={{ position: 'relative' }}>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: '-40px', left: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-3)' }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link href="/" className={styles.logo} style={{ marginBottom: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.4)', boxShadow: 'var(--primary-glow)' }}>
                <Layers size={18} strokeWidth={2.5} color="var(--primary)" />
              </div>
            </Link>
            <div style={{ height: 16, width: 1, background: 'rgba(255, 255, 255, 0.2)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-2)', letterSpacing: '0.02em' }}>Secure Access</span>
          </div>

          <div>
            <h1 className={styles.heading} style={{ marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.95rem' }}>Log in to your ultra-premium account</p>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ marginTop: 'var(--space-4)' }}>
            <div className="field">
              <input
                id="email" type="email" className="input" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email Address" autoComplete="email"
                maxLength={254} disabled={loading}
              />
            </div>

            <div className="field">
              <div className={styles.passwordWrap}>
                <input
                  id="password" type={showPw ? 'text' : 'password'} className="input" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" autoComplete="current-password"
                  maxLength={128} disabled={loading}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.forgotRow}>
              <Link href="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', fontSize: '1rem', marginTop: 'var(--space-2)' }} disabled={loading}>
              {loading ? 'Logging In…' : 'Log In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', margin: 'var(--space-4) 0', color: 'var(--text-4)' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-outline" style={{ width: '100%', height: '40px' }} onClick={() => setError('SSO coming soon')}>Sign in with Google</button>
            <button type="button" className="btn btn-outline" style={{ width: '100%', height: '40px' }} onClick={() => setError('SSO coming soon')}>Sign in with Apple</button>
            <button type="button" className="btn btn-outline" style={{ width: '100%', height: '40px' }} onClick={() => setError('SSO coming soon')}>Sign in with GitHub</button>
          </div>

          <p className={styles.switchText} style={{ marginTop: 'var(--space-6)' }}>
            New to IdeaForge? <Link href="/signup" className={styles.switchLink}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
