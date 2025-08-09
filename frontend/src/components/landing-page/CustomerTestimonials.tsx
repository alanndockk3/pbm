// components/landing-page/CustomerTestimonials.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight, Heart } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Seattle, WA",
    rating: 5,
    text: "The handmade scarf I ordered is absolutely gorgeous! The attention to detail and quality of materials is outstanding. I've received so many compliments.",
    product: "Handwoven Winter Scarf",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Portland, OR",
    rating: 5,
    text: "Ordered a custom piece for my wife's birthday and it exceeded all expectations. The craftsmanship is incredible and the personal touch made it so special.",
    product: "Custom Jewelry Box",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    location: "Austin, TX",
    rating: 5,
    text: "I've been a customer for over a year now and every single piece I've purchased has been perfect. The love and care put into each item really shows.",
    product: "Ceramic Dinnerware Set",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Denver, CO",
    rating: 5,
    text: "Fast shipping, beautiful packaging, and the quality is amazing. This is definitely my go-to place for unique, handmade gifts.",
    product: "Knitted Baby Blanket",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Lisa Park",
    location: "San Francisco, CA",
    rating: 5,
    text: "The custom embroidery work was exactly what I envisioned. Margaret is so talented and really listens to what you want. Highly recommended!",
    product: "Custom Embroidered Pillow",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  }
];

export const CustomerTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance testimonials
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="container mx-auto px-4 py-20 relative">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-pink-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100">
            Love from Our Customers
          </h2>
          <Heart className="w-6 h-6 text-pink-500" />
        </div>
        <p className="text-lg text-rose-700 dark:text-rose-300 max-w-2xl mx-auto">
          See what our wonderful customers have to say about their handmade treasures
        </p>
      </div>

      {/* Main Testimonial Card */}
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-rose-900/30 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative quote background */}
          <div className="absolute top-6 left-6 opacity-10">
            <Quote className="w-20 h-20 text-pink-500" />
          </div>
          
          <CardContent className="p-8 md:p-12 relative">
            {/* Stars */}
            <div className="flex justify-center mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl md:text-2xl text-rose-900 dark:text-rose-100 text-center leading-relaxed mb-8 font-medium">
              "{currentTestimonial.text}"
            </blockquote>

            {/* Customer Info */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={currentTestimonial.avatar} 
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full border-4 border-pink-200 dark:border-pink-800"
                />
                <div className="text-center md:text-left">
                  <h4 className="font-semibold text-rose-900 dark:text-rose-100 text-lg">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-rose-600 dark:text-rose-400">
                    {currentTestimonial.location}
                  </p>
                </div>
              </div>
              
              <div className="hidden md:block w-px h-12 bg-rose-300 dark:bg-rose-700"></div>
              
              <div className="text-center">
                <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Purchased</p>
                <p className="font-medium text-rose-900 dark:text-rose-100">
                  {currentTestimonial.product}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-center mt-8 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Dots indicator */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-pink-500 w-8' 
                    : 'bg-rose-300 dark:bg-rose-700 hover:bg-pink-400'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-4">
          <p className="text-xs text-rose-500 dark:text-rose-500">
            {isAutoPlaying ? 'Auto-advancing every 5 seconds' : 'Auto-advance paused'}
          </p>
        </div>
      </div>
    </section>
  );
};