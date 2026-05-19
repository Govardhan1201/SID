'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Layers, Home, Compass } from 'lucide-react';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 5,
}));

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-1)',
      position: 'relative',
      overflow: 'hidden',
      padding: 'var(--space-8)',
      textAlign: 'center',
    }}>
      {/* Animated background particles */}
      {mounted && PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: 'var(--primary)',
          opacity: 0.15 + Math.random() * 0.25,
          animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Glowing orbs */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        top: '10%', left: '15%', animation: 'drift 12s ease-in-out infinite alternate',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,128,255,0.1) 0%, transparent 70%)',
        bottom: '15%', right: '10%', animation: 'drift 9s ease-in-out 2s infinite alternate-reverse',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-1)',
        marginBottom: 'var(--space-12)', zIndex: 1, textDecoration: 'none',
      }}>
        <Layers size={20} strokeWidth={2.5} style={{ color: 'var(--primary)' }} /> IdeaForge
      </Link>

      {/* 404 number */}
      <div style={{
        fontSize: 'clamp(6rem, 18vw, 12rem)',
        fontWeight: 900,
        lineHeight: 1,
        background: 'linear-gradient(135deg, var(--primary) 0%, #a78bfa 40%, var(--primary) 80%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmerText 4s linear infinite',
        filter: 'drop-shadow(0 0 40px rgba(108,99,255,0.4))',
        zIndex: 1, marginBottom: 'var(--space-4)',
        letterSpacing: '-0.04em',
      }}>
        404
      </div>

      {/* Floating elements around 404 */}
      <div style={{
        fontSize: '1.5rem', position: 'absolute', zIndex: 1,
        animation: 'orbit 8s linear infinite',
        top: '30%', left: '35%', opacity: 0.6,
      }}>✦</div>
      <div style={{
        fontSize: '1rem', position: 'absolute', zIndex: 1,
        animation: 'orbit 6s linear 2s infinite reverse',
        top: '25%', right: '30%', opacity: 0.4,
      }}>◈</div>
      <div style={{
        fontSize: '0.75rem', position: 'absolute', zIndex: 1,
        animation: 'orbit 10s linear 1s infinite',
        bottom: '35%', left: '30%', opacity: 0.5,
      }}>⬡</div>

      {/* Text */}
      <h1 style={{
        fontSize: 'clamp(var(--text-xl), 4vw, var(--text-3xl))',
        fontWeight: 700, color: 'var(--text-1)', marginBottom: 'var(--space-3)',
        zIndex: 1,
      }}>
        Lost in the forge
      </h1>
      <p style={{
        fontSize: 'var(--text-base)', color: 'var(--text-3)',
        maxWidth: 380, lineHeight: 1.7, marginBottom: 'var(--space-8)',
        zIndex: 1,
      }}>
        This page doesn't exist or has been moved. Let's get you back to building something great.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
        <Link href="/" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
          <Home size={16} /> Go home
        </Link>
        <Link href="/explore" className="btn btn-secondary" style={{ gap: 'var(--space-2)' }}>
          <Compass size={16} /> Explore projects
        </Link>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-30px) scale(1.2); }
        }
        @keyframes drift {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px, 20px) scale(1.1); }
        }
        @keyframes shimmerText {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
