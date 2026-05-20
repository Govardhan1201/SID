'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  Layers, Search, Bell, ChevronDown, LogOut,
  User, LayoutDashboard, Settings, Menu, X, Plus, Terminal
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, role, userId, studentProfile, recruiterProfile, logout } = useAuth();
  const { notifications, unreadCount: unread, markRead, markAllRead } = useNotifications();
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = studentProfile?.name ?? recruiterProfile?.name ?? 'Account';
  const avatarSrc   = studentProfile?.avatar ?? recruiterProfile?.logo ?? '';
  const firstName   = displayName.split(' ')[0];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); setNotifOpen(false); }, [pathname]);

  function handleLogout() { logout(); router.push('/'); }

  function getDashHref() {
    if (role === 'admin')     return '/admin';
    if (role === 'recruiter') return '/recruiter';
    return '/dashboard';
  }

  const navLinks = [
    { href: '/explore',           label: 'Explore' },
    { href: '/teams',             label: 'Teams'   },
    { href: '/leaderboard',       label: 'Leaderboard' },
    { href: '/how-it-works',      label: 'How it Works' },
  ];

  const isActive = (href: string) => pathname === href.split('?')[0] || pathname.startsWith(href.split('?')[0] + '/');

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Layers size={18} strokeWidth={2.5} />
          <span>IdeaForge</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${isActive(l.href.split('?')[0]) ? styles.navLinkActive : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className={styles.actions}>

          {isAuthenticated ? (
            <>
              {role === 'student' && (
                <Link href="/dashboard/projects/new" className={`btn btn-primary btn-sm ${styles.submitBtn}`}>
                  <Plus size={13} /> Submit
                </Link>
              )}

              {/* Bell — links directly to notifications tab or shows dropdown */}
              <div ref={notifRef} className={styles.profileMenu}>
                <button 
                  className={styles.iconBtn} 
                  aria-label="Notifications" 
                  onClick={() => setNotifOpen(o => !o)}
                  style={{ position: 'relative' }}
                >
                  <Bell size={15} />
                  {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
                </button>

                {notifOpen && (
                  <div className={styles.dropdown} style={{ width: '320px', right: '-10px', padding: 0 }} role="menu">
                    <div className={styles.dropdownHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Notifications</h3>
                      {unread > 0 && (
                        <button onClick={() => markAllRead()} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            style={{ 
                              padding: '12px 16px', 
                              borderBottom: '1px solid var(--border)',
                              background: n.isRead ? 'transparent' : 'var(--bg-3)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'background 0.2s'
                            }}
                            onClick={() => {
                              if (!n.isRead) markRead(n.id);
                              if (n.link) {
                                router.push(n.link);
                                setNotifOpen(false);
                              }
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <strong style={{ fontSize: '0.9rem', color: n.isRead ? 'var(--text-2)' : 'var(--text-1)' }}>{n.title}</strong>
                              {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 4 }}></span>}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-3)' }}>{n.message}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: 4 }}>
                              {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div style={{ padding: '8px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                      <Link href="/dashboard?tab=notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                        View all
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div ref={profileRef} className={styles.profileMenu}>
                <button
                  className={styles.profileBtn}
                  onClick={() => setProfileOpen(o => !o)}
                  aria-expanded={profileOpen}
                >
                  {avatarSrc
                    ? <img src={avatarSrc} alt={displayName} className={styles.avatar} />
                    : <div className={styles.avatarFallback}>{displayName[0]?.toUpperCase()}</div>
                  }
                  <span className={styles.profileName}>{firstName}</span>
                  <ChevronDown size={12} />
                </button>

                {profileOpen && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{displayName}</p>
                      <p className={styles.dropdownRole}>{role}</p>
                    </div>
                    <hr className={styles.dropdownDivider} />
                    <Link href={getDashHref()} className={styles.dropdownItem} role="menuitem">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    {role === 'student' && <>
                      <Link href={`/profile/${studentProfile?.userId}`} className={styles.dropdownItem}>
                        <User size={14} /> My Profile
                      </Link>
                      <Link href="/dashboard/projects/new" className={styles.dropdownItem}>
                        <Plus size={14} /> New Project
                      </Link>
                      <Link href="/dashboard/ideas/new" className={styles.dropdownItem}>
                        <Plus size={14} /> New Idea
                      </Link>
                    </>}
                    <Link href="/settings" className={styles.dropdownItem} role="menuitem">
                      <Settings size={14} /> Settings
                    </Link>
                    <hr className={styles.dropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={handleLogout}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login"  className="btn btn-ghost btn-sm">Sign in</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}

          <button className={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={styles.mobileLink}>{l.label}</Link>
          ))}
          <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-2) 0' }} />
          {isAuthenticated ? (
            <>
              <Link href={getDashHref()} className={styles.mobileLink}>Dashboard</Link>
              {role === 'student' && <>
                <Link href="/dashboard/projects/new" className={styles.mobileLink}>New Project</Link>
                <Link href="/dashboard/ideas/new"    className={styles.mobileLink}>New Idea</Link>
                <Link href={`/profile/${studentProfile?.userId}`} className={styles.mobileLink}>My Profile</Link>
              </>}
              <Link href="/settings" className={styles.mobileLink}>Settings</Link>
              <button className={`${styles.mobileLink} ${styles.mobileDanger}`} onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login"  className={styles.mobileLink}>Sign in</Link>
              <Link href="/signup" className={`${styles.mobileLink} ${styles.mobilePrimary}`}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
