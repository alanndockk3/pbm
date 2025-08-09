// components/landing-page/ArtisanStorySection.tsx
'use client'

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Award, 
  Users, 
  Calendar,
  Quote,
  Star,
  ArrowRight
} from "lucide-react";

export const ArtisanStorySection = () => {
  return (
    <section className="container mx-auto px-4 py-20 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Story Content */}
          <div className="order-2 lg:order-1">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              <Heart className="w-4 h-4 mr-2" />
              Meet the Artisan
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-6 leading-tight">
              Hi, I'm Margaret -
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Your Craft Creator
              </span>
            </h2>

            {/* Quote */}
            <div className="relative mb-8">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-pink-300 dark:text-pink-700" />
              <blockquote className="text-lg italic text-rose-700 dark:text-rose-300 pl-6 border-l-4 border-pink-300 dark:border-pink-700">
                "Every thread I weave, every stitch I make, carries a piece of my heart. 
                I believe handmade items aren't just products - they're little pieces of love 
                that bring warmth and joy to people's lives."
              </blockquote>
            </div>

            <div className="prose prose-rose dark:prose-invert max-w-none mb-8">
              <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                What started as a hobby during college has blossomed into a passionate business. 
                For over 8 years, I've been creating handmade treasures from my cozy studio, 
                combining traditional techniques with modern design sensibilities.
              </p>
              <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                Each piece tells a story - sometimes it's inspired by a beautiful sunset, 
                other times by a customer's special request. I love the personal connection 
                that comes with creating something unique just for you.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-white/50 dark:bg-rose-900/20 rounded-lg backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">8+</div>
                <div className="text-sm text-rose-600 dark:text-rose-400">Years</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-rose-900/20 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">500+</div>
                <div className="text-sm text-rose-600 dark:text-rose-400">Happy Customers</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-rose-900/20 rounded-lg backdrop-blur-sm">
                <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">1000+</div>
                <div className="text-sm text-rose-600 dark:text-rose-400">Items Crafted</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-rose-900/20 rounded-lg backdrop-blur-sm">
                <Star className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">4.9</div>
                <div className="text-sm text-rose-600 dark:text-rose-400">Star Rating</div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
            >
              Learn More About My Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Image Gallery */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=500&h=600&fit=crop&crop=face" 
                  alt="Margaret working on a handmade piece"
                  className="w-full h-96 md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Floating badge on image */}
                <div className="absolute bottom-6 left-6">
                  <div className="bg-white/90 dark:bg-rose-900/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-rose-900 dark:text-rose-100">
                        Currently crafting
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl rotate-12 opacity-80 shadow-lg hidden md:block"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-70 shadow-lg hidden md:block"></div>

              {/* Small gallery images */}
              <div className="absolute top-6 -left-6 hidden lg:block">
                <div className="bg-white dark:bg-rose-900 p-2 rounded-lg shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=80&h=80&fit=crop" 
                    alt="Craft workspace"
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              </div>

              <div className="absolute bottom-6 -right-6 hidden lg:block">
                <div className="bg-white dark:bg-rose-900 p-2 rounded-lg shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1615887047859-4ed2cd7b6709?w=80&h=80&fit=crop" 
                    alt="Finished handmade item"
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Touch Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2">
                Personal Touch
              </h3>
              <p className="text-rose-700 dark:text-rose-300 text-sm">
                Every item comes with a handwritten note and is packaged with care, 
                just like a gift from a dear friend.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2">
                Quality Promise
              </h3>
              <p className="text-rose-700 dark:text-rose-300 text-sm">
                If you're not completely happy with your purchase, 
                I'll work with you to make it right. Your satisfaction is my priority.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2">
                Community Love
              </h3>
              <p className="text-rose-700 dark:text-rose-300 text-sm">
                Join our growing community of craft enthusiasts. 
                Share your photos and connect with fellow handmade lovers!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};