import { Trophy, Clock, Users, Shield } from 'lucide-react';

export default function HackathonLoading() {
  return (
    <div className="page">
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '12px' }}></div>
            <div>
              <div className="skeleton" style={{ width: '300px', height: '32px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ width: '200px', height: '20px' }}></div>
            </div>
          </div>
          <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '16px' }}></div>
        </div>
      </main>
    </div>
  );
}
