// contexts/NotificationContext.tsx
'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications, Notification } from '../lib/notifications/useNotifications';
import { NotificationContainer } from '@/components/notifications/NotificationContainer';

interface NotificationContextType {
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showSuccess: (message: string, options?: Partial<Notification>) => string;
  showError: (message: string, options?: Partial<Notification>) => string;
  showWarning: (message: string, options?: Partial<Notification>) => string;
  showInfo: (message: string, options?: Partial<Notification>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationMethods = useNotifications();

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};