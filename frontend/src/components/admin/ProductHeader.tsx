'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

interface ProductHeaderProps {
  productName: string;
}

export function ProductHeader({ productName }: ProductHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-rose-600 dark:text-rose-400 mb-4">
        <button
          onClick={() => router.push('/admin')}
          className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors"
        >
          Admin
        </button>
        <span>/</span>
        <button
          onClick={() => router.push('/admin/products')}
          className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors"
        >
          Products
        </button>
        <span>/</span>
        <span className="text-rose-900 dark:text-rose-100 font-medium">
          {productName}
        </span>
      </nav>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
            Product Details
          </h1>
          <p className="text-rose-600 dark:text-rose-400">
            Manage and configure product settings
          </p>
        </div>
      </div>
    </div>
  );
}
