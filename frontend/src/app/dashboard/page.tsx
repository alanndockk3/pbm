'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Sparkles, 
  Gift, 
  User, 
  Package, 
  ShoppingBag, 
  Star,
  Settings,
  LogOut,
  Bell,
  Calendar,
  CreditCard,
  MapPin,
  Plus
} from "lucide-react";
import { useAuthStore } from '../../../lib/auth/useAuthStore';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/')
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">PBM</h1>
            <p className="text-xs text-rose-600 dark:text-rose-300">Pretties by Marg</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Welcome Back
          </Badge>
          
          <h1 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-3">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600">{user?.displayName || 'Beautiful Soul'}</span>!
          </h1>
          
          <p className="text-lg text-rose-700 dark:text-rose-300 max-w-2xl mx-auto">
            Welcome to your personal dashboard. Explore your orders, manage your wishlist, and discover new handmade treasures.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">5</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Orders</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">12</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Wishlist</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-800 dark:to-rose-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">4.8</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Reviews</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">2</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Custom Orders</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Recent Orders</CardTitle>
                    <CardDescription className="text-rose-700 dark:text-rose-300">Your latest purchases</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((order) => (
                <div key={order} className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 dark:bg-rose-800/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-700 dark:to-purple-700 rounded-lg"></div>
                    <div>
                      <p className="font-medium text-rose-900 dark:text-rose-100">Handmade Scarf #{order}</p>
                      <p className="text-xs text-rose-600 dark:text-rose-400">Delivered</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Wishlist */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Wishlist</CardTitle>
                    <CardDescription className="text-rose-700 dark:text-rose-300">Items you love</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-pink-500 fill-current" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-800 dark:to-rose-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Quick Actions</CardTitle>
                  <CardDescription className="text-rose-700 dark:text-rose-300">What would you like to do?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => router.push('dashboard/products')}
              className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
              <Button variant="outline" className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300">
                <Plus className="w-4 h-4 mr-2" />
                Custom Order
              </Button>
              <Button variant="outline" className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300">
                <Gift className="w-4 h-4 mr-2" />
                Gift Cards
              </Button>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Account Management */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-6">Account Management</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Profile</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Manage your personal information</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Addresses</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Manage shipping addresses</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Payment</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Manage payment methods</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Settings</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Preferences and notifications</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-rose-200 dark:border-rose-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-rose-800 dark:text-rose-200">PBM - Pretties by Marg</span>
              <p className="text-xs text-rose-600 dark:text-rose-400">Handcrafted with love since 2024</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm text-rose-600 dark:text-rose-400">
            <a href="#" className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}