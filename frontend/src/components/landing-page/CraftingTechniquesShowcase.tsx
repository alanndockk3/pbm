// components/landing-page/CraftingTechniquesShowcase.tsx
'use client'

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Scissors, 
  Palette, 
  Sparkles,
  Clock,
  Award,
  Eye,
  Star,
  Heart
} from "lucide-react";

const techniques = [
  {
    id: 1,
    name: "Hand Embroidery",
    description: "Intricate stitching techniques passed down through generations, creating beautiful patterns and textures.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop",
    difficulty: "Advanced",
    timeRequired: "5-15 hours",
    materials: ["Cotton thread", "Linen fabric", "Embroidery hoops"],
    projects: ["Pillows", "Wall art", "Clothing details"],
    icon: Sparkles,
    color: "from-pink-500 to-rose-500"
  },
  {
    id: 2,
    name: "Weaving",
    description: "Traditional loom weaving to create custom fabrics with unique patterns and textures.",
    image: "https://images.unsplash.com/photo-1615887047859-4ed2cd7b6709?w=500&h=400&fit=crop",
    difficulty: "Intermediate",
    timeRequired: "3-8 hours",
    materials: ["Wool yarn", "Cotton warp", "Natural dyes"],
    projects: ["Scarves", "Table runners", "Blankets"],
    icon: Scissors,
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: 3,
    name: "Knitting",
    description: "Cozy, comfortable pieces created stitch by stitch with careful attention to texture and fit.",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=400&fit=crop",
    difficulty: "Beginner to Advanced",
    timeRequired: "2-20 hours",
    materials: ["Wool yarn", "Bamboo needles", "Stitch markers"],
    projects: ["Sweaters", "Hats", "Baby items"],
    icon: Heart,
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: 4,
    name: "Ceramic Glazing",
    description: "Hand-painted ceramic pieces with custom glazes that create unique, food-safe finishes.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop",
    difficulty: "Advanced",
    timeRequired: "4-12 hours",
    materials: ["Clay bodies", "Custom glazes", "Brushes"],
    projects: ["Mugs", "Bowls", "Decorative pieces"],
    icon: Palette,
    color: "from-orange-500 to-red-500"
  }
];

const difficultyColors = {
  "Beginner to Advanced": "bg-gradient-to-r from-green-500 to-blue-500",
  "Intermediate": "bg-yellow-500",
  "Advanced": "bg-red-500",
  "Beginner": "bg-green-500"
};

export const CraftingTechniquesShowcase = () => {
  const [selectedTechnique, setSelectedTechnique] = useState(0);

  return (
    <section className="container mx-auto px-4 py-20 relative">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
          <Award className="w-4 h-4 mr-2" />
          Master Craftsmanship
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-4">
          Time-Honored Techniques
        </h2>
        <p className="text-lg text-rose-700 dark:text-rose-300 max-w-3xl mx-auto">
          Each piece is created using traditional crafting methods that have been perfected over years of practice. 
          Discover the artistry behind every handmade treasure.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Technique Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/50 dark:bg-rose-900/20 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <div className="flex gap-2">
                {techniques.map((technique, index) => {
                  const Icon = technique.icon;
                  return (
                    <Button
                      key={technique.id}
                      variant={selectedTechnique === index ? "default" : "ghost"}
                      onClick={() => setSelectedTechnique(index)}
                      className={`flex items-center gap-2 px-4 py-3 ${
                        selectedTechnique === index
                          ? `bg-gradient-to-r ${technique.color} text-white shadow-lg`
                          : "text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {technique.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Technique Details */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-rose-900/30 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2">
                {/* Image */}
                <div className="relative">
                  <img 
                    src={techniques[selectedTechnique].image} 
                    alt={techniques[selectedTechnique].name}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  
                  {/* Floating info on image */}
                  <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-rose-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-600" />
                      <span className="text-sm font-medium text-rose-900 dark:text-rose-100">
                        {techniques[selectedTechnique].timeRequired}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${techniques[selectedTechnique].color} flex items-center justify-center`}>
                      {React.createElement(techniques[selectedTechnique].icon, { 
                        className: "w-6 h-6 text-white" 
                      })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                        {techniques[selectedTechnique].name}
                      </h3>
                      <Badge className={`${difficultyColors[techniques[selectedTechnique].difficulty as keyof typeof difficultyColors]} text-white text-xs`}>
                        {techniques[selectedTechnique].difficulty}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-rose-700 dark:text-rose-300 mb-6 leading-relaxed">
                    {techniques[selectedTechnique].description}
                  </p>

                  {/* Materials */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-rose-900 dark:text-rose-100 mb-3">Materials Used:</h4>
                    <div className="flex flex-wrap gap-2">
                      {techniques[selectedTechnique].materials.map((material, index) => (
                        <Badge key={index} variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-200">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-rose-900 dark:text-rose-100 mb-3">Perfect For:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {techniques[selectedTechnique].projects.map((project, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {project}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className={`bg-gradient-to-r ${techniques[selectedTechnique].color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    See {techniques[selectedTechnique].name} Products
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {techniques.map((technique, index) => {
            const Icon = technique.icon;
            return (
              <Card key={technique.id} className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <img 
                    src={technique.image} 
                    alt={technique.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${difficultyColors[technique.difficulty as keyof typeof difficultyColors]} text-white`}>
                      {technique.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${technique.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">
                      {technique.name}
                    </h3>
                  </div>

                  <p className="text-rose-700 dark:text-rose-300 mb-4 text-sm">
                    {technique.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-rose-600 dark:text-rose-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {technique.timeRequired}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {technique.materials.slice(0, 3).map((material, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-200">
                        {material}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    size="sm"
                    className={`w-full bg-gradient-to-r ${technique.color} text-white`}
                  >
                    <Eye className="w-3 h-3 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <div className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
          <Award className="w-8 h-8 text-pink-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-4">
            Ready for Something Custom?
          </h3>
          <p className="text-rose-700 dark:text-rose-300 mb-6">
            Have a special project in mind? I love working with customers to create 
            one-of-a-kind pieces using these traditional techniques.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
          >
            Request Custom Order
          </Button>
        </div>
      </div>
    </section>
  );
};