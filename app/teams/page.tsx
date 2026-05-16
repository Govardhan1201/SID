'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TeamStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import type { Team } from '@/types';
import { Users, Plus, Search } from 'lucide-react';
import styles from './teams.module.css';

export default function TeamsPage() {
  const { userId } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { setTeams(TeamStore.getAll()); }, []);

  const filtered = teams.filter(t =>
    !query || [t.name, t.description, ...t.skills].some(f => f.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className={styles.topBar}>
          <div className="container">
            <div className={styles.topInner}>
              <div>
                <h1 className={styles.pageTitle}>Teams</h1>
                <p className={styles.pageSub}>Find a team to collaborate with, or browse what teams are building.</p>
              </div>
              {userId && <Link href="/teams/new" className="btn btn-primary btn-sm"><Plus size={14} /> Create team</Link>}
            </div>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input type="search" className={styles.searchInput} placeholder="Search teams by name, skill, description…"
                value={query} onChange={e => setQuery(e.target.value)} maxLength={200} />
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {filtered.length === 0
            ? <div className="empty-state"><Users size={40} /><p className="empty-state__title">No teams found</p></div>
            : (
              <div className="grid-3">
                {filtered.map(t => {
                  const isMember = userId ? t.members.some(m => m.userId === userId) : false;
                  return (
                    <Link key={t.id} href={`/team/${t.id}`} className={`card card-hover ${styles.teamCard}`}>
                      <div className={styles.teamBody}>
                        <div className={styles.teamHeader}>
                          <img src={t.avatar} alt={t.name} className="avatar avatar-lg" />
                          <div>
                            <h3 className={styles.teamName}>{t.name}</h3>
                            <p className={styles.teamMeta}>{t.members.length} members · {t.projectIds.length} projects</p>
                          </div>
                          {t.isOpen && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Open</span>}
                        </div>
                        <p className={styles.teamDesc}>{t.description}</p>
                        <div className="chip-list">
                          {t.skills.slice(0, 4).map(s => <span key={s} className="chip">{s}</span>)}
                        </div>
                        {t.lookingFor.length > 0 && (
                          <div style={{ marginTop: 'var(--space-2)' }}>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)', marginBottom: 4 }}>Looking for:</p>
                            <div className="chip-list">
                              {t.lookingFor.map(r => <span key={r} className="badge badge-accent">{r}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={styles.teamFooter}>
                        {isMember
                          ? <span className="badge badge-success">You're a member</span>
                          : t.isOpen ? <span className={styles.joinHint}>Click to view &amp; join</span> : <span className={styles.joinHint}>Closed team</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          }
        </div>
      </main>
      <Footer />
    </div>
  );
}
