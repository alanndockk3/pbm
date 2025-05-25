import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, X, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from '../../lib/auth/useAuthStore';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

// Modal Component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-rose-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-10"
        >
          <X className="w-4 h-4 text-rose-600 dark:text-rose-300" />
        </button>
        {children}
      </div>
    </div>
  );
};

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signup, loading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });

  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    terms: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear store error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {
      fullName: '',
      email: '',
      password: '',
      terms: ''
    };

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.fullName);
      
      // If signup is successful, close modal and reset form
      if (!error) {
        onClose();
        setFormData({
          fullName: '',
          email: '',
          password: '',
          agreeToTerms: false
        });
      }
    } catch (err) {
      // Error handling is done in the store
      console.error('Signup failed:', err);
    }
  };

  const handleClose = () => {
    clearError();
    setValidationErrors({
      fullName: '',
      email: '',
      password: '',
      terms: ''
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Card className="border-0 shadow-2xl bg-white/95 dark:bg-rose-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-rose-900 dark:text-rose-100">Join Our Community</CardTitle>
          <CardDescription className="text-rose-700 dark:text-rose-300">
            Create your account and start discovering beautiful handmade treasures
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Display general error from Firebase */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-rose-800 dark:text-rose-200">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
                <input 
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    validationErrors.fullName ? 'border-red-300 dark:border-red-700' : 'border-rose-200 dark:border-rose-700'
                  }`}
                  placeholder="Your full name"
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-rose-800 dark:text-rose-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    validationErrors.email ? 'border-red-300 dark:border-red-700' : 'border-rose-200 dark:border-rose-700'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-rose-800 dark:text-rose-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    validationErrors.password ? 'border-red-300 dark:border-red-700' : 'border-rose-200 dark:border-rose-700'
                  }`}
                  placeholder="Create a password"
                />
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
            </div>

            <div className="flex items-start space-x-2 text-sm">
              <input 
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className={`rounded border-rose-300 mt-1 ${
                  validationErrors.terms ? 'border-red-300 dark:border-red-700' : ''
                }`}
              />
              <div>
                <span className="text-rose-700 dark:text-rose-300">
                  I agree to the{' '}
                  <a href="#" className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300">
                    Privacy Policy
                  </a>
                </span>
                {validationErrors.terms && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{validationErrors.terms}</p>
                )}
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-rose-600 dark:text-rose-400 mt-4">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
            >
              Sign in here
            </button>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
};