import React from 'react';
import { Heart, Star, Gift } from "lucide-react";

export const HeroTrustIndicators = () => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
      {/* Happy Customers */}
      <div className="group cursor-pointer">
        <div className="flex items-center gap-4 bg-white/70 dark:bg-rose-900/40 backdrop-blur-lg rounded-2xl px-8 py-5 shadow-xl hover:shadow-2xl border border-white/30 hover:border-pink-200/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-pink-300/50 transition-all duration-300">
              <Heart className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-pink-300 opacity-0 group-hover:opacity-100 animate-ping"></div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-rose-900 dark:text-rose-100 group-hover:text-pink-600 transition-colors duration-300">
              500+
            </div>
            <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              Happy Customers
            </div>
          </div>
        </div>
      </div>

      {/* Star Reviews */}
      <div className="group cursor-pointer">
        <div className="flex items-center gap-4 bg-white/70 dark:bg-rose-900/40 backdrop-blur-lg rounded-2xl px-8 py-5 shadow-xl hover:shadow-2xl border border-white/30 hover:border-yellow-200/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-yellow-300/50 transition-all duration-300">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-2 h-2 text-white fill-current group-hover:animate-pulse transition-transform duration-300" 
                    style={{animationDelay: `${i * 0.1}s`}}
                  />
                ))}
              </div>
            </div>
            {/* Animated sparkles */}
            <div className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 animate-bounce">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-rose-900 dark:text-rose-100 group-hover:text-yellow-600 transition-colors duration-300">
              4.9
            </div>
            <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              Star Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Custom Orders */}
      <div className="group cursor-pointer">
        <div className="flex items-center gap-4 bg-white/70 dark:bg-rose-900/40 backdrop-blur-lg rounded-2xl px-8 py-5 shadow-xl hover:shadow-2xl border border-white/30 hover:border-purple-200/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-purple-300/50 transition-all duration-300">
              <Gift className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            {/* Animated dots */}
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
            <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{animationDelay: '0.5s'}}></div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-rose-900 dark:text-rose-100 group-hover:text-purple-600 transition-colors duration-300">
              Custom
            </div>
            <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              Orders Welcome
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};