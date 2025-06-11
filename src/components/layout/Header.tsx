import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  LogIn,
  User as UserIcon,
  LogOut as LogOutIcon,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      event.preventDefault();
      console.log("Header: Logo clicked, but user not authenticated. Navigation prevented.");
    }
  };

  const handleSignOut = () => {
    logout();
    setMenuOpen(false); // close menu on sign out
  };

  return (
    <header className="bg-white shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Brand / Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className={`flex items-center`}
          >
            <Truck className="text-blue-700 h-8 w-8" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">FreightCompare</h1>
          </Link>

          {/* Hamburger Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden focus:outline-none"
          >
            {menuOpen ? <X className="h-6 w-6 text-gray-800" /> : <Menu className="h-6 w-6 text-gray-800" />}
          </button>

          {/* Navigation Links (Desktop) */}
          <div className="hidden sm:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <span className="text-sm text-gray-700 hidden md:inline">
                  Hi,  {(user as any).customer.firstName}
                </span>
                <Link to="/compare" className="text-sm text-gray-700 hover:text-blue-700">Compare Prices</Link>
              </>
            )}
            <Link to="/about" className="text-sm text-gray-700 hover:text-blue-700">About Us</Link>
            <Link to="/contact" className="text-sm text-gray-700 hover:text-blue-700">Contact Us</Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center text-sm text-gray-700 hover:text-blue-700"
                >
                  <UserIcon size={16} className="mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md text-xs sm:text-sm"
                >
                  <LogOutIcon size={16} className="mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-500 hidden lg:block">
                  The Logistics Cost Calculator
                </div>
                <Link to="/signin">
                  <button
                    type="button"
                    className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-md text-xs sm:text-sm"
                  >
                    <LogIn size={16} className="mr-1" />
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div className="sm:hidden mt-4 space-y-3">
            {isAuthenticated && (
              <Link to="/compare" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 hover:text-blue-700">
                Compare Prices
              </Link>
            )}
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 hover:text-blue-700">
              About Us
            </Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 hover:text-blue-700">
              Contact Us
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center text-sm text-gray-700 hover:text-blue-700">
                  <UserIcon size={16} className="mr-1" />
                  Profile
                </Link>
                <div className="text-sm text-gray-700">
                  Hi,  {(user as any).customer.firstName}
                </div>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md text-xs"
                >
                  <LogOutIcon size={16} className="mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={() => setMenuOpen(false)}>
                  <button
                    type="button"
                    className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-md text-xs"
                  >
                    <LogIn size={16} className="mr-1" />
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
