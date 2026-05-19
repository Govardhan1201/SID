import styles from './dashboard.module.css';

export default function DashboardLoading() {
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
            {['projects', 'ideas', 'activity', 'settings'].map((tab, i) => (
              <div key={tab} className="skeleton" style={{ width: '100px', height: '40px', borderRadius: 'var(--radius-md)' }}></div>
            ))}
          </div>

          <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-6)' }}></div>
        </div>
      </main>
    </div>
  );
}
