// app/dashboard/legal/terms-of-service/page.tsx
'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from 'lucide-react';
import { TermsOfServiceContent } from '@/components/legal/LegalContent';
import { termsOfServiceData } from '../../../../../data/legalData';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-rose-900 dark:text-rose-100 mb-2">
            Terms of Service
          </h1>
          <p className="text-lg text-rose-600 dark:text-rose-400">
            Pretties by Marg
          </p>
          <p className="text-sm text-rose-500 dark:text-rose-500 mt-2">
            Last updated: {termsOfServiceData.lastUpdated}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm rounded-xl shadow-lg p-8">
            <TermsOfServiceContent />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              variant="outline"
              onClick={() => router.push('/legal/privacy-policy')}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
            >
              View Privacy Policy
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Back to Site
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}