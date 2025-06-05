// app/dashboard/layout.tsx
'use client'

import { CustomerNavigation } from '@/components/CustomerNavigation';
import { ProtectedRoute } from '../../../lib/auth/ProtectedRoute';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="customer">
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        {/* Header
        <header className="bg-white shadow-sm border-b border-rose-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PBM</span>
                </div>
                <h1 className="text-xl font-bold text-rose-800">Customer Dashboard</h1>
              </div>
              <CustomerNavigation />
            </div>
          </div>
        </header> */}
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}