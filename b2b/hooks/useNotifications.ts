// Custom hook for notifications
'use client';

import { useNotificationStore } from '@/store/notifications';
import { NotificationType } from '@/types/notification';
import { useCallback, useEffect } from 'react';

export function useNotifications() {
  const store = useNotificationStore();

  const addNotification = useCallback(
    (
      tipo: NotificationType,
      titulo: string,
      mensagem: string,
      link?: string
    ) => {
      store.addNotification({
        tipo,
        titulo,
        mensagem,
        link,
      });
    },
    [store]
  );

  const success = useCallback(
    (titulo: string, mensagem: string) => {
      addNotification('sistema', titulo, mensagem);
    },
    [addNotification]
  );

  const error = useCallback(
    (titulo: string, mensagem: string) => {
      addNotification('sistema', titulo, mensagem);
    },
    [addNotification]
  );

  const orderNotification = useCallback(
    (titulo: string, mensagem: string, link?: string) => {
      addNotification('pedido', titulo, mensagem, link);
    },
    [addNotification]
  );

  const stockNotification = useCallback(
    (titulo: string, mensagem: string, link?: string) => {
      addNotification('estoque', titulo, mensagem, link);
    },
    [addNotification]
  );

  // Fetch notifications from API on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notificacoes');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            store.setNotifications(
              data.data.map((n: any) => ({
                ...n,
                criadoEm: new Date(n.criadoEm),
              }))
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [store]);

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    removeNotification: store.removeNotification,
    clearAll: store.clearAll,
    addNotification,
    success,
    error,
    orderNotification,
    stockNotification,
  };
}
