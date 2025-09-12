'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Input } from "../../../../components/ui/input";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  Eye
} from "lucide-react";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../client/firebaseConfig';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  fullName?: string;
  role: string;
  createdAt?: any;
  updatedAt?: any;
  emailVerified: boolean;
  photoURL?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as UserData;
        usersData.push({
          ...data,
          uid: doc.id
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });


  const exportToCSV = () => {
    const headers = ['Email', 'Full Name', 'Role', 'Email Verified', 'Created At', 'Newsletter', 'Notifications'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.fullName || user.displayName || 'N/A',
        user.role,
        user.emailVerified ? 'Yes' : 'No',
        user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
        user.preferences?.newsletter ? 'Yes' : 'No',
        user.preferences?.notifications ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => u.role === 'customer').length,
    verified: users.filter(u => u.emailVerified).length,
    recent: users.filter(u => {
      const date = u.createdAt?.toDate?.();
      return date && date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length
  };

  const getUserInitials = (user: UserData) => {
    const name = user.fullName || user.displayName || user.email?.split('@')[0] || '';
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading User Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                User Management
              </h1>
              <p className="text-rose-600 dark:text-rose-400">
                View user accounts and roles
              </p>
            </div>
            <Button 
              onClick={exportToCSV} 
              className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Users</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Admins</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.admins}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Customers</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.customers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Verified</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.verified}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Recent (7 days)</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.recent}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 flex h-9 w-full rounded-md border border-rose-200 dark:border-rose-700 bg-white dark:bg-rose-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={roleFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('all')}
                  className={`flex-1 sm:flex-none ${
                    roleFilter === 'all' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white' 
                      : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'
                  }`}
                >
                  All Roles
                </Button>
                <Button
                  variant={roleFilter === 'admin' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('admin')}
                  className={`flex-1 sm:flex-none ${
                    roleFilter === 'admin' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white' 
                      : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'
                  }`}
                >
                  Admins
                </Button>
                <Button
                  variant={roleFilter === 'customer' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('customer')}
                  className={`flex-1 sm:flex-none ${
                    roleFilter === 'customer' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white' 
                      : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'
                  }`}
                >
                  Customers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <section className="pb-12">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Users ({filteredUsers.length})</CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400">
                View user accounts and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-rose-700 dark:text-rose-300">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-rose-500 dark:text-rose-400">
                  No users found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.uid}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-rose-200 dark:border-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          {getUserInitials(user)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="font-medium text-rose-900 dark:text-rose-100 truncate">
                              {user.fullName || user.displayName || 'No Name'}
                            </p>
                            {user.emailVerified && (
                              <Badge variant="secondary" className="text-xs w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-rose-600 dark:text-rose-400 truncate">
                            {user.email}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <span className="text-xs text-rose-500 dark:text-rose-400">
                              Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </span>
                            {user.preferences?.newsletter && (
                              <Badge variant="outline" className="text-xs w-fit border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300">
                                Newsletter
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={`flex items-center gap-1 flex-shrink-0 ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                          }`}
                        >
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          {user.role}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="h-8 w-8 p-0 flex-shrink-0 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-rose-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">User Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {getUserInitials(selectedUser)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold truncate text-rose-900 dark:text-rose-100">{selectedUser.fullName || selectedUser.displayName || 'No Name'}</h4>
                      <p className="text-sm text-rose-600 dark:text-rose-400 truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-rose-600 dark:text-rose-400">Role</p>
                      <p className="font-medium text-rose-900 dark:text-rose-100">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-rose-600 dark:text-rose-400">Email Verified</p>
                      <p className="font-medium text-rose-900 dark:text-rose-100">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-rose-600 dark:text-rose-400">Newsletter</p>
                      <p className="font-medium text-rose-900 dark:text-rose-100">{selectedUser.preferences?.newsletter ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-rose-600 dark:text-rose-400">Notifications</p>
                      <p className="font-medium text-rose-900 dark:text-rose-100">{selectedUser.preferences?.notifications ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-rose-600 dark:text-rose-400">Created</p>
                      <p className="font-medium text-rose-900 dark:text-rose-100">
                        {selectedUser.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
