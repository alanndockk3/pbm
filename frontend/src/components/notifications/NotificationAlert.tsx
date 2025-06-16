// components/notifications/NotificationAlert.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Notification } from '../../../lib/notifications/useNotifications';

interface NotificationAlertProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantMap = {
  success: undefined, // default variant with custom styling
  error: 'destructive' as const,
  warning: undefined, // default variant with custom styling
  info: undefined, // default variant with custom styling
};

const customStyleMap = {
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
  error: '', // Uses destructive variant
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
};

const iconColorMap = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export const NotificationAlert: React.FC<NotificationAlertProps> = ({ notification, onRemove }) => {
  const Icon = iconMap[notification.type];
  const variant = variantMap[notification.type];
  const customStyle = customStyleMap[notification.type];

  return (
    <Alert 
      variant={variant}
      className={`relative pr-12 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out ${customStyle}`}
    >
      <Icon className={`h-4 w-4 ${iconColorMap[notification.type]}`} />
      <div className="flex-1">
        {notification.title && (
          <AlertTitle className="mb-1 font-semibold">
            {notification.title}
          </AlertTitle>
        )}
        <AlertDescription className="text-sm">
          {notification.message}
        </AlertDescription>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="absolute top-3 right-3 opacity-60 hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
};