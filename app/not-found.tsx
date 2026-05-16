'use client';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-6)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-1)' }}>
        <Layers size={20} strokeWidth={2.5} style={{ color: 'var(--primary)' }} /> IdeaForge
      </Link>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-4)', letterSpacing: '-0.05em' }}>404</div>
      <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-1)' }}>Page not found</p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Link href="/" className="btn btn-primary">Go home</Link>
        <Link href="/explore" className="btn btn-secondary">Explore projects</Link>
      </div>
    </div>
  );
}
