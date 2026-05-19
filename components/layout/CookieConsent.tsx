'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Shield } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('if_cookie_consent');
    if (!consent) {
      setTimeout(() => { setShow(true); setTimeout(() => setVisible(true), 50); }, 1500);
    }
  }, []);

  const handleAccept = () => {
    setVisible(false);
    setTimeout(() => { localStorage.setItem('if_cookie_consent', 'true'); setShow(false); }, 350);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 'var(--space-6)', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '120px'})`,
      transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
      opacity: visible ? 1 : 0,
      zIndex: 9999, width: 'min(520px, calc(100vw - 32px))',
    }}>
      <div style={{
        background: 'rgba(15,15,22,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(108,99,255,0.25)',
        borderRadius: '16px',
        padding: 'var(--space-5) var(--space-6)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(108,99,255,0.3) inset',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(108,99,255,0.1))',
            border: '1px solid rgba(108,99,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cookie size={18} style={{ color: 'var(--primary)' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-1)', margin: 0 }}>
                We use cookies
              </p>
              <button onClick={handleAccept} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-4)', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', margin: '0 0 var(--space-4) 0', lineHeight: 1.6 }}>
              IdeaForge uses cookies to secure your session and improve your experience. By continuing, you agree to our{' '}
              <Link href="/legal/privacy" style={{ color: 'var(--primary-l)', textDecoration: 'underline' }}>Privacy Policy</Link>
              {' '}and{' '}
              <Link href="/legal/terms" style={{ color: 'var(--primary-l)', textDecoration: 'underline' }}>Terms</Link>.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={handleAccept} style={{
                background: 'linear-gradient(135deg, var(--primary), #8b80ff)',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '8px 20px', fontSize: 'var(--text-sm)', fontWeight: 600,
                cursor: 'pointer', transition: 'opacity 0.2s', flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Shield size={13} /> Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
