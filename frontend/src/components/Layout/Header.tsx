import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiFileText, FiGithub, FiMenu, FiX } from 'react-icons/fi';

export const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 gradient-bg rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative p-2 gradient-bg rounded-xl shadow-md">
                <FiFileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold gradient-text">
                DocuForge AI
              </h1>
              <p className="text-[10px] md:text-xs text-gray-500 -mt-0.5">
                Template-Powered Document Generation
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold gradient-text">DocuForge AI</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(link.path) ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="GitHub"
            >
              <FiGithub className="w-5 h-5" />
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6 text-gray-700" />
            ) : (
              <FiMenu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FiGithub className="w-5 h-5 mr-3" />
                GitHub
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};