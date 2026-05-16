import Link from 'next/link';
import { MapPin, GitFork, Link2, Layers } from 'lucide-react';
import type { StudentProfile } from '@/types';
import { ProjectStore } from '@/lib/store';
import styles from './StudentCard.module.css';

interface Props { profile: StudentProfile; }

export default function StudentCard({ profile }: Props) {
  const projects = ProjectStore.getByAuthor(profile.userId).filter(p => p.status === 'published');

  return (
    <Link href={`/profile/${profile.userId}`} className={`card card-hover ${styles.card}`}>
      <div className={styles.body}>
        <div className={styles.top}>
          <img src={profile.avatar} alt={profile.name} className="avatar avatar-lg" />
          <div className={styles.info}>
            <h3 className={styles.name}>{profile.name}</h3>
            <p className={styles.sub}>{profile.branch} · Year {profile.year}</p>
            <p className={styles.college}>
              <MapPin size={11} /> {profile.college}
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className={styles.bio}>{profile.bio}</p>
        )}

        <div className="chip-list">
          {profile.skills.slice(0, 4).map(s => (
            <span key={s} className="chip">{s}</span>
          ))}
          {profile.skills.length > 4 && (
            <span className="chip">+{profile.skills.length - 4}</span>
          )}
        </div>

        <div className={styles.domains}>
          {profile.domains.slice(0, 2).map(d => (
            <span key={d} className="badge badge-primary">{d}</span>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.stat}>
          <Layers size={13} />
          <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>
        <div className={styles.socials}>
          {profile.github && (
            <span onClick={e => { e.preventDefault(); window.open(profile.github, '_blank'); }}>
              <GitFork size={14} />
            </span>
          )}
          {profile.linkedin && (
            <span onClick={e => { e.preventDefault(); window.open(profile.linkedin, '_blank'); }}>
              <Link2 size={14} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
