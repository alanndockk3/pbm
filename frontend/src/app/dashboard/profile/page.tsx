'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from '@/components/footer';
import { 
  Heart, 
  User, 
  ArrowLeft,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  Camera,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { 
  useProfileStore, 
  useProfile, 
  useProfileLoading, 
  useProfileError,
  useProfileStatistics 
} from '../../../../lib/profile/useProfileStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const profile = useProfile();
  const isLoading = useProfileLoading();
  const error = useProfileError();
  const statistics = useProfileStatistics();
  
  const { 
    initializeProfile, 
    updateProfile, 
    updatePreferences,
    uploadProfilePicture,
    setError 
  } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bio: '',
    preferences: {
      newsletter: true,
      orderUpdates: true,
      promotions: false,
    }
  });

  // Initialize profile on component mount
  useEffect(() => {
    if (user?.uid) {
      initializeProfile(user.uid);
    }
  }, [user, initializeProfile]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || user?.displayName || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        bio: profile.bio || '',
        preferences: profile.preferences || {
          newsletter: true,
          orderUpdates: true,
          promotions: false,
        }
      });
    } else if (user && !profile && !isLoading) {
      // Initialize with user data if no profile exists
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [profile, user, isLoading]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      
      // Update profile data
      const success = await updateProfile(user.uid, {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio,
        preferences: formData.preferences,
      });

      if (success) {
        setIsEditing(false);
        setShowSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const handleCancel = () => {
    // Reset form data to profile values
    if (profile) {
      setFormData({
        displayName: profile.displayName || user?.displayName || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        bio: profile.bio || '',
        preferences: profile.preferences || {
          newsletter: true,
          orderUpdates: true,
          promotions: false,
        }
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.uid) {
      const success = await uploadProfilePicture(user.uid, file);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

  // Show loading state
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-rose-700 dark:text-rose-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Profile</h1>
              <p className="text-rose-600 dark:text-rose-400">Manage your personal information</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              disabled={isLoading}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleCancel}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200">Profile updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-6">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="sr-only"
                      />
                      <Button 
                        size="sm" 
                        className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-pink-500 to-purple-600"
                        type="button"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </label>
                  )}
                </div>
                
                <Badge variant="secondary" className="mb-4 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Craft Lover
                </Badge>

                <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-2">
                  {formData.displayName || 'Beautiful Soul'}
                </h2>
                <p className="text-rose-600 dark:text-rose-400 mb-4">
                  Member since {statistics?.memberSince ? new Date(statistics.memberSince).getFullYear() : new Date().getFullYear()}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                      {statistics?.totalOrders || 0}
                    </div>
                    <div className="text-sm text-rose-600 dark:text-rose-400">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                      {statistics?.wishlistCount || 0}
                    </div>
                    <div className="text-sm text-rose-600 dark:text-rose-400">Wishlist</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-rose-700 dark:text-rose-300">
                  Your basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-rose-50/50 dark:bg-rose-800/20 rounded-lg">
                        <User className="w-4 h-4 text-rose-500" />
                        <span className="text-rose-900 dark:text-rose-100">
                          {formData.displayName || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-rose-50/50 dark:bg-rose-800/20 rounded-lg">
                      <Mail className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-900 dark:text-rose-100">
                        {formData.email || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-rose-50/50 dark:bg-rose-800/20 rounded-lg">
                        <Phone className="w-4 h-4 text-rose-500" />
                        <span className="text-rose-900 dark:text-rose-100">
                          {formData.phone || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-rose-50/50 dark:bg-rose-800/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span className="text-rose-900 dark:text-rose-100">
                          {formData.dateOfBirth || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us a bit about yourself and what crafts you love..."
                      rows={3}
                      className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    />
                  ) : (
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-800/20 rounded-lg">
                      <span className="text-rose-900 dark:text-rose-100">
                        {formData.bio || 'No bio provided yet. Tell us about your love for handmade crafts!'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Preferences
                </CardTitle>
                <CardDescription className="text-rose-700 dark:text-rose-300">
                  Manage your communication preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-rose-50/50 dark:bg-rose-800/20 rounded-lg">
                    <div>
                      <span className="font-medium text-rose-900 dark:text-rose-100 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {key === 'newsletter' && 'Receive our monthly newsletter with new products'}
                        {key === 'orderUpdates' && 'Get notified about your order status'}
                        {key === 'promotions' && 'Receive promotional offers and discounts'}
                      </p>
                    </div>
                    {isEditing ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleInputChange(`preferences.${key}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-600"></div>
                      </label>
                    ) : (
                      <Badge variant={value ? "default" : "secondary"} className={value ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" : ""}>
                        {value ? 'Enabled' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}