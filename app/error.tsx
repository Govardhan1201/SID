'use client';
import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
      <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Something went wrong!</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '600px' }}>
        {error.message || 'An unexpected error occurred while loading this section.'}
      </p>
      <button 
        onClick={() => reset()}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}
      >
        <RefreshCw size={18} />
        Try again
      </button>
    </div>
  );
}
