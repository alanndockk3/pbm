// components/legal/LegalModal.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, FileText, Shield, Heart } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
  title: string;
  children: React.ReactNode;
}

export const LegalModal: React.FC<LegalModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-rose-900 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 rounded-t-xl">
          <div className="flex items-center gap-3">
            {type === 'terms' ? (
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {title}
              </h2>
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Pretties by Marg
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-rose-600 hover:text-rose-800 hover:bg-rose-100 dark:hover:bg-rose-800 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-800/20 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600" />
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};