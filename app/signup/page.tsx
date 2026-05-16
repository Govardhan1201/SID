'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkPasswordStrength, checkRateLimit } from '@/lib/security';
import { Layers, Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from '../auth.module.css';

function SignupForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get('role') === 'recruiter' ? 'recruiter' : 'student';

  const [role, setRole] = useState<'student' | 'recruiter'>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = checkPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!checkRateLimit('signup', 10, 60000)) {
      setError('Too many signup attempts. Try again in a minute.');
      return;
    }
    if (!agreed) { setError('You must agree to the terms to continue.'); return; }
    if (strength.score < 2) { setError('Please choose a stronger password.'); return; }

    setLoading(true);
    const result = await register(email, password, role);
    setLoading(false);

    if (!result.success) { setError(result.error ?? 'Signup failed.'); return; }
    router.push(`/onboarding?role=${role}&uid=${result.userId}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Layers size={20} strokeWidth={2.5} /><span>IdeaForge</span></Link>
        <h1 className={styles.heading}>Create your account</h1>

        {/* Role picker */}
        <div className={styles.rolePicker}>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`}
            onClick={() => setRole('student')}
          >
            <span className={styles.roleBtnTitle}>Student</span>
            <span className={styles.roleBtnSub}>Post projects and ideas</span>
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'recruiter' ? styles.roleBtnActive : ''}`}
            onClick={() => setRole('recruiter')}
          >
            <span className={styles.roleBtnTitle}>Recruiter</span>
            <span className={styles.roleBtnSub}>Discover student talent</span>
          </button>
        </div>

        {error && <div className={styles.errorBox} role="alert"><AlertCircle size={15} /> {error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="su-email">Email</label>
            <input
              id="su-email" type="email" className="input" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" maxLength={254} disabled={loading}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="su-password">Password</label>
            <div className={styles.passwordWrap}>
              <input
                id="su-password" type={showPw ? 'text' : 'password'} className="input" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters" autoComplete="new-password" maxLength={128} disabled={loading}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className={styles.strengthBar}>
                <div className={styles.strengthFill} style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
              </div>
            )}
            {password && <span className="hint" style={{ color: strength.color }}>{strength.label}</span>}
          </div>

          <div className={styles.checkField}>
            <input
              id="agree" type="checkbox" checked={agreed}
              onChange={e => setAgreed(e.target.checked)} disabled={loading}
            />
            <label htmlFor="agree">
              I agree to the <Link href="/terms" className={styles.switchLink}>Terms of Use</Link> and{' '}
              <Link href="/privacy" className={styles.switchLink}>Privacy Policy</Link>. I understand IdeaForge
              does not claim any IP rights over my submissions.
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !agreed}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link href="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}
