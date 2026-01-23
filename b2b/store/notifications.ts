// Notifications store using Zustand
import { create } from 'zustand';
import { NotificationState, Notification } from '@/types/notification';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      ...notification,
      lida: false,
      criadoEm: new Date(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      if (!notification || notification.lida) {
        return state;
      }

      return {
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, lida: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, lida: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      const unreadDecrement = notification && !notification.lida ? 1 : 0;

      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - unreadDecrement),
      };
    });
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.lida).length;
    set({
      notifications,
      unreadCount,
    });
  },
}));
