// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Button } from 'flowbite-react';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-poppins">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-800">
        <Button
          color="gray"
          className="p-2 ml-12"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Mobile Drawer */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Sidebar - Desktop */}
        <div className="hidden lg:block lg:w-64 bg-gray-800 p-6 fixed min-h-screen">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;