// components/admin/AdminStats.tsx
'use client'

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, Star, Filter } from "lucide-react";
import type { StripeProduct } from '../../../lib/product/useProductStore';

interface AdminStatsProps {
  products: StripeProduct[];
}

export function AdminStats({ products }: AdminStatsProps) {
  const totalProducts = products.length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const inStockProducts = products.filter(p => p.inStock !== false).length;
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].length;

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-pink-500',
    },
    {
      label: 'Featured',
      value: featuredProducts,
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      label: 'In Stock',
      value: inStockProducts,
      icon: Package,
      color: 'text-green-500',
    },
    {
      label: 'Categories',
      value: categories,
      icon: Filter,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.label} className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600 dark:text-rose-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{stat.value}</p>
                </div>
                <IconComponent className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}