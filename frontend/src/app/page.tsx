// app/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Heart, 
  Sparkles, 
  Gift, 
  Scissors, 
  Palette, 
  Star
} from "lucide-react";
import { LoginModal } from '@/components/login-modal';
import { SignupModal } from '@/components/signup-modal';
import { ForgotPasswordModal } from '@/components/forgot-password-modal';
import { ComingSoonModal } from '@/components/coming-soon-modal';
import { useAuthStore } from '../../lib/auth/useAuthStore';
import { useProductStore, useFeaturedProducts } from '../../lib/product/useProductStore';
import { ProductCard } from '@/components/product/ProductCard';
import LandingFooter from '@/components/LandingFooter';


import { FloatingCraftElements } from '@/components/landing-page/FloatingCraftElements';
import { CustomerTestimonials } from '@/components/landing-page/CustomerTestimonials';
import { CraftProcessShowcase } from '@/components/landing-page/CraftProcessShowcase';
import { ArtisanStorySection } from '@/components/landing-page/ArtisanStorySection';
import { NewsletterSignup } from '@/components/landing-page/NewsletterSignup';
import { PreviousCreationsShowcase } from '@/components/landing-page/PreviousCreationsShowcase';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const initializeProducts = useProductStore(state => state.initializeProducts);
  const featuredProducts = useFeaturedProducts();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    initializeProducts();
    setHasMounted(true);
  }, [initializeProducts]);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenForgotPassword = () => {
    setIsLoginOpen(false);
    setIsForgotPasswordOpen(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPasswordOpen(false);
    setIsLoginOpen(true);
  };

  const handleProductAction = () => {
    setIsSignupOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  // Skeleton component
  const ProductSkeleton = () => (
    <div className="rounded-xl shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 relative">
      
      {/* Floating Craft Elements */}
      <FloatingCraftElements />

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
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
          <Button 
            variant="ghost" 
            className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100"
            onClick={() => setIsLoginOpen(true)}
          >
            Login
          </Button>
          <Button 
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
            onClick={() => setIsSignupOpen(true)}
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Handcrafted with Love
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-rose-900 dark:text-rose-100 mb-6 leading-tight">
              Beautiful
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600"> Handmade</span>
              <br />
              Treasures
            </h1>
            
            <p className="text-lg text-rose-700 dark:text-rose-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover unique, lovingly crafted items that bring warmth and beauty to your home. 
              Each piece is made with care, attention to detail, and a touch of magic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg"
                onClick={() => setIsSignupOpen(true)}
              >
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900 px-8 py-6 text-lg"
                onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Gallery
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-rose-600 dark:text-rose-400">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span>50+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>5 Star Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                <span>Custom Orders Welcome</span>
              </div>
            </div>
        </div>
      </section>
      

      {/* Featured Products Section */}
      <section id="featured-products" className="container mx-auto px-4 py-22 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-4">
            Featured Handmade Treasures
          </h2>
          <p className="text-lg text-rose-700 dark:text-rose-300 max-w-2xl mx-auto">
            Discover our most beloved creations. Each piece tells a unique story and brings warmth to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {!hasMounted ? (
            [...Array(6)].map((_, i) => (
              <ProductSkeleton key={`skeleton-${i}`} />
            ))
          ) : featuredProducts.length === 0 ? (
            [...Array(6)].map((_, i) => (
              <ProductSkeleton key={`loading-${i}`} />
            ))
          ) : (
            featuredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onViewClick={handleProductAction}
                onPurchaseClick={handleProductAction}
                purchaseButtonText="Sign Up to Purchase"
                showQuantity={false}
                disabled={!user}
              />
            ))
          )}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900 px-8 py-4 text-lg"
            onClick={() => router.push('/products')}
          >
            View All Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Artisan Story Section */}
      <ArtisanStorySection />

      {/* Craft Process Showcase */}
      <CraftProcessShowcase />

      {/* Customer Testimonials -- Add Later With Reviews*/}
      {/* <CustomerTestimonials /> */}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-4">
            Why Choose Our Handmade Crafts?
          </h2>
          <p className="text-lg text-rose-700 dark:text-rose-300 max-w-2xl mx-auto">
            Every item is crafted with passion, creativity, and attention to detail that makes each piece truly special.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center mb-4">
                <Scissors className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Handcrafted Quality</CardTitle>
              <CardDescription className="text-rose-700 dark:text-rose-300">
                Each item is carefully handmade using premium materials and traditional techniques passed down through generations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Custom Creations</CardTitle>
              <CardDescription className="text-rose-700 dark:text-rose-300">
                Have something special in mind? We love creating custom pieces tailored to your vision and style.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-800 dark:to-rose-700 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Made with Love</CardTitle>
              <CardDescription className="text-rose-700 dark:text-rose-300">
                Every stitch, every detail is infused with care and passion, making each piece a labor of love.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Newsletter Signup */}
      {/* <NewsletterSignup /> */}

      {/* Footer */}
      <LandingFooter />

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={handleSwitchToSignup}
        onOpenForgotPassword={handleOpenForgotPassword}
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={handleBackToLogin}
      />
      {/* <ComingSoonModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)}
        title="New Feature Coming Soon"
        description="We're building an amazing new dashboard experience!"
      /> */}
    </div>
  );
}