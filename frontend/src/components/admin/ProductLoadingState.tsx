'use client'

import React from 'react';
import { Loader2 } from "lucide-react";

export function ProductLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">Loading Product</h2>
        <p className="text-rose-600 dark:text-rose-400">Fetching product details...</p>
      </div>
    </div>
  );
}
