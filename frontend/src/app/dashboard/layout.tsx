"use client"

import React from 'react';
import { AuthWrapper } from '../../../lib/auth/AuthWrapper';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthWrapper>
      {children}
    </AuthWrapper>
  );
}