import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { subscribeToNotifications } from '@/lib/firebase/notifications';
import { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.id, (newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  return { notifications, unreadCount };
}
