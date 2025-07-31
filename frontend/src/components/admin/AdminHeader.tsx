// components/admin/AdminHeader.tsx
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface AdminHeaderProps {
  onAddProduct: () => void;
  isLoading?: boolean;
}

export function AdminHeader({ onAddProduct, isLoading }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Admin Dashboard</h1>
          <p className="text-rose-600 dark:text-rose-400">Manage your handmade products</p>
        </div>
      </div>
      
    </div>
  );
}