'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { sendAdminOtp, createAdminUser, getAdminCount } from '@/app/actions/admin';
import { Shield, Mail, Lock, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import styles from '../admin.module.css';

export default function CreateAdminPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) return null;
  if (role !== 'admin') { router.replace('/login'); return null; }

  async function handleSendOtp() {
    if (!email.trim()) { setError('Enter a valid email.'); return; }
    setLoading(true); setError('');
    const res = await sendAdminOtp(email.trim().toLowerCase());
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to send OTP.'); return; }
    setStep('otp');
  }

  async function handleCreate() {
    if (!password || password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true); setError('');
    const res = await createAdminUser(email, password, otp);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to create admin.'); return; }
    setStep('done');
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: 520 }}>
          <Link href="/admin" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', color: 'var(--text-3)', fontSize: 'var(--text-sm)' }}>
            <ArrowLeft size={14} /> Back to Admin Panel
          </Link>

          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <Shield size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-1)' }}>Create Admin Account</h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)' }}>OTP verification required • Max 5 admins</p>
              </div>
            </div>

            {step === 'done' ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 'var(--space-4)' }} />
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-1)', marginBottom: 'var(--space-2)' }}>Admin created!</h2>
                <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                  Account for <strong>{email}</strong> has been created successfully.
                </p>
                <Link href="/admin" className="btn btn-primary">Back to Admin Panel</Link>
              </div>
            ) : step === 'form' ? (
              <>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="label">New Admin Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
                    <input
                      className="input"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{error}</p>}

                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSendOtp} disabled={loading}>
                  <Send size={15} /> {loading ? 'Sending OTP…' : 'Send OTP to Email'}
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginBottom: 'var(--space-5)' }}>
                  OTP sent to <strong>{email}</strong>. Enter it below along with the new admin password.
                </p>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="label">6-digit OTP</label>
                  <input
                    className="input"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ letterSpacing: '0.3em', fontWeight: 700, fontSize: 'var(--text-lg)', textAlign: 'center' }}
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="label">New Admin Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
                    <input
                      className="input"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{error}</p>}

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={() => { setStep('form'); setError(''); }}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={loading}>
                    {loading ? 'Creating…' : 'Create Admin Account'}
                  </button>
                </div>

                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 'var(--space-3)', color: 'var(--text-4)' }} onClick={handleSendOtp} disabled={loading}>
                  Resend OTP
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
