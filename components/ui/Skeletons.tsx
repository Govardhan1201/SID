import React from 'react';
import styles from '../cards/ProjectCard.module.css'; // Reuse card structures
import ideaStyles from '../cards/IdeaCard.module.css';
import studentStyles from '../cards/StudentCard.module.css';

export function ProjectCardSkeleton() {
  return (
    <article className={`${styles.card}`} style={{ height: '320px' }}>
      <div className={styles.accentBar} style={{ background: 'var(--border-2)' }} />
      <div className={styles.body}>
        <div className={styles.topMeta}>
          <span className="skeleton" style={{ width: '60px', height: '16px' }} />
        </div>
        <div className="skeleton" style={{ width: '80%', height: '24px', marginTop: 'var(--space-2)' }} />
        <div className="skeleton" style={{ width: '100%', height: '14px', marginTop: 'var(--space-2)' }} />
        <div className="skeleton" style={{ width: '60%', height: '14px', marginTop: 'var(--space-1)' }} />
        
        <div className={styles.techRow} style={{ marginTop: 'var(--space-4)' }}>
          <span className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '4px' }} />
          <span className="skeleton" style={{ width: '50px', height: '20px', borderRadius: '4px' }} />
          <span className="skeleton" style={{ width: '45px', height: '20px', borderRadius: '4px' }} />
        </div>
        
        <div className={styles.author} style={{ marginTop: 'var(--space-4)' }}>
          <div className="skeleton avatar avatar-sm" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="skeleton" style={{ width: '100px', height: '12px' }} />
            <span className="skeleton" style={{ width: '120px', height: '10px' }} />
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.stats}>
          <span className="skeleton" style={{ width: '30px', height: '14px' }} />
          <span className="skeleton" style={{ width: '30px', height: '14px' }} />
        </div>
      </div>
    </article>
  );
}

export function IdeaCardSkeleton() {
  return (
    <article className={`card ${ideaStyles.card}`} style={{ height: '280px' }}>
      <div className={ideaStyles.body}>
        <div className={ideaStyles.header}>
          <span className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '4px' }} />
          <span className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '4px' }} />
        </div>
        
        <div className="skeleton" style={{ width: '70%', height: '24px', marginTop: 'var(--space-3)' }} />
        <div className="skeleton" style={{ width: '100%', height: '14px', marginTop: 'var(--space-2)' }} />
        <div className="skeleton" style={{ width: '85%', height: '14px', marginTop: 'var(--space-1)' }} />
        
        <div className={ideaStyles.needs} style={{ marginTop: 'var(--space-4)' }}>
          <span className="skeleton" style={{ width: '60px', height: '12px' }} />
          <div className="chip-list">
            <span className="skeleton" style={{ width: '50px', height: '20px', borderRadius: '4px' }} />
            <span className="skeleton" style={{ width: '70px', height: '20px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
      
      <div className={ideaStyles.footer}>
        <div className={ideaStyles.stats}>
          <span className="skeleton" style={{ width: '30px', height: '14px' }} />
          <span className="skeleton" style={{ width: '30px', height: '14px' }} />
        </div>
      </div>
    </article>
  );
}

export function StudentCardSkeleton() {
  return (
    <article className={`card ${studentStyles.card}`} style={{ height: '100%', minHeight: '300px' }}>
      <div className={studentStyles.accentBar} style={{ background: 'var(--border-2)' }} />
      <div className={studentStyles.body}>
        <div className={studentStyles.top}>
          <div className="skeleton avatar avatar-lg" />
          <div className={studentStyles.info} style={{ flex: 1, paddingRight: 'var(--space-2)' }}>
            <span className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '4px' }} />
            <span className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '2px' }} />
            <span className="skeleton" style={{ width: '70%', height: '12px' }} />
          </div>
        </div>
        
        <div className="skeleton" style={{ width: '100%', height: '12px', marginTop: 'var(--space-2)' }} />
        <div className="skeleton" style={{ width: '90%', height: '12px', marginTop: '4px' }} />
        
        <div className={studentStyles.skills} style={{ marginTop: 'auto', paddingTop: 'var(--space-3)' }}>
          <span className="skeleton" style={{ width: '50px', height: '18px', borderRadius: '4px' }} />
          <span className="skeleton" style={{ width: '60px', height: '18px', borderRadius: '4px' }} />
          <span className="skeleton" style={{ width: '45px', height: '18px', borderRadius: '4px' }} />
        </div>
        
        <div className={studentStyles.domains} style={{ marginTop: 'var(--space-1)' }}>
          <span className="skeleton" style={{ width: '70px', height: '18px', borderRadius: '4px' }} />
        </div>
      </div>
      
      <div className={studentStyles.footer}>
        <span className="skeleton" style={{ width: '60px', height: '14px' }} />
        <div className={studentStyles.socials}>
          <span className="skeleton" style={{ width: '26px', height: '26px', borderRadius: '4px' }} />
          <span className="skeleton" style={{ width: '26px', height: '26px', borderRadius: '4px' }} />
        </div>
      </div>
    </article>
  );
}

export function GridSkeleton({ count = 6, type = 'project' }: { count?: number; type?: 'project' | 'idea' | 'student' }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {type === 'project' && <ProjectCardSkeleton />}
          {type === 'idea' && <IdeaCardSkeleton />}
          {type === 'student' && <StudentCardSkeleton />}
        </React.Fragment>
      ))}
    </div>
  );
}
