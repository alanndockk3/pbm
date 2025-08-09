import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Heart, 
  Sparkles, 
  Gift, 
  Star,
  Scissors,
  Palette
} from "lucide-react";

export default function EnhancedHeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 relative overflow-hidden">
      
      {/* Floating Craft Elements - Enhanced */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Yarn Balls */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full opacity-25 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-rose-300 to-rose-400 rounded-full opacity-15 animate-float-slow"></div>
        
        {/* Fabric Swatches */}
        <div className="absolute top-32 right-32 w-24 h-16 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg opacity-20 rotate-12 animate-sway"></div>
        <div className="absolute bottom-32 right-16 w-20 h-14 bg-gradient-to-r from-rose-200 to-pink-200 rounded-lg opacity-25 -rotate-6 animate-sway-delayed"></div>
        
        {/* Thread Spools */}
        <div className="absolute top-1/3 left-32 w-8 h-12 bg-gradient-to-b from-purple-300 to-purple-400 rounded-full opacity-20 animate-bob"></div>
        <div className="absolute bottom-1/3 right-40 w-6 h-10 bg-gradient-to-b from-pink-300 to-pink-400 rounded-full opacity-25 animate-bob-delayed"></div>
        
        {/* Decorative Dots Pattern */}
        <div className="absolute top-1/4 left-1/4 grid grid-cols-3 gap-2 opacity-10">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-rose-400 rounded-full"></div>
          ))}
        </div>
        
        {/* Stitch Pattern */}
        <div className="absolute bottom-1/4 right-1/4">
          <svg width="80" height="40" className="opacity-10 stroke-pink-400">
            <path d="M10,20 Q25,5 40,20 Q55,35 70,20" fill="none" strokeWidth="2" strokeDasharray="3,3"/>
            <path d="M10,25 Q25,10 40,25 Q55,40 70,25" fill="none" strokeWidth="2" strokeDasharray="3,3"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg relative">
            <Heart className="w-6 h-6 text-white" />
            {/* Sparkle effect */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-rose-800 dark:text-rose-200 tracking-wide">PBM</h1>
            <p className="text-sm text-rose-600 dark:text-rose-300 font-medium">Pretties by Marg</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 font-medium"
          >
            Login
          </Button>
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
            Sign Up
          </Button>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="container mx-auto px-4 py-32 text-center relative z-10">
        
        {/* Handcrafted Badge with Animation */}
        <div className="relative inline-block mb-8">
          <Badge variant="secondary" className="px-6 py-3 bg-white/80 backdrop-blur-sm text-pink-800 border border-pink-200 shadow-lg text-base font-medium">
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            Handcrafted with Love
          </Badge>
          {/* Decorative elements around badge */}
          <div className="absolute -top-2 -left-2 w-4 h-4 text-pink-400 animate-spin-slow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-3 h-3 text-purple-400 animate-bounce">
            <Heart className="w-3 h-3" />
          </div>
        </div>
        
        {/* Main Headline with Enhanced Typography */}
        <div className="relative mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-rose-900 dark:text-rose-100 mb-6 leading-tight">
            <span className="relative inline-block">
              Beautiful
              {/* Underline decoration */}
              <svg className="absolute -bottom-2 left-0 right-0 h-3" viewBox="0 0 300 12" fill="none">
                <path d="M10,8 Q150,2 290,8" stroke="currentColor" strokeWidth="2" className="text-pink-400 opacity-50"/>
              </svg>
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 relative">
              Handmade
              {/* Decorative dots */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </span>
            <br />
            <span className="relative">
              Treasures
              {/* Stitch effect */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-40"></div>
            </span>
          </h1>
        </div>
        
        {/* Enhanced Description with Visual Elements */}
        <div className="relative max-w-3xl mx-auto mb-12">
          <p className="text-xl text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
            Discover unique, lovingly crafted items that bring 
            <span className="relative inline-block mx-2">
              <span className="text-pink-600 font-semibold">warmth</span>
              <Heart className="w-4 h-4 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
            </span>
            and beauty to your home.
            <br />
            Each piece is made with care, attention to detail, and a touch of 
            <span className="relative inline-block">
              <span className="text-purple-600 font-semibold">magic</span>
              <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1 animate-bounce" />
            </span>
            .
          </p>
        </div>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-10 py-6 text-xl shadow-2xl hover:shadow-pink-200 dark:hover:shadow-pink-900/20 transition-all duration-300 transform hover:scale-105 font-semibold group"
          >
            Start Shopping
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-rose-300 bg-white/80 backdrop-blur-sm text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/20 px-10 py-6 text-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold group"
          >
            <Palette className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            Browse Gallery
          </Button>
        </div>

        {/* Enhanced Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-12 text-rose-600 dark:text-rose-400">
          <div className="flex items-center gap-3 bg-white/60 dark:bg-rose-900/30 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="relative">
              <Heart className="w-6 h-6 text-pink-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-300 rounded-full animate-ping"></div>
            </div>
            <span className="font-semibold text-lg">500+ Happy Customers</span>
          </div>
          <div className="flex items-center gap-3 bg-white/60 dark:bg-rose-900/30 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
              ))}
            </div>
            <span className="font-semibold text-lg">4.9 Star Reviews</span>
          </div>
          <div className="flex items-center gap-3 bg-white/60 dark:bg-rose-900/30 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <Gift className="w-6 h-6 text-purple-500 animate-bounce" />
            <span className="font-semibold text-lg">Custom Orders Welcome</span>
          </div>
        </div>

        {/* Decorative Elements at Bottom */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4 opacity-30">
          <div className="w-12 h-2 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full"></div>
          <div className="w-8 h-2 bg-gradient-to-r from-purple-300 to-rose-300 rounded-full"></div>
          <div className="w-16 h-2 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full"></div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(12deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes sway-delayed {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bob-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-sway { animation: sway 4s ease-in-out infinite; }
        .animate-sway-delayed { animation: sway-delayed 5s ease-in-out infinite; }
        .animate-bob { animation: bob 3s ease-in-out infinite; }
        .animate-bob-delayed { animation: bob-delayed 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}