import React from 'react'
import Link from 'next/link';
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface HeaderProps {
  navigateBack?: boolean;
  onNavigateBack?: () => void;
  backText?: string;
  backUrl?: string;
  children?: React.ReactNode;
}

export default function Header({
  navigateBack = false,
  onNavigateBack,
  backText = "Go Back",
  backUrl,
  children
}: HeaderProps) {
  const router = useRouter();
  
  const handleBackClick = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  if (navigateBack) {
    return (
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        {/* Left side - Back Navigation */}
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backText}
        </Button>
        
        {/* Right side - PBM Header (clickable to home) */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">PBM</h1>
            <p className="text-xs text-rose-600 dark:text-rose-300">Pretties by Marg</p>
          </div>
          {children && (
            <div className="ml-4">
              {children}
            </div>
          )}
        </Link>
      </header>
    );
  }

  // Default layout when navigateBack is false (clickable to home)
  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">PBM</h1>
          <p className="text-xs text-rose-600 dark:text-rose-300">Pretties by Marg</p>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        {children}
      </div>
    </header>
  );
}