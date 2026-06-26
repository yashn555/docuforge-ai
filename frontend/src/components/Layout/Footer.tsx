import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DocuForge AI. 
              <span className="hidden md:inline"> Open-source document generation tool.</span>
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="GitHub"
            >
              <FiGithub className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Twitter"
            >
              <FiTwitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="LinkedIn"
            >
              <FiLinkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          <span>No account required · Session-based · Your data is not stored permanently</span>
        </div>
      </div>
    </footer>
  );
};