// components/landing-page/PreviousCreationsShowcase.tsx
'use client'

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Star, 
  Clock,
  Palette,
  Eye,
  ShoppingCart,
  Sparkles,
  Award,
  CheckCircle
} from "lucide-react";

const previousCreations = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=600&fit=crop",
    title: "Lavender Dreams Throw Blanket",
    description: "Custom hand-knitted throw in soft lavender and cream. Perfect for cozy reading nooks and adding warmth to any space.",
    category: "Home Decor",
    technique: "Hand Knitting",
    completionTime: "3 weeks",
    materials: ["Merino wool", "Cotton blend", "Hand-dyed yarn"],
    difficulty: "Advanced",
    priceRange: "$180-220",
    customerNote: "Absolutely in love with how soft and beautiful this turned out!",
    tags: ["Custom", "Cozy", "Handmade"],
    featured: true
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1615887047859-4ed2cd7b6709?w=600&h=600&fit=crop",
    title: "Sunset Weave Table Runner",
    description: "Handwoven table runner featuring warm sunset colors. Brings natural beauty and artisanal charm to dining spaces.",
    category: "Table Linens",
    technique: "Loom Weaving",
    completionTime: "2 weeks",
    materials: ["Cotton warp", "Wool weft", "Natural dyes"],
    difficulty: "Intermediate",
    priceRange: "$85-120",
    customerNote: "Perfect centerpiece for our dining room. The colors are stunning!",
    tags: ["Dining", "Natural", "Colorful"],
    featured: false
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop",
    title: "Baby's First Sweater Set",
    description: "Delicate hand-knitted sweater, hat, and booties set in soft mint green. Made with the finest baby-safe materials.",
    category: "Baby Items",
    technique: "Fine Knitting",
    completionTime: "4 weeks",
    materials: ["Organic cotton", "Bamboo fiber", "Hypoallergenic yarn"],
    difficulty: "Expert",
    priceRange: "$120-160",
    customerNote: "The quality is incredible. My baby looks adorable and feels so cozy!",
    tags: ["Baby Safe", "Organic", "Gift"],
    featured: true
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=600&fit=crop",
    title: "Botanical Wall Hanging",
    description: "Intricate embroidered wall art featuring local wildflowers. Each stitch captures the delicate beauty of nature.",
    category: "Wall Art",
    technique: "Hand Embroidery",
    completionTime: "5 weeks",
    materials: ["Linen canvas", "Cotton threads", "Wooden hoop"],
    difficulty: "Expert",
    priceRange: "$200-280",
    customerNote: "This is a true work of art. Everyone who sees it is amazed!",
    tags: ["Art", "Nature", "Detailed"],
    featured: true
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=600&fit=crop",
    title: "Cozy Winter Scarf Collection",
    description: "Set of three coordinating scarves in different textures and patterns. Perfect for gifting or personal collection.",
    category: "Accessories",
    technique: "Mixed Techniques",
    completionTime: "6 weeks",
    materials: ["Alpaca wool", "Mohair blend", "Silk accents"],
    difficulty: "Advanced",
    priceRange: "$150-200",
    customerNote: "The variety and quality exceeded my expectations. Love them all!",
    tags: ["Set", "Winter", "Luxury"],
    featured: false
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=600&h=600&fit=crop",
    title: "Wedding Memory Quilt",
    description: "Custom quilt incorporating fabric from the couple's wedding attire and meaningful textiles. A treasured family heirloom.",
    category: "Special Occasion",
    technique: "Quilting & Embroidery",
    completionTime: "8 weeks",
    materials: ["Wedding fabrics", "Cotton batting", "Silk embroidery"],
    difficulty: "Master Level",
    priceRange: "$400-600",
    customerNote: "This quilt tells our love story perfectly. It's our most treasured possession!",
    tags: ["Wedding", "Heirloom", "Custom"],
    featured: true
  }
];

const categories = ["All", "Home Decor", "Table Linens", "Baby Items", "Wall Art", "Accessories", "Special Occasion"];

const difficultyColors = {
  "Intermediate": "bg-green-500",
  "Advanced": "bg-yellow-500",
  "Expert": "bg-orange-500",
  "Master Level": "bg-red-500"
};

const difficultyIcons = {
  "Intermediate": "⭐⭐",
  "Advanced": "⭐⭐⭐",
  "Expert": "⭐⭐⭐⭐",
  "Master Level": "⭐⭐⭐⭐⭐"
};

