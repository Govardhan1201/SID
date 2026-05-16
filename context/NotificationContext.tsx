'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { NotificationStore } from '@/lib/store';
import { generateId } from '@/lib/security';
import type { Notification } from '@/types';
import { useAuth } from './AuthContext';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(() => {
    if (!userId) { setNotifications([]); return; }
    setNotifications(NotificationStore.getForUser(userId));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const markRead = (id: string) => {
    NotificationStore.markRead(id);
    load();
  };

  const markAllRead = () => {
    if (!userId) return;
    NotificationStore.markAllRead(userId);
    load();
  };

  const addNotification = (n: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>) => {
    if (!userId) return;
    const notif: Notification = {
      ...n, id: generateId(), userId, createdAt: new Date().toISOString(), isRead: false,
    };
    NotificationStore.save(notif);
    load();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
