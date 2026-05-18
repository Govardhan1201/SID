'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getAllHackathons } from '@/app/actions/hackathon';
import type { Hackathon } from '@/types';
import { Plus, Trophy, Clock, CheckCircle, Users, Calendar, ChevronRight, Layers } from 'lucide-react';
import styles from './hackathons.module.css';

const STATUS_META: Record<Hackathon['status'], { label: string; cls: string }> = {
  draft:     { label: 'Draft',     cls: 'badge-neutral'  },
  active:    { label: 'Active',    cls: 'badge-success'  },
  judging:   { label: 'Judging',   cls: 'badge-warning'  },
  completed: { label: 'Completed', cls: 'badge-primary'  },
};

export default function HackathonsPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);

  useEffect(() => {
    if (!isLoading && role !== 'admin') router.replace('/dashboard');
  }, [role, isLoading, router]);

  useEffect(() => {
    async function load() {
      const data = await getAllHackathons();
      setHackathons(data as unknown as Hackathon[]);
    }
    load();
  }, []);

  if (isLoading || role !== 'admin') return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

          {/* Header */}
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>Admin Panel</p>
              <h1 className={styles.title}>Hackathons</h1>
              <p className={styles.sub}>Create and manage hackathons, import participants, publish results.</p>
            </div>
            <Link href="/admin/hackathons/new" className="btn btn-primary">
              <Plus size={15} /> New Hackathon
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {[
              { label: 'Total', value: hackathons.length, icon: <Trophy size={16} /> },
              { label: 'Active', value: hackathons.filter(h => h.status === 'active').length, icon: <CheckCircle size={16} /> },
              { label: 'Judging', value: hackathons.filter(h => h.status === 'judging').length, icon: <Clock size={16} /> },
              { label: 'Completed', value: hackathons.filter(h => h.status === 'completed').length, icon: <Layers size={16} /> },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="stat-card__label">{s.label}</p>
                <p className="stat-card__value">{s.value}</p>
              </div>
            ))}
          </div>

          {/* List */}
          {hackathons.length === 0 ? (
            <div className="empty-state">
              <Trophy size={48} className="empty-state__icon" />
              <p className="empty-state__title">No hackathons yet</p>
              <p className="empty-state__body">Create your first hackathon to get started.</p>
              <Link href="/admin/hackathons/new" className="btn btn-primary">Create Hackathon</Link>
            </div>
          ) : (
            <div className={styles.list}>
              {hackathons.map(h => {
                const meta = STATUS_META[h.status];
                const deadline = new Date(h.deadline);
                const isPast   = deadline < new Date();
                return (
                  <Link key={h.id} href={`/admin/hackathons/${h.id}`} className={styles.card}>
                    <div className={styles.cardAccent} />
                    <div className={styles.cardBody}>
                      <div className={styles.cardTop}>
                        <div>
                          <span className={`badge ${meta.cls}`}>{meta.label}</span>
                          <h2 className={styles.cardTitle}>{h.name}</h2>
                          <p className={styles.cardTagline}>{h.tagline}</p>
                        </div>
                        <ChevronRight size={18} className={styles.cardArrow} />
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.metaItem}>
                          <Layers size={12} />
                          {(h.tracks?.length ?? 0)} track{(h.tracks?.length ?? 0) !== 1 ? 's' : ''}
                        </span>
                        <span className={styles.metaItem}>
                          <Calendar size={12} />
                          Deadline: {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {isPast && <span className={styles.pastTag}> (ended)</span>}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
