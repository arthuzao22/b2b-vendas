// NotificationDropdown component for header
'use client';

import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from './button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from './badge';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${
                    !notification.lida ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          onClick={() => {
                            markAsRead(notification.id);
                            setIsOpen(false);
                          }}
                        >
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {notification.titulo}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {notification.mensagem}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(notification.criadoEm, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {notification.titulo}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {notification.mensagem}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(notification.criadoEm, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.lida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t text-center">
              <Link href="/notificacoes" onClick={() => setIsOpen(false)}>
                <Button variant="link" size="sm" className="text-xs">
                  Ver todas as notificações
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
