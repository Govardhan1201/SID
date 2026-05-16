'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkRateLimit } from '@/lib/security';
import { Layers, Eye, EyeOff, AlertCircle } from 'lucide-react';
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

    // Route based on role stored in session
    const session = (() => { try { return JSON.parse(atob(sessionStorage.getItem('if_session') ?? '')); } catch { return null; } })();
    const role = session?.userId
      ? (() => { const u = JSON.parse(localStorage.getItem('if_users') ?? '[]').find((x: {id:string;role:string}) => x.id === session.userId); return u?.role; })()
      : null;

    if (role === 'admin') router.replace('/admin');
    else if (role === 'recruiter') router.replace('/recruiter');
    else router.replace('/dashboard');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Layers size={20} strokeWidth={2.5} /><span>IdeaForge</span></Link>
        <h1 className={styles.heading}>Sign in to your account</h1>
        <p className={styles.sub}>
          Demo credentials — Student: <code>aryan@student.com / Student@123</code><br />
          Recruiter: <code>neha@razorpay.com / Recruiter@123</code><br />
          Admin: <code>admin@ideaforge.dev / Admin@123</code>
        </p>

        {error && (
          <div className={styles.errorBox} role="alert">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email" type="email" className="input" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              maxLength={254} disabled={loading}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <div className={styles.passwordWrap}>
              <input
                id="password" type={showPw ? 'text' : 'password'} className="input" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password" autoComplete="current-password"
                maxLength={128} disabled={loading}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.forgotRow}>
            <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account? <Link href="/signup" className={styles.switchLink}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
