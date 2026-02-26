'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Bell, Check, Trash2, Package, ShoppingCart, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Notification } from '@/types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const tNotifications = useTranslations('notifications');
  const tErrors = useTranslations('errors');
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Notification[];
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error(tErrors('server_error'));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      await Promise.all(
        unreadNotifications.map(n =>
          updateDoc(doc(db, 'notifications', n.id), { isRead: true })
        )
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success(tNotifications('mark_all_read'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(tErrors('server_error'));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success(tNotifications('deleted'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(tErrors('server_error'));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_paid':
      case 'order_shipped':
      case 'order_delivered':
        return <ShoppingCart size={20} className="text-blue-500" />;
      case 'message_received':
        return <MessageSquare size={20} className="text-green-500" />;
      case 'review_received':
        return <Star size={20} className="text-yellow-500" />;
      case 'product_low_stock':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'code_used':
        return <Package size={20} className="text-purple-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return tNotifications('just_now');
    if (diffInSeconds < 3600) return tNotifications('minutes_ago', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return tNotifications('hours_ago', { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return tNotifications('days_ago', { count: Math.floor(diffInSeconds / 86400) });
    return date.toLocaleDateString('fr-FR');
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{tNotifications('title')}</h2>
                    {unreadCount > 0 && (
                      <p className="text-sm text-white/90">{unreadCount} {unreadCount === 1 ? tNotifications('unread') : tNotifications('unread_plural')}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-green-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {tNotifications('all')} ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-white text-green-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {tNotifications('unread')} ({unreadCount})
                </button>
              </div>
            </div>

            {/* Actions */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
                >
                  <Check size={16} />
                  {tNotifications('mark_all_read')}
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <Bell size={64} className="text-gray-300 mb-4" />
                  <p className="text-lg font-medium">{tNotifications('empty')}</p>
                  <p className="text-sm text-center mt-2">
                    {filter === 'unread' 
                      ? tNotifications('no_unread')
                      : tNotifications('no_notifications')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-green-50' : ''
                      }`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
