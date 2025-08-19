// app/dashboard/legal/terms-of-service/page.tsx
'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Mail, Phone, MapPin } from 'lucide-react';

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
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm rounded-xl shadow-lg p-8">
            <div className="space-y-8 text-sm">
              
              {/* Introduction */}
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-6">
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  Welcome to Pretties by Marg! These Terms of Service govern your use of our website and services. 
                  By using our platform, you agree to these terms. Please read them carefully.
                </p>
              </div>

              {/* 1. Acceptance of Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">1. Acceptance of Terms</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  By accessing and using Pretties by Marg ("PBM"), you accept and agree to be bound by the terms and provisions of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              {/* 2. Products and Services */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">2. Products and Services</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-4">
                  PBM specializes in handmade artisan products including:
                </p>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                  <li>• Handcrafted jewelry and accessories</li>
                  <li>• Home décor and artistic pieces</li>
                  <li>• Textiles, fabrics, and woven goods</li>
                  <li>• Custom commissioned artwork</li>
                  <li>• Seasonal and holiday decorations</li>
                </ul>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-4">
                  All products are made with care, attention to detail, and love. Due to the handmade nature, slight variations in color, size, and design may occur.
                </p>
              </section>

              {/* 3. Orders and Payment */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">3. Orders and Payment</h2>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                  <li>• All orders are subject to product availability and confirmation</li>
                  <li>• Payment is processed securely through Stripe</li>
                  <li>• Prices are displayed in USD and include applicable taxes where required</li>
                  <li>• Custom orders may require additional processing time and a deposit</li>
                  <li>• We reserve the right to refuse or cancel orders at our discretion</li>
                </ul>
              </section>

              {/* 4. Shipping and Delivery */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">4. Shipping and Delivery</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-4">
                  We offer various shipping options with estimated delivery times:
                </p>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                  <li>• Standard Shipping: 5-7 business days</li>
                  <li>• Express Shipping: 2-3 business days</li>
                  <li>• Overnight Shipping: Next business day</li>
                </ul>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-4">
                  Actual delivery times may vary due to weather, holidays, or circumstances beyond our control. 
                  Shipping costs are calculated based on destination and package weight.
                </p>
              </section>

              {/* 5. Returns and Exchanges */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">5. Returns and Exchanges</h2>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                  <li>• Returns accepted within 14 days of delivery for items in original condition</li>
                  <li>• Custom or personalized orders are final sale and cannot be returned</li>
                  <li>• Items must be unworn, unused, and in original packaging</li>
                  <li>• Return shipping costs are the responsibility of the customer unless item was defective</li>
                  <li>• Refunds will be processed within 5-7 business days after receiving returned items</li>
                </ul>
              </section>

              {/* 6. Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">6. Intellectual Property</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  All designs, patterns, photographs, and creative works displayed on this website are the intellectual property of 
                  Pretties by Marg and are protected by copyright laws. Unauthorized reproduction, distribution, or use is strictly prohibited.
                </p>
              </section>

              {/* 7. User Accounts */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">7. User Accounts</h2>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                  <li>• You are responsible for maintaining the confidentiality of your account information</li>
                  <li>• You must provide accurate and complete information when creating an account</li>
                  <li>• You are responsible for all activities that occur under your account</li>
                  <li>• Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              {/* 8. Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">8. Limitation of Liability</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  PBM shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from 
                  the use of our products or services. Our total liability shall not exceed the amount paid for the specific product or service.
                </p>
              </section>

              {/* 9. Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">9. Changes to Terms</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. 
                  Continued use of our services constitutes acceptance of the modified terms.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Contact Information
                </h2>
                <div className="space-y-3 text-rose-700 dark:text-rose-300">
                  <p className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>support@prettiesbymarg.com</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span>(555) 123-PRETTY</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span>Kokomo, Indiana, US</span>
                  </p>
                </div>
              </section>
            </div>
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