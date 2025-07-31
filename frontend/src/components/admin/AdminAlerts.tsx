// components/admin/AdminAlerts.tsx
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface AdminAlertsProps {
  successMessage?: string | null;
  errorMessage?: string | null;
  onClearSuccess?: () => void;
  onClearError?: () => void;
}

export function AdminAlerts({
  successMessage,
  errorMessage,
  onClearSuccess,
  onClearError,
}: AdminAlertsProps) {
  if (!successMessage && !errorMessage) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
            {onClearSuccess && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearSuccess}
                className="text-green-600 hover:text-green-800 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
            </div>
            {onClearError && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearError}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}