// Navigation.js (or .jsx)
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="fixed w-full bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Class Plus
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-purple-400 font-medium">Features</a>
            <Link to="/about" className="text-gray-300 hover:text-purple-400 font-medium">About Us</Link>
            <Link to="/contact" className="text-gray-300 hover:text-purple-400 font-medium">Contact</Link>
            <Link to="/signin" className="text-gray-300 hover:text-purple-400 font-medium">Sign In</Link>
            <Link to="/signup" className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
