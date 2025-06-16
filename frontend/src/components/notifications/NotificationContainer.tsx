// components/notifications/NotificationContainer.tsx
import React from 'react';
import { NotificationAlert } from './NotificationAlert';
import { useNotifications } from '../../../lib/notifications/useNotifications';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out animate-in slide-in-from-right-full"
        >
          <NotificationAlert
            notification={notification}
            onRemove={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};