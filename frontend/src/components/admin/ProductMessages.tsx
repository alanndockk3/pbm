'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface ProductMessagesProps {
  successMessage: string | null;
  adminError: string | null;
  onClearError: () => void;
}

export function ProductMessages({
  successMessage,
  adminError,
  onClearError
}: ProductMessagesProps) {
  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {adminError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {adminError}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearError}
            className="text-red-700 hover:bg-red-200"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );
}
