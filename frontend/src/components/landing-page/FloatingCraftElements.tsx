// components/landing-page/FloatingCraftElements.tsx
'use client'

import React from 'react';
import { 
  Scissors, 
  Palette, 
  Heart, 
  Flower, 
  Sparkles,
  Star,
  Circle
} from "lucide-react";

export const FloatingCraftElements = () => {
  return (
    <>
      {/* Floating craft icons with subtle animations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top left area */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <Scissors className="w-8 h-8 text-pink-300/30 dark:text-pink-600/20 rotate-12" />
        </div>
        
        <div className="absolute top-40 left-32 animate-float-medium">
          <Palette className="w-6 h-6 text-purple-300/40 dark:text-purple-600/30 -rotate-6" />
        </div>

        {/* Top right area */}
        <div className="absolute top-32 right-20 animate-float-fast">
          <Heart className="w-7 h-7 text-rose-300/35 dark:text-rose-600/25 rotate-45" />
        </div>
        
        <div className="absolute top-16 right-40 animate-float-slow">
          <Flower className="w-5 h-5 text-pink-400/30 dark:text-pink-700/20 rotate-12" />
        </div>

        {/* Middle left */}
        <div className="absolute top-1/3 left-16 animate-float-medium">
          <Sparkles className="w-6 h-6 text-yellow-300/40 dark:text-yellow-600/30 -rotate-12" />
        </div>

        {/* Middle right */}
        <div className="absolute top-1/2 right-12 animate-float-slow">
          <Star className="w-8 h-8 text-amber-300/30 dark:text-amber-600/20 rotate-6" />
        </div>

        {/* Bottom area */}
        <div className="absolute bottom-40 left-20 animate-float-fast">
          <Circle className="w-4 h-4 text-purple-400/35 dark:text-purple-700/25" />
        </div>
        
        <div className="absolute bottom-32 right-32 animate-float-medium">
          <Heart className="w-5 h-5 text-rose-400/40 dark:text-rose-700/30 -rotate-12" />
        </div>

        <div className="absolute bottom-20 left-1/3 animate-float-slow">
          <Sparkles className="w-7 h-7 text-pink-300/30 dark:text-pink-600/20 rotate-24" />
        </div>
      </div>

      {/* Custom CSS for floating animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};