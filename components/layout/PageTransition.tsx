'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    // Start loading bar
    setProgress(0);
    setVisible(true);

    // Quick jump to 80%, then complete after short delay
    const t1 = setTimeout(() => setProgress(70), 50);
    const t2 = setTimeout(() => setProgress(90), 200);
    const t3 = setTimeout(() => {
      setProgress(100);
      const t4 = setTimeout(() => setVisible(false), 300);
      timerRef.current = t4;
    }, 400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      height: 3, pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--primary), #a78bfa, var(--primary))',
        backgroundSize: '200% 100%',
        transition: progress === 100 ? 'width 0.3s ease, opacity 0.3s ease' : 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
        opacity: progress === 100 ? 0 : 1,
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 12px rgba(108,99,255,0.8), 0 0 24px rgba(108,99,255,0.4)',
        animation: 'shimmer 1.5s linear infinite',
      }} />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
