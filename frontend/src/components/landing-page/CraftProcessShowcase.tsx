// components/landing-page/CraftProcessShowcase.tsx
'use client'

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Scissors, 
  Palette, 
  Package, 
  Clock,
  ArrowRight
} from "lucide-react";

const processSteps = [
  {
    id: 1,
    title: "Inspiration",
    description: "Every piece begins with a spark of creativity and inspiration from nature, art, or customer requests.",
    icon: Lightbulb,
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    time: "Day 1"
  },
  {
    id: 2,
    title: "Design & Planning",
    description: "Careful sketching and material selection ensures each piece will be both beautiful and functional.",
    icon: Palette,
    color: "from-purple-400 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
    time: "Day 2-3"
  },
  {
    id: 3,
    title: "Handcrafting",
    description: "The magic happens here - hours of careful, meticulous work with traditional tools and techniques.",
    icon: Scissors,
    color: "from-blue-400 to-purple-500",
    bgColor: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop",
    time: "Day 4-10"
  },
  {
    id: 4,
    title: "Quality & Packaging",
    description: "Final touches, quality checks, and beautiful eco-friendly packaging ready for your doorstep.",
    icon: Package,
    color: "from-green-400 to-teal-500",
    bgColor: "from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20",
    image: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=400&h=300&fit=crop",
    time: "Day 11-12"
  }
];

export const CraftProcessShowcase = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="container mx-auto px-4 py-20 relative">
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
          <Clock className="w-4 h-4 mr-2" />
          Behind the Scenes
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-4">
          From Inspiration to Your Hands
        </h2>
        <p className="text-lg text-rose-700 dark:text-rose-300 max-w-3xl mx-auto">
          See how each handmade treasure comes to life through our careful, time-honored process. 
          Every step is infused with passion and attention to detail.
        </p>
      </div>

      {/* Process Steps - Mobile: Vertical, Desktop: Horizontal */}
      <div className="max-w-6xl mx-auto">
        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-12 relative">
            {/* Connection Line */}
            <div className="absolute top-8 left-16 right-16 h-0.5 bg-gradient-to-r from-pink-300 via-purple-300 to-rose-300 dark:from-pink-600 dark:via-purple-600 dark:to-rose-600"></div>
            
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`
                    w-16 h-16 rounded-full bg-gradient-to-br ${step.color} 
                    flex items-center justify-center shadow-lg relative z-10
                    transition-all duration-300 group-hover:scale-110
                    ${activeStep === index ? 'scale-110 shadow-xl' : ''}
                  `}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      activeStep === index 
                        ? 'text-rose-900 dark:text-rose-100' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-rose-500 dark:text-rose-500 mt-1">
                      {step.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Step Details */}
          <Card className={`border-0 shadow-xl bg-gradient-to-br ${processSteps[activeStep].bgColor} transition-all duration-500`}>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${processSteps[activeStep].color} flex items-center justify-center`}>
                      {React.createElement(processSteps[activeStep].icon, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                        {processSteps[activeStep].title}
                      </h3>
                      <p className="text-rose-600 dark:text-rose-400">
                        {processSteps[activeStep].time}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg text-rose-700 dark:text-rose-300 leading-relaxed">
                    {processSteps[activeStep].description}
                  </p>
                </div>
                <div className="relative">
                  <img 
                    src={processSteps[activeStep].image} 
                    alt={processSteps[activeStep].title}
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-6">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.id} className={`border-0 shadow-lg bg-gradient-to-br ${step.bgColor}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">
                          {step.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-rose-700 dark:text-rose-300 mb-4">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      {/* <div className="text-center mt-16">
        <div className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
          <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-4">
            Ready to Own Something Special?
          </h3>
          <p className="text-rose-700 dark:text-rose-300 mb-6">
            Join our community of craft lovers and experience the joy of owning truly unique, handmade treasures.
          </p>
          <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400">
            <span className="font-medium">Start your journey</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div> */}
    </section>
  );
};