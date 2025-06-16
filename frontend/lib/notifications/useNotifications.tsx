// lib/notifications/useNotifications.ts
'use client'

import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration (unless persistent)
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, message, type: 'success' });
  }, [addNotification]);

  const showError = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, message, type: 'error' });
  }, [addNotification]);

  const showWarning = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, message, type: 'warning' });
  }, [addNotification]);

  const showInfo = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, message, type: 'info' });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};