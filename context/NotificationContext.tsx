'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, createNotification } from '@/app/actions/users';
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

  const load = useCallback(async () => {
    if (!userId) { setNotifications([]); return; }
    const notifs = await getNotifications(userId);
    setNotifications(notifs as unknown as Notification[]);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    await markNotificationAsRead(id);
    load();
  };

  const markAllRead = async () => {
    if (!userId) return;
    await markAllNotificationsAsRead(userId);
    load();
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>) => {
    if (!userId) return;
    await createNotification({
      ...n, userId
    });
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
