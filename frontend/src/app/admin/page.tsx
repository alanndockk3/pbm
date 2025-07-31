// app/admin/page.tsx
'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Star,
  Eye,
  Edit,
  Plus,
  BarChart3,
  FileText,
  Settings2,
  LogOut
} from "lucide-react";
import { useAuthStore } from '../../../lib/auth/useAuthStore';
import { useProductStore, useProducts, useProductLoading } from '../../../lib/product/useProductStore';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuthStore();
  
  // Product store for stats
  const { initializeProducts } = useProductStore();
  const products = useProducts();
  const productLoading = useProductLoading();

  // Initialize products for stats
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  // Loading state
  if (authLoading || productLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Auth guard
  if (!user || user.role !== 'admin') {
    return null;
  }

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active !== false).length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const outOfStockProducts = products.filter(p => !p.inStock).length;

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                Admin Dashboard
              </h1>
              <p className="text-rose-600 dark:text-rose-400">
                Welcome back, {user.displayName || 'Admin'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Administrator
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Products</p>
                  <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Active Products</p>
                  <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{activeProducts}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Featured</p>
                  <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{featuredProducts}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Out of Stock</p>
                  <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{outOfStockProducts}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Main Content */}
      <section className="mb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push('/admin/products')}
                className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <Package className="w-4 h-4 mr-3" />
                Manage Products
              </Button>
              <Button
                onClick={() => router.push('/admin/products?action=add')}
                variant="outline"
                className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <Plus className="w-4 h-4 mr-3" />
                Add New Product
              </Button>
              <Button
                onClick={() => router.push('/admin/orders')}
                variant="outline"
                className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <ShoppingCart className="w-4 h-4 mr-3" />
                View Orders
              </Button>
              <Button
                onClick={() => router.push('/admin/analytics')}
                variant="outline"
                className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity / System Status */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                System Overview
              </CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400">
                Current system status and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    All systems operational
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Database connected
                  </span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Active
                </Badge>
              </div>

              {outOfStockProducts > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      {outOfStockProducts} products out of stock
                    </span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Attention
                  </Badge>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={() => router.push('/admin/products?filter=outOfStock')}
                  variant="outline"
                  size="sm"
                  className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Review Out of Stock Items
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card 
            className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => router.push('/admin/products')}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Product Management</CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400">
                Add, edit, and manage your product catalog
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow duration-300 opacity-50"
            onClick={() => {
              // Future feature
              alert('Orders management coming soon!');
            }}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Order Management</CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400">
                Process and track customer orders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow duration-300 opacity-50"
            onClick={() => {
              // Future feature
              alert('Analytics coming soon!');
            }}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Analytics & Reports</CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400">
                View sales data and performance metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </>
  );
}