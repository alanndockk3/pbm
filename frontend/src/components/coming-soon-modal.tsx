// components/ui/coming-soon-modal.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Clock, Sparkles, Bell, Mail, ArrowRight, CheckCircle } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  showNotifyMe?: boolean;
}

// Main Modal Wrapper Component
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

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ 
  isOpen, 
  onClose,
  title = "Coming Soon",
  description = "We're working hard to bring you something amazing. Stay tuned!",
  showNotifyMe = true
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubscribed(true);
    setIsSubmitting(false);
    
    // Auto close after showing success
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setEmail('');
    setIsSubscribed(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Card className="border-0 shadow-2xl bg-white/95 dark:bg-rose-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {isSubscribed ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Clock className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl text-rose-900 dark:text-rose-100">
            {isSubscribed ? "You're All Set!" : title}
          </CardTitle>
          <CardDescription className="text-rose-700 dark:text-rose-300">
            {isSubscribed 
              ? "We'll notify you as soon as this feature is available."
              : description
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isSubscribed ? (
            <>
              {/* Feature Preview/Teaser */}
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-rose-900 dark:text-rose-100">
                    What's Coming
                  </span>
                </div>
                <ul className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
                  <li>• Enhanced user experience</li>
                  <li>• New exciting features</li>
                  <li>• Improved performance</li>
                  <li>• And much more!</li>
                </ul>
              </div>

              {/* Notify Me Section */}
              {showNotifyMe && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Bell className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-1">
                      Be the First to Know
                    </h3>
                    <p className="text-sm text-rose-600 dark:text-rose-400">
                      Get notified when this feature launches
                    </p>
                  </div>

                  <form onSubmit={handleNotifySubmit} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Notify Me
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* Alternative Actions */}
              {!showNotifyMe && (
                <div className="space-y-3">
                  <Button 
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 shadow-lg"
                  >
                    Got It
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Subscription confirmed!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  We've added {email} to our notification list.
                </p>
              </div>
              
              <Button 
                onClick={handleClose}
                variant="outline"
                className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                Close
              </Button>
            </div>
          )}

          {/* Footer Message */}
          {!isSubscribed && (
            <div className="text-center text-xs text-rose-500 dark:text-rose-500 mt-4">
              Thank you for your patience as we build something special
            </div>
          )}
        </CardContent>
      </Card>
    </Modal>
  );
};

