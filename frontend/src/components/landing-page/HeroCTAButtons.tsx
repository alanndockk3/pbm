import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Sparkles } from "lucide-react";

export const HeroCTAButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
      {/* Primary CTA Button */}
      <div className="relative group">
        <Button 
          size="lg" 
          className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 text-white px-12 py-7 text-xl font-bold shadow-2xl hover:shadow-pink-300/40 dark:hover:shadow-pink-900/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 rounded-2xl border-2 border-white/20 backdrop-blur-sm overflow-hidden"
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative flex items-center gap-3">
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Start Shopping</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        </Button>
        
        {/* Floating particles around primary button */}
        <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-60"></div>
        <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-pink-300 rounded-full animate-bounce opacity-70"></div>
      </div>
      
      {/* Secondary CTA Button */}
      <div className="relative group">
        <Button 
          variant="outline" 
          size="lg" 
          className="relative border-3 border-rose-300 hover:border-rose-400 bg-white/80 hover:bg-white/90 backdrop-blur-md text-rose-700 hover:text-rose-800 px-12 py-7 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 rounded-2xl overflow-hidden"
        >
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50/0 via-pink-50/30 to-pink-50/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative flex items-center gap-3">
            <Palette className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300 text-purple-600" />
            <span>Browse Gallery</span>
          </div>
        </Button>
        
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-4 h-4 text-purple-400 opacity-50 animate-spin-slow">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};