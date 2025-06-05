'use client'

import { ProtectedRoute } from '../../../lib/auth/ProtectedRoute';
import { AdminNavigation } from '@/components/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="flex">
          {/* Admin Sidebar */}
          <aside className="w-64 bg-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PBM</span>
                </div>
                <h2 className="text-xl font-bold text-rose-800">Admin Panel</h2>
              </div>
              <AdminNavigation />
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}