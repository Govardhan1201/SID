'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationStore } from '@/lib/store';
import {
  Layers, Search, Bell, ChevronDown, LogOut,
  User, LayoutDashboard, Settings, Menu, X, Plus, Terminal
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, role, userId, studentProfile, recruiterProfile, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread,      setUnread]      = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = studentProfile?.name ?? recruiterProfile?.name ?? 'Account';
  const avatarSrc   = studentProfile?.avatar ?? recruiterProfile?.logo ?? '';
  const firstName   = displayName.split(' ')[0];

  useEffect(() => {
    if (!userId) { setUnread(0); return; }
    setUnread(NotificationStore.getForUser(userId).filter(n => !n.isRead).length);
  }, [userId, pathname]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [pathname]);

  function handleLogout() { logout(); router.push('/'); }

  function getDashHref() {
    if (role === 'admin')     return '/admin';
    if (role === 'recruiter') return '/recruiter';
    return '/dashboard';
  }

  const navLinks = [
    { href: '/explore',           label: 'Explore' },
    { href: '/explore?tab=ideas', label: 'Ideas'   },
    { href: '/teams',             label: 'Teams'   },
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

              {/* Bell */}
              <Link href={getDashHref()} className={styles.iconBtn} aria-label="Notifications">
                <Bell size={15} />
                {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
              </Link>

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
