import React from 'react';
import { Heart, Sparkles } from "lucide-react";

export const HeroDescription = () => {
  return (
    <div className="relative max-w-4xl mx-auto mb-14">
      <div className="relative bg-white/40 dark:bg-rose-900/20 backdrop-blur-sm rounded-3xl px-8 py-6 border border-white/30 shadow-xl">
        <p className="text-xl md:text-2xl text-rose-700 dark:text-rose-300 leading-relaxed font-medium text-center">
          <span className="text-rose-800 dark:text-rose-200">Discover unique, lovingly crafted items</span> that bring{' '}
          <span className="relative inline-flex items-center mx-1">
            <span className="text-pink-600 font-semibold bg-pink-50 dark:bg-pink-900/30 px-2 py-1 rounded-lg">
              warmth
            </span>
            <Heart className="w-4 h-4 text-pink-500 ml-1 animate-pulse" />
          </span>{' '}
          and beauty to your home.
          <br className="hidden md:block" />
          <span className="text-rose-800 dark:text-rose-200">Each piece is made with care, attention to detail, and a touch of</span>{' '}
          <span className="relative inline-flex items-center mx-1">
            <span className="text-purple-600 font-semibold bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
              magic
            </span>
            <Sparkles className="w-4 h-4 text-purple-500 ml-1 animate-bounce" />
          </span>.
        </p>
        
        {/* Decorative corner elements */}
        <div className="absolute top-3 left-3 w-3 h-3 bg-pink-300 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-3 right-3 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-3 left-3 w-2 h-2 bg-rose-300 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="craft-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" className="text-pink-500"/>
                <path d="M5,10 L15,10 M10,5 L10,15" stroke="currentColor" strokeWidth="0.5" className="text-purple-500"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#craft-pattern)"/>
          </svg>
        </div>
      </div>
      
      {/* Floating decorative elements around description */}
      <div className="absolute -top-6 -left-6 w-8 h-8 text-pink-300 opacity-30 animate-float-1">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      </div>
      
      <div className="absolute -bottom-4 -right-4 w-6 h-6 text-purple-300 opacity-40 animate-float-2">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-3deg); }
        }
        .animate-float-1 {
          animation: float-1 5s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};