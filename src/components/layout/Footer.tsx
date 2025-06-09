// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // If you want to include navigation links

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto"> {/* mt-auto helps push footer down in flex layouts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-4 md:mb-0">
            © {currentYear} FreightCompare. All rights reserved.
          </div>
          <div className="flex space-x-4">
            {/* Example Links - Add or remove as needed */}
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            {/* 
            You might want a link to your "Sign In" page if the user isn't logged in,
            or other relevant navigation items.
            */}
          </div>
        </div>
        {/* Optional: Add more sections or details to your footer */}
        {/* 
        <div className="mt-4 text-center text-xs">
          <p>Built with React & Tailwind CSS</p>
        </div>
        */}
      </div>
    </footer>
  );
};

export default Footer;