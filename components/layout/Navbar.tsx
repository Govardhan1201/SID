'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationStore } from '@/lib/store';
import {
  Layers, Search, Bell, ChevronDown, LogOut, User,
  LayoutDashboard, Settings, Menu, X, Plus
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, role, userId, studentProfile, recruiterProfile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread]         = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = studentProfile?.name ?? recruiterProfile?.name ?? 'Account';
  const avatarSrc   = studentProfile?.avatar ?? recruiterProfile?.logo ?? '';

  // Load unread notification count
  useEffect(() => {
    if (!userId) { setUnread(0); return; }
    const notifs = NotificationStore.getForUser(userId);
    setUnread(notifs.filter(n => !n.isRead).length);
  }, [userId, pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [pathname]);

  function handleLogout() { logout(); router.push('/'); }

  function getDashboardHref() {
    if (role === 'admin') return '/admin';
    if (role === 'recruiter') return '/recruiter';
    return '/dashboard';
  }

  const navLinks = [
    { href: '/explore',           label: 'Explore' },
    { href: '/explore?tab=ideas', label: 'Ideas' },
    { href: '/teams',             label: 'Teams' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href.split('?')[0] + '/');

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Layers size={20} strokeWidth={2.5} />
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

        {/* Right actions */}
        <div className={styles.actions}>

          {/* Search */}
          <Link href="/explore" className={`btn btn-ghost btn-sm ${styles.iconBtn}`} aria-label="Search">
            <Search size={16} />
          </Link>

          {isAuthenticated ? (
            <>
              {/* Submit CTA for students */}
              {role === 'student' && (
                <Link href="/dashboard/projects/new" className={`btn btn-primary btn-sm ${styles.submitBtn}`}>
                  <Plus size={14} /> Submit
                </Link>
              )}

              {/* Bell */}
              <Link href={getDashboardHref()} className={`${styles.iconBtn} ${styles.bellBtn}`} aria-label="Notifications">
                <Bell size={16} />
                {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
              </Link>

              {/* Profile dropdown */}
              <div ref={profileRef} className={styles.profileMenu}>
                <button
                  className={styles.profileBtn}
                  onClick={() => setProfileOpen(o => !o)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  {avatarSrc
                    ? <img src={avatarSrc} alt={displayName} className={`avatar avatar-sm ${styles.avatarImg}`} />
                    : <div className={`${styles.avatarFallback}`}>{displayName[0]?.toUpperCase()}</div>}
                  <span className={styles.profileName}>{displayName.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>

                {profileOpen && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{displayName}</p>
                      <p className={styles.dropdownRole}>{role}</p>
                    </div>
                    <hr className={styles.dropdownDivider} />
                    <Link href={getDashboardHref()} className={styles.dropdownItem} role="menuitem">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {role === 'student' && (
                      <Link href={`/profile/${studentProfile?.userId}`} className={styles.dropdownItem} role="menuitem">
                        <User size={15} /> My Profile
                      </Link>
                    )}
                    {role === 'student' && (
                      <>
                        <Link href="/dashboard/projects/new" className={styles.dropdownItem} role="menuitem">
                          <Plus size={15} /> New Project
                        </Link>
                        <Link href="/dashboard/ideas/new" className={styles.dropdownItem} role="menuitem">
                          <Plus size={15} /> New Idea
                        </Link>
                      </>
                    )}
                    <Link href="/settings" className={styles.dropdownItem} role="menuitem">
                      <Settings size={15} /> Settings
                    </Link>
                    <hr className={styles.dropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={handleLogout} role="menuitem">
                      <LogOut size={15} /> Sign out
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

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={styles.mobileLink}>{l.label}</Link>
          ))}
          <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-2) 0' }} />
          {isAuthenticated ? (
            <>
              <Link href={getDashboardHref()} className={styles.mobileLink}>Dashboard</Link>
              {role === 'student' && (
                <>
                  <Link href="/dashboard/projects/new" className={styles.mobileLink}>New Project</Link>
                  <Link href="/dashboard/ideas/new" className={styles.mobileLink}>New Idea</Link>
                  <Link href={`/profile/${studentProfile?.userId}`} className={styles.mobileLink}>My Profile</Link>
                </>
              )}
              <Link href="/settings" className={styles.mobileLink}>Settings</Link>
              <button className={styles.mobileLink} onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login"  className={styles.mobileLink}>Sign in</Link>
              <Link href="/signup" className={`${styles.mobileLink} ${styles.mobileLinkPrimary}`}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
