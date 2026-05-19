import styles from './explore.module.css';

export default function ExploreLoading() {
  return (
    <div className="page">
      <main className="main">
        <div className={styles.header}>
          <div className="container">
            <div className="skeleton" style={{ width: '200px', height: '40px', marginBottom: '16px' }}></div>
            <div className="skeleton" style={{ width: '400px', height: '20px', marginBottom: '32px' }}></div>
            
            <div className={styles.searchBar}>
              <div className="skeleton" style={{ width: '100%', height: '56px', borderRadius: 'var(--radius-full)' }}></div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.controls}>
            <div className="skeleton" style={{ width: '300px', height: '40px', borderRadius: 'var(--radius-full)' }}></div>
            <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: 'var(--radius-full)' }}></div>
          </div>

          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }}></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
