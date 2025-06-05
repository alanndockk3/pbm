'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  ArrowLeft,
  Save,
  X,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuthStore } from '../../../lib/auth/useAuthStore';
import { useAdminStore } from '../../../lib/admin/useAdminStore';
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '../../../types/product';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../../client/firebaseConfig';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { 
    loading: adminLoading, 
    error: adminError, 
    deleteProduct: deleteProductFromFirebase,
    clearError 
  } = useAdminStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const productsData: Product[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            productsData.push({
              id: parseInt(doc.id) || Math.random(), // Convert string ID to number for compatibility
              firestoreId: doc.id, // Keep original Firestore ID
              name: data.name,
              price: data.price,
              quantity: data.quantity,
              image: data.image,
              category: data.category,
              rating: data.rating,
              reviews: data.reviews,
              inStock: data.inStock,
              description: data.description,
              isFeatured: data.isFeatured || false,
            } as Product & { firestoreId: string });
          });
          setProducts(productsData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading products:', error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))];

  // Get filtered and sorted products
  const getFilteredProducts = () => {
    if (!products || products.length === 0) {
      return [];
    }
    
    let filteredProducts = products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'All') {
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }

    return filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'stock':
          return b.quantity - a.quantity;
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const filteredProducts = getFilteredProducts();

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      const productWithFirestoreId = product as Product & { firestoreId?: string };
      const firestoreId = productWithFirestoreId.firestoreId || product.id.toString();
      
      const success = await deleteProductFromFirebase(firestoreId, product.image);
      if (success) {
        setSuccessMessage('Product deleted successfully!');
      }
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const productWithFirestoreId = product as Product & { firestoreId?: string };
      const firestoreId = productWithFirestoreId.firestoreId || product.id.toString();
      
      const docRef = doc(db, 'products', firestoreId);
      await updateDoc(docRef, {
        isFeatured: !product.isFeatured,
        updatedAt: new Date()
      });
      
      setSuccessMessage(`Product ${product.isFeatured ? 'removed from' : 'added to'} featured!`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleProductSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingProduct(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Admin Dashboard</h1>
              <p className="text-rose-600 dark:text-rose-400">Manage your handmade products</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            disabled={adminLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {adminError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 dark:text-red-200">{adminError}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600 dark:text-rose-400">Total Products</p>
                  <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{products?.length || 0}</p>
                </div>
                <Package className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600 dark:text-rose-400">Featured</p>
                  <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                    {products?.filter(p => p.isFeatured).length || 0}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600 dark:text-rose-400">In Stock</p>
                  <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                    {products?.filter(p => p.inStock).length || 0}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600 dark:text-rose-400">Categories</p>
                  <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                    {categories?.length || 0}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="All">All Categories</option>
            {categories?.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="stock">Stock Level</option>
            <option value="featured">Featured First</option>
          </select>

          <div className="flex items-center gap-2 bg-white/50 dark:bg-rose-900/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-rose-600 dark:text-rose-400">
            Showing {filteredProducts?.length || 0} of {products?.length || 0} products
          </p>
        </div>
      </header>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-12">
        {!filteredProducts || filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              {!products || products.length === 0 ? 'No products available' : 'No products found'}
            </h3>
            <p className="text-rose-600 dark:text-rose-400">
              {!products || products.length === 0 
                ? 'Add your first product to get started.' 
                : 'Try adjusting your search or filter criteria, or add a new product.'
              }
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard 
                  product={product}
                  showQuantity={true}
                  purchaseButtonText="Manage Product"
                  onPurchaseClick={() => handleEditProduct(product)}
                />
                
                {/* Admin Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => handleToggleFeatured(product)}
                    disabled={adminLoading}
                  >
                    <Star className={`w-3 h-3 ${product.isFeatured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => handleEditProduct(product)}
                    disabled={adminLoading}
                  >
                    <Edit className="w-3 h-3 text-blue-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => handleDeleteProduct(product)}
                    disabled={adminLoading}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Product Modal */}
      <AdminProductForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => handleProductSuccess('Product added successfully!')}
        mode="add"
      />

      {/* Edit Product Modal */}
      <AdminProductForm
        product={editingProduct}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        onSuccess={() => handleProductSuccess('Product updated successfully!')}
        mode="edit"
      />
    </div>
  );
}