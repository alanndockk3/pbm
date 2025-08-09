import React from 'react';

export const HeroHeadline = () => {
  return (
    <div className="relative mb-10">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
        {/* "Beautiful" with decorative underline */}
        <div className="relative inline-block mb-2">
          <span className="text-rose-900 dark:text-rose-100 relative z-10">
            Beautiful
          </span>
          {/* Hand-drawn style underline */}
          <div className="absolute -bottom-3 left-0 right-0 h-4 overflow-hidden">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 300 20" 
              preserveAspectRatio="none"
            >
              <path 
                d="M10,12 Q80,8 150,10 Q220,12 290,8" 
                stroke="currentColor" 
                strokeWidth="3" 
                fill="none" 
                className="text-pink-300 opacity-60"
                strokeLinecap="round"
              />
              <path 
                d="M15,15 Q85,11 155,13 Q225,15 285,11" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                className="text-rose-300 opacity-40"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        
        <br />
        
        {/* "Handmade" with gradient and decorative elements */}
        <div className="relative inline-block my-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 relative">
            Handmade
          </span>
          
          {/* Decorative stitching pattern */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 opacity-50">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            <div className="w-8 h-px bg-gradient-to-r from-pink-400 to-purple-400"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-8 h-px bg-gradient-to-r from-purple-400 to-rose-400"></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Side decorative elements */}
          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 w-8 h-8 text-pink-300 opacity-40 animate-spin-slow">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1"/>
            </svg>
          </div>
          
          <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-300 opacity-40 animate-bounce">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>
        
        <br />
        
        {/* "Treasures" with elegant styling */}
        <div className="relative inline-block">
          <span className="text-rose-900 dark:text-rose-100 relative">
            Treasures
          </span>
          
          {/* Elegant flourish underneath */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-6 overflow-hidden">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 128 24" 
              preserveAspectRatio="none"
            >
              <path 
                d="M4,20 Q32,12 64,16 Q96,20 124,12" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                className="text-pink-400 opacity-30"
                strokeLinecap="round"
              />
              <circle cx="20" cy="16" r="1.5" fill="currentColor" className="text-pink-400 opacity-50"/>
              <circle cx="64" cy="14" r="1" fill="currentColor" className="text-purple-400 opacity-50"/>
              <circle cx="108" cy="15" r="1.5" fill="currentColor" className="text-rose-400 opacity-50"/>
            </svg>
          </div>
        </div>
      </h1>
      
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg) translateY(-50%); }
          to { transform: rotate(360deg) translateY(-50%); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};