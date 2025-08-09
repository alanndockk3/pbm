import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const HeroBadge = () => {
  return (
    <div className="relative inline-flex items-center justify-center mb-8">
      {/* Main badge */}
      <Badge className="px-8 py-4 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-md text-pink-700 border-2 border-pink-200/50 shadow-2xl hover:shadow-pink-200/40 transition-all duration-500 text-lg font-semibold tracking-wide group">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-pink-500 group-hover:rotate-12 transition-transform duration-300" />
            {/* Animated sparkle */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
          </div>
          <span className="relative">
            Handcrafted with Love
            {/* Subtle underline animation */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 group-hover:w-full transition-all duration-500"></div>
          </span>
        </div>
      </Badge>
      
      {/* Floating decorative elements */}
      <div className="absolute -top-3 -left-3 w-6 h-6 text-pink-300 animate-float-slow opacity-60">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      
      <div className="absolute -bottom-2 -right-2 w-4 h-4 text-purple-400 animate-bounce opacity-70">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(5deg); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};