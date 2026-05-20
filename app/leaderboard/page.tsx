'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getLeaderboardData } from '@/app/actions/leaderboard';
import { Trophy, Star, Eye, Layers, Lightbulb, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'projects' | 'ideas'>('projects');

  useEffect(() => {
    getLeaderboardData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const renderList = (items: any[], type: 'project' | 'idea') => {
    if (!items || items.length === 0) return <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No data available.</div>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {items.map((item, index) => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-4) var(--space-6)', background: index < 3 ? 'var(--primary-dim)' : 'var(--bg-2)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--text-4)', width: '40px', textAlign: 'center' }}>
              #{index + 1}
            </div>
            
            <div style={{ flex: 1 }}>
              <Link href={`/${type}/${item.id}`} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', textDecoration: 'none' }}>
                {item.title}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                {item.author?.avatar ? (
                  <img src={item.author.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                ) : (
                  <UserCircle size={24} color="var(--text-4)" />
                )}
                <Link href={`/profile/${item.authorId}`} style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>
                  {item.author?.name || 'Unknown Author'}
                </Link>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)', color: 'var(--text-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.likes?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Eye size={16} />
                <span>{item.views || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page">
      <Navbar />
      <main className="main" style={{ background: 'var(--bg-1)' }}>
        <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: 'var(--space-12) 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <Trophy size={48} color="var(--primary)" style={{ margin: '0 auto var(--space-4)' }} />
            <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>Leaderboard</h1>
            <p style={{ color: 'var(--text-3)', fontSize: '1.25rem' }}>The most highly-rated projects and ideas on IdeaForge.</p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)', maxWidth: '800px' }}>
          
          <div className="tabs" style={{ marginBottom: 'var(--space-8)', justifyContent: 'center' }}>
            <button className={`tab-btn ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>
              <Layers size={16} /> Top Projects
            </button>
            <button className={`tab-btn ${tab === 'ideas' ? 'active' : ''}`} onClick={() => setTab('ideas')}>
              <Lightbulb size={16} /> Top Ideas
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-3)' }}>Loading leaderboard...</div>
          ) : (
            <>
              {tab === 'projects' && renderList(data?.topProjects, 'project')}
              {tab === 'ideas' && renderList(data?.topIdeas, 'idea')}
            </>
          )}
          
        </div>
      </main>
      <Footer />
    </div>
  );
}
