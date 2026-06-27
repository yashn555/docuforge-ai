import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiInfo } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/80 mt-auto">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DocuForge AI.
              <span className="hidden sm:inline"> Open-source document generation tool.</span>
            </p>
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center md:justify-start">
              Made with <FiHeart className="w-3 h-3 text-red-500 mx-1 animate-pulse" /> for students and professionals
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/about"
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm touch-target"
            >
              <FiInfo className="mr-1.5" />
              About
            </Link>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          <span>🔒 No account required · Session-based · Your data is not stored permanently</span>
        </div>
      </div>
    </footer>
  );
};