import Link from 'next/link';
import { GitFork, Link2, Layers, GraduationCap, Code2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { StudentProfile, Project } from '@/types';
import { getProjectsByUserId } from '@/app/actions/projects';
import styles from './StudentCard.module.css';

interface Props { profile: StudentProfile; }

export default function StudentCard({ profile }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    getProjectsByUserId(profile.userId).then(p => {
      setProjects((p as unknown as Project[]).filter(x => x.status === 'published'));
    });
  }, [profile.userId]);

  return (
    <Link href={`/profile/${profile.userId}`} className={styles.card}>
      <div className={styles.accentBar} />
      <div className={styles.body}>
        <div className={styles.top}>
          <img src={profile.avatar} alt={profile.name} className={styles.avatar} />
          <div className={styles.info}>
            <h3 className={styles.name}>{profile.name}</h3>
            <p className={styles.sub}>
              <Code2 size={10} />{profile.branch} · Yr {profile.year}
            </p>
            <p className={styles.college}>
              <GraduationCap size={10} />{profile.college}
            </p>
          </div>
        </div>

        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        <div className={styles.skills}>
          {profile.skills.slice(0, 4).map(s => (
            <span key={s} className={styles.skill}>{s}</span>
          ))}
          {profile.skills.length > 4 && (
            <span className={styles.skill}>+{profile.skills.length - 4}</span>
          )}
        </div>

        <div className={styles.domains}>
          {profile.domains.slice(0, 2).map(d => (
            <span key={d} className={styles.domain}>{d}</span>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.stat}>
          <Layers size={11} />{projects.length} project{projects.length !== 1 ? 's' : ''}
        </span>
        <div className={styles.socials}>
          {profile.github && (
            <span className={styles.socialIcon} onClick={e => { e.preventDefault(); window.open(profile.github, '_blank'); }}>
              <GitFork size={13} />
            </span>
          )}
          {profile.linkedin && (
            <span className={styles.socialIcon} onClick={e => { e.preventDefault(); window.open(profile.linkedin, '_blank'); }}>
              <Link2 size={13} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
