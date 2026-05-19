import { LayoutDashboard, Users, Layers, Lightbulb, Shield, Settings } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminLoading() {
  return (
    <div className="page">
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
          <div className={styles.pageHeader}>
            <div className="skeleton" style={{ width: '150px', height: '24px', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ width: '300px', height: '40px', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ width: '400px', height: '20px' }}></div>
          </div>

          <div className={styles.tabs}>
            {['overview', 'content', 'archived', 'users', 'audit', 'notifications'].map((tab, i) => (
              <div key={tab} className="skeleton" style={{ width: '100px', height: '40px', borderRadius: 'var(--radius-md)' }}></div>
            ))}
          </div>

          <div className={styles.statsGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }}></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
