import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, X, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../client/firebaseConfig';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
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

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [countdown, setCountdown] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-close modal after 4 seconds when email is sent successfully
  useEffect(() => {
    if (emailSent) {
      const timer = setTimeout(() => {
        handleClose();
      }, 4000); // 4 seconds

      return () => clearTimeout(timer);
    }
  }, [emailSent]);

  // Countdown timer for auto-close
  useEffect(() => {
    if (emailSent && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [emailSent, countdown]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear validation errors when user starts typing
    if (validationError) {
      setValidationError('');
    }
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    // Clear any previous errors
    setError(null);
    setValidationError('');
    setLoading(true);
    
    try {
      // Call Firebase directly
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      setEmailSent(true);
    } catch (err: any) {
      setLoading(false);
      
      // Handle specific Firebase errors
      let errorMessage = 'An error occurred while sending the reset email';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setError(null);
    setValidationError('');
    setEmail('');
    setEmailSent(false);
    setCountdown(4);
    setLoading(false);
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Card className="border-0 shadow-2xl bg-white/95 dark:bg-rose-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-rose-900 dark:text-rose-100">
            {emailSent ? 'Check Your Email' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-rose-700 dark:text-rose-300">
            {emailSent 
              ? 'We\'ve sent a password reset link to your email address'
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {emailSent ? (
            // Success state
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Reset email sent successfully!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-500 mt-2 font-medium">
                    This modal will close automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-800/50"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Login
                </Button>
                
                <Button 
                  onClick={handleClose}
                  variant="outline"
                  className="w-full border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-800/50"
                >
                  Close Now
                </Button>
              </div>
            </div>
          ) : (
            // Form state
            <>
              {/* Display error from Firebase */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-rose-800 dark:text-rose-200">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
                    <input 
                      type="email"
                      value={email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        validationError ? 'border-red-300 dark:border-red-700' : 'border-rose-200 dark:border-rose-700'
                      }`}
                      placeholder="your@email.com"
                      disabled={loading}
                    />
                  </div>
                  {validationError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{validationError}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Sending Reset Email...
                      </>
                    ) : (
                      'Send Reset Email'
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    onClick={handleBackToLogin}
                    variant="outline"
                    className="w-full border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-800/50"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Login
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </Modal>
  );
};
