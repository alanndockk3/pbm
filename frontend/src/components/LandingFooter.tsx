import Link from 'next/link';
import { Heart } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="container mx-auto px-4 py-12 border-t border-rose-200 dark:border-rose-800">
      <div className="flex flex-col gap-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-rose-800 dark:text-rose-200">PBM - Pretties by Marg</span>
              <p className="text-xs text-rose-600 dark:text-rose-400">Handcrafted with love since 2018</p>
            </div>
          </div>
         
          <div className="text-sm text-rose-600 dark:text-rose-400">
            Kokomo, Indiana
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-rose-100 dark:border-rose-900">
          <div className="text-xs text-rose-500 dark:text-rose-500">
            © {new Date().getFullYear()} Pretties by Marg. All rights reserved.
          </div>
          <div className="flex gap-4 text-xs">
            <Link 
              href="/legal/privacy-policy" 
              className="text-rose-500 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/legal/terms-of-service" 
              className="text-rose-500 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-300 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}