'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/components/auth/AuthProvider';
import { getAnalyticsStats } from '@/app/actions/analytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Layers, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (role !== 'admin') {
        router.push('/');
        return;
      }
      
      getAnalyticsStats().then(data => {
        setStats(data);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [role, isLoading, router]);

  if (isLoading || loading) {
    return <div className="page"><Navbar /><main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading analytics...</main></div>;
  }

  if (!stats) {
    return <div className="page"><Navbar /><main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Failed to load analytics.</main></div>;
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main" style={{ background: 'var(--bg-2)' }}>
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>Analytics Dashboard</h1>
              <p style={{ color: 'var(--text-3)' }}>Platform growth and engagement metrics.</p>
            </div>
            <div className="btn btn-secondary" onClick={() => router.push('/admin')}>
              Back to Admin
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-4)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totals.users}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Total Users</div>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-4)', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: 'var(--radius-lg)' }}>
                <Layers size={24} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totals.projects}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Projects</div>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-4)', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: 'var(--radius-lg)' }}>
                <Lightbulb size={24} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totals.ideas}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Ideas</div>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-4)', background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', borderRadius: 'var(--radius-lg)' }}>
                <Activity size={24} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totals.hackathons}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Hackathons</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
            {/* Main Chart */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>User Growth</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.userGrowth}>
                    <XAxis dataKey="name" stroke="var(--text-4)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-4)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-3)', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Chart */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Role Distribution</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.roleDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.roleDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-3)', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                {stats.roleDistribution.map((r: any, i: number) => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    {r.name} ({r.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Top Project Domains</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.projectsByDomain}>
                  <XAxis dataKey="name" stroke="var(--text-4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-4)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-3)', border: 'none', borderRadius: '8px' }} cursor={{ fill: 'var(--bg-2)' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
