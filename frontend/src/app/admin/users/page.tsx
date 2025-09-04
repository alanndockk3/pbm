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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { collection, getDocs, doc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../../client/firebaseConfig';
import { makeUserAdminByUID, removeAdminRole } from '../../../../utils/adminUtils';

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
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

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

  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
      setUpdatingRole(uid);
      
      if (newRole === 'admin') {
        await makeUserAdminByUID(uid);
      } else if (newRole === 'customer') {
        await removeAdminRole(uid);
      }
      
      // Reload users to get updated data
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdatingRole(null);
    }
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Administrative users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">
              Regular customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              Email verified users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('all')}
              >
                All Roles
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('admin')}
              >
                Admins
              </Button>
              <Button
                variant={roleFilter === 'customer' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('customer')}
              >
                Customers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {getUserInitials(user)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {user.fullName || user.displayName || 'No Name'}
                        </p>
                        {user.emailVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </span>
                        {user.preferences?.newsletter && (
                          <Badge variant="outline" className="text-xs">
                            Newsletter
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {user.role === 'customer' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.uid, 'admin')}
                          disabled={updatingRole === user.uid}
                          className="h-8 px-3 text-xs"
                        >
                          {updatingRole === user.uid ? 'Updating...' : 'Make Admin'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.uid, 'customer')}
                          disabled={updatingRole === user.uid}
                          className="h-8 px-3 text-xs"
                        >
                          {updatingRole === user.uid ? 'Updating...' : 'Remove Admin'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getUserInitials(selectedUser)}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedUser.fullName || selectedUser.displayName || 'No Name'}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email Verified</p>
                  <p className="font-medium">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Newsletter</p>
                  <p className="font-medium">{selectedUser.preferences?.newsletter ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Notifications</p>
                  <p className="font-medium">{selectedUser.preferences?.notifications ? 'Yes' : 'No'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">
                    {selectedUser.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