export const PreviousCreationsShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<'grid' | 'featured'>('featured');

  const filteredItems = selectedCategory === "All" 
    ? previousCreations 
    : previousCreations.filter(item => item.category === selectedCategory);

  const featuredItems = filteredItems.filter(item => item.featured);
  const displayItems = viewMode === 'featured' ? featuredItems : filteredItems;

  return (
    <section className="container mx-auto px-4 py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-200/30 dark:from-pink-800/20 dark:to-purple-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-rose-200/30 to-orange-200/30 dark:from-rose-800/20 dark:to-orange-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex items-center gap-3 mb-6 bg-white/80 dark:bg-rose-900/40 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <Award className="w-6 h-6 text-pink-500" />
          <span className="text-rose-800 dark:text-rose-200 font-medium">Portfolio Showcase</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-rose-900 dark:text-rose-100 mb-6 leading-tight">
          Previous
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600">
            Creations
          </span>
        </h2>
        
        <p className="text-xl text-rose-700 dark:text-rose-300 max-w-3xl mx-auto leading-relaxed">
          Explore the range and quality of handmade treasures I've created for happy customers. 
          Each piece showcases different techniques and possibilities for your custom order.
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-white/80 dark:bg-rose-900/40 backdrop-blur-sm rounded-full p-1 shadow-lg border border-rose-200/50 dark:border-rose-700/50">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('featured')}
              className={`rounded-full px-4 py-2 transition-all duration-300 ${
                viewMode === 'featured'
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/50"
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Featured Work
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-full px-4 py-2 transition-all duration-300 ${
                viewMode === 'grid'
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/50"
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              All Work
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center mb-12 relative z-10">
        <div className="bg-white/60 dark:bg-rose-900/30 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-rose-200/50 dark:border-rose-700/50">
          <div className="flex flex-wrap gap-1 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl px-3 py-1 text-sm transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-rose-200 dark:bg-rose-700 text-rose-900 dark:text-rose-100 shadow-md"
                    : "text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-800/50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-center mb-8 relative z-10">
        <p className="text-rose-600 dark:text-rose-400">
          Showing {displayItems.length} {viewMode === 'featured' ? 'featured ' : ''}
          creation{displayItems.length !== 1 ? 's' : ''}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {displayItems.map((item) => (
          <Card 
            key={item.id} 
            className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-rose-900/30 backdrop-blur-sm group overflow-hidden cursor-pointer hover:-translate-y-3 hover:scale-[1.02]"
          >
            {/* Image Container */}
            <div className="relative overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Featured Badge */}
              {item.featured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* Difficulty Badge */}
              <div className="absolute top-4 right-4">
                <Badge className={`${difficultyColors[item.difficulty as keyof typeof difficultyColors]} text-white border-0 shadow-lg`}>
                  {difficultyIcons[item.difficulty as keyof typeof difficultyIcons]} {item.difficulty}
                </Badge>
              </div>

              {/* Hover Actions */}
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 text-xs mb-2">
                    {item.category}
                  </Badge>
                  <h3 className="font-bold text-rose-900 dark:text-rose-100 text-lg leading-tight mb-2">
                    {item.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-sm text-rose-700 dark:text-rose-300 line-clamp-2 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Technique & Time */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <p className="text-rose-600 dark:text-rose-400 font-medium">Technique</p>
                  <p className="text-rose-900 dark:text-rose-100">{item.technique}</p>
                </div>
                <div>
                  <p className="text-rose-600 dark:text-rose-400 font-medium">Time</p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-500" />
                    <span className="text-rose-900 dark:text-rose-100">{item.completionTime}</span>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="mb-4">
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-2">Materials</p>
                <div className="flex flex-wrap gap-1">
                  {item.materials.slice(0, 2).map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300">
                      {material}
                    </Badge>
                  ))}
                  {item.materials.length > 2 && (
                    <Badge variant="outline" className="text-xs border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300">
                      +{item.materials.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Customer Note */}
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Customer Review</p>
                    <p className="text-xs text-rose-800 dark:text-rose-200 italic leading-relaxed">
                      "{item.customerNote}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Range & Action */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-600 dark:text-rose-400">Similar pieces</p>
                  <p className="font-bold text-rose-900 dark:text-rose-100">{item.priceRange}</p>
                </div>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <ShoppingCart className="w-3 h-3 mr-2" />
                  Request Similar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-20 relative z-10">
        <div className="bg-white/90 dark:bg-rose-900/40 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl border border-rose-200/50 dark:border-rose-700/50">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Palette className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-4">
            Ready for Your Custom Creation?
          </h3>
          <p className="text-rose-700 dark:text-rose-300 mb-6 leading-relaxed">
            Inspired by what you see? Let's work together to create something uniquely yours. 
            Every piece is tailored to your vision, style, and needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Custom Order
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/50"
            >
              Get Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};