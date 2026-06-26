import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiFileText, FiGithub } from 'react-icons/fi';

export const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <FiFileText className="w-8 h-8 text-blue-600 relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                DocuForge AI
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Template-Powered Document Generation
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location.pathname === '/' ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                Home
              </Link>
              {location.pathname === '/dashboard' && (
                <span className="text-sm text-gray-400">|</span>
              )}
              {location.pathname === '/dashboard' && (
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-blue-600"
                >
                  Dashboard
                </Link>
              )}
            </nav>
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <FiGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};