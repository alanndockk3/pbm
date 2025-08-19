// app/dashboard/legal/privacy-policy/page.tsx
'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, MapPin } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-rose-900 dark:text-rose-100 mb-2">
            Privacy Policy
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
                  <strong>Effective Date:</strong> {new Date().toLocaleDateString()} | 
                  At Pretties by Marg, we value your privacy and are committed to protecting your personal information. 
                  This policy explains how we collect, use, and safeguard your data.
                </p>
              </div>

              {/* 1. Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">1. Information We Collect</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-rose-700 dark:text-rose-300 mb-3">Personal Information You Provide:</h3>
                  <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                    <li>• Name, email address, and phone number</li>
                    <li>• Shipping and billing addresses</li>
                    <li>• Payment information (processed securely through Stripe)</li>
                    <li>• Account preferences and wishlist items</li>
                    <li>• Communication preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-rose-700 dark:text-rose-300 mb-3">Information Collected Automatically:</h3>
                  <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                    <li>• Browser type and version</li>
                    <li>• IP address and location data</li>
                    <li>• Pages visited and time spent on site</li>
                    <li>• Device information and screen resolution</li>
                    <li>• Referral sources</li>
                  </ul>
                </div>
              </section>

              {/* 2. How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">2. How We Use Your Information</h2>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-3">
                  <li>• <strong>Order Processing:</strong> To fulfill your orders and provide customer service</li>
                  <li>• <strong>Communication:</strong> To send order confirmations, shipping updates, and customer support</li>
                  <li>• <strong>Account Management:</strong> To maintain your account and preferences</li>
                  <li>• <strong>Improvement:</strong> To enhance our website, products, and services</li>
                  <li>• <strong>Marketing:</strong> To send promotional emails (only with your consent)</li>
                  <li>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </section>

              {/* 3. Information Sharing and Disclosure */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">3. Information Sharing and Disclosure</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-4">
                  <strong>We do not sell, trade, or rent your personal information to third parties.</strong> We may share information only in these limited circumstances:
                </p>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-3">
                  <li>• <strong>Service Providers:</strong> With trusted partners who help us operate our business (shipping, payment processing, email services)</li>
                  <li>• <strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                  <li>• <strong>Business Protection:</strong> To protect our rights, property, or safety, or that of our customers</li>
                  <li>• <strong>Business Transfer:</strong> In the event of a merger, acquisition, or asset sale</li>
                </ul>
              </section>

              {/* 4. Data Security */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">4. Data Security</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information:
                </p>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
                  <li>• SSL encryption for data transmission</li>
                  <li>• Secure payment processing through Stripe (PCI DSS compliant)</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Access controls and employee training</li>
                  <li>• Secure cloud storage with Firebase</li>
                </ul>
              </section>

              {/* 5. Cookies and Tracking Technologies */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">5. Cookies and Tracking Technologies</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your browsing experience:
                </p>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-3">
                  <li>• <strong>Essential Cookies:</strong> Required for website functionality and security</li>
                  <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li>• <strong>Analytics Cookies:</strong> Help us understand how you use our website</li>
                  <li>• <strong>Marketing Cookies:</strong> Used for personalized advertising (with consent)</li>
                </ul>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-4">
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              {/* 6. Your Privacy Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">6. Your Privacy Rights</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-3">
                  <li>• <strong>Access:</strong> Request a copy of your personal information</li>
                  <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li>• <strong>Portability:</strong> Request your data in a portable format</li>
                  <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li>• <strong>Restrict Processing:</strong> Limit how we use your information</li>
                </ul>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-4">
                  To exercise these rights, please contact us at privacy@prettiesbymarg.com
                </p>
              </section>

              {/* 7. Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">7. Children's Privacy</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  Our website is not intended for children under 13 years of age. We do not knowingly collect personal information 
                  from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
                </p>
              </section>

              {/* 8. International Users */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">8. International Users</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  Our services are primarily intended for users in the United States. If you access our website from outside the US, 
                  your information may be transferred to, stored, and processed in the United States.
                </p>
              </section>

              {/* 9. Updates to This Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4">9. Updates to This Policy</h2>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or 
                  through a prominent notice on our website. The "Effective Date" at the top indicates when the policy was last updated.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-200 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Contact Us About Privacy
                </h2>
                <p className="text-rose-700 dark:text-rose-300 mb-4">
                  If you have questions or concerns about this Privacy Policy or our data practices:
                </p>
                <div className="space-y-3 text-rose-700 dark:text-rose-300 ml-4">
                  <p className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>privacy@prettiesbymarg.com</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>support@prettiesbymarg.com</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span>Pretties by Marg, Kokomo, Indiana, US</span>
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              variant="outline"
              onClick={() => router.push('/legal/terms-of-service')}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
            >
              View Terms of Service
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