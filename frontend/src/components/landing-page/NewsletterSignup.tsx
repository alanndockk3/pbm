// components/landing-page/NewsletterSignup.tsx
'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Gift, 
  Star, 
  Sparkles, 
  Check,
  Heart
} from "lucide-react";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubscribed(true);
    setIsSubmitting(false);
    setEmail('');
  };

  if (isSubscribed) {
    return (
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-4">
              Welcome to the Family! 🎉
            </h3>
            <p className="text-rose-700 dark:text-rose-300 mb-6">
              Thank you for joining our community of handmade enthusiasts. 
              Your 15% discount code is on its way to your inbox!
            </p>
            <div className="bg-white/60 dark:bg-rose-900/30 rounded-lg p-4 inline-block">
              <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">
                Your exclusive code:
              </p>
              <p className="text-lg font-mono font-bold text-rose-900 dark:text-rose-100">
                WELCOME15
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/30 dark:bg-pink-800/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-rose-200/30 dark:bg-rose-800/20 rounded-full blur-xl"></div>
      </div>

      <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white/90 dark:bg-rose-900/30 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative top border */}
        <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500"></div>
        
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Exclusive Insider Access
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-4">
              Join Our Craft Community
            </h2>
            
            <p className="text-lg text-rose-700 dark:text-rose-300 max-w-2xl mx-auto mb-8">
              Be the first to see new creations, get exclusive discounts, and receive 
              behind-the-scenes insights into the crafting process.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-rose-900 dark:text-rose-100 text-sm">
                  15% Off Welcome Gift
                </h4>
                <p className="text-rose-600 dark:text-rose-400 text-xs">
                  Instant discount on your first order
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-rose-900 dark:text-rose-100 text-sm">
                  Early Access
                </h4>
                <p className="text-rose-600 dark:text-rose-400 text-xs">
                  See new collections before anyone else
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-rose-900 dark:text-rose-100 text-sm">
                  Craft Stories
                </h4>
                <p className="text-rose-600 dark:text-rose-400 text-xs">
                  Behind-the-scenes crafting content
                </p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-rose-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-11 pr-4 py-3 border-2 border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Joining...
                  </div>
                ) : (
                  'Join Now'
                )}
              </Button>
            </div>
            
            <p className="text-xs text-rose-500 dark:text-rose-500 text-center mt-4">
              No spam, just beautiful handmade updates. Unsubscribe anytime.
            </p>
          </form>

          {/* Social Proof */}
          <div className="text-center mt-8 pt-6 border-t border-rose-200 dark:border-rose-700">
            <div className="flex items-center justify-center gap-4 text-sm text-rose-600 dark:text-rose-400">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full border-2 border-white dark:border-rose-900"
                    ></div>
                  ))}
                </div>
                <span className="ml-2">250+ members</span>
              </div>
              <div className="w-px h-4 bg-rose-300 dark:bg-rose-700"></div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.9/5 satisfaction</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};