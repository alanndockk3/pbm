'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface ProductErrorStateProps {
  error: string | null;
}

export function ProductErrorState({ error }: ProductErrorStateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
      <div className="text-center">
        <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">Product Not Found</h2>
        <p className="text-rose-600 dark:text-rose-400 mb-4">
          {error || 'The product you are looking for does not exist.'}
        </p>
        <Button
          onClick={() => router.push('/admin/products')}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
        >
          Back to Products
        </Button>
      </div>
    </div>
  );
}
