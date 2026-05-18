'use client';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  deadline: string;
}

export default function DeadlineCountdown({ deadline }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number; expired: boolean } | null>(null);

  useEffect(() => {
    const end = new Date(deadline).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ d, h, m, s, expired: false });
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return <span style={{ fontFamily: 'var(--font-mono)' }}>Loading...</span>;

  if (timeLeft.expired) {
    return (
      <span style={{ color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={14} /> Deadline Passed
      </span>
    );
  }

  const parts = [];
  if (timeLeft.d > 0) parts.push(`${timeLeft.d}d`);
  if (timeLeft.h > 0 || timeLeft.d > 0) parts.push(`${String(timeLeft.h).padStart(2, '0')}h`);
  parts.push(`${String(timeLeft.m).padStart(2, '0')}m`);
  if (timeLeft.d === 0) parts.push(`${String(timeLeft.s).padStart(2, '0')}s`); // Only show seconds if less than a day

  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
      <Clock size={14} /> {parts.join(':')}
    </span>
  );
}
