// components/ui/Message.tsx
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface MessageProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

const Message = React.memo(({ 
  type, 
  message, 
  onClose 
}: MessageProps) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  const borderColor = isSuccess ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
  const textColor = isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
  const iconColor = isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`mb-6 p-4 ${bgColor} border ${borderColor} rounded-lg flex items-center gap-3`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className={textColor}>{message}</span>
      {onClose && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className={`ml-auto ${isSuccess ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
});

Message.displayName = 'Message';

export default Message;