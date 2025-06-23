import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  User as UserIcon,
  LogOut as LogOutIcon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable & Styled Components for Header ---

const BrandLogo = () => (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">FreightCompare</h1>
    </Link>
);

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link to={to} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
        {children}
    </Link>
);

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const userInitial = user ? (user as any).customer.firstName.charAt(0).toUpperCase() : '?';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-sm">
                {userInitial}
            </div>
            <span className="hidden md:inline text-sm font-medium text-slate-700">Hi, {(user as any).customer.firstName}</span>
            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
             <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-slate-200/80 z-20"
             >
                <div className="p-2">
                    <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-slate-800">{(user as any).customer.firstName} {(user as any).customer.lastName}</p>
                        <p className="text-xs text-slate-500 truncate">{(user as any).customer.email}</p>
                    </div>
                    <hr className="my-1 border-slate-100" />
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                        <UserIcon size={16} /> Profile
                    </Link>
                     <Link to="/compare" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                        <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium">
                       <LogOutIcon size={16} /> Sign Out
                    </button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}


const MobileNav = ({ isOpen, closeMenu }: { isOpen: boolean, closeMenu: () => void }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const handleSignOut = () => { logout(); closeMenu(); };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={closeMenu}
                >
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-0 left-0 w-full bg-white p-6 shadow-xl"
                        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the menu
                    >
                         <div className="flex justify-between items-center mb-8">
                             <BrandLogo/>
                             <button onClick={closeMenu}><X size={24}/></button>
                         </div>
                         <div className="flex flex-col gap-5 text-lg font-medium text-slate-800">
                           <Link to="/compare" onClick={closeMenu}>Compare Prices</Link>
                           <Link to="/about" onClick={closeMenu}>About Us</Link>
                           <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
                           {isAuthenticated && <Link to="/profile" onClick={closeMenu}>Profile</Link>}
                           <hr className="border-slate-200 my-4" />
                           {isAuthenticated ? (
                             <button onClick={handleSignOut} className="px-6 py-3 bg-red-500 text-white rounded-lg w-full">Sign Out</button>
                           ) : (
                             <Link to="/signin" onClick={closeMenu} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-center">Sign In</Link>
                           )}
                         </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side: Logo */}
            <BrandLogo />
  
            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </nav>
  
            {/* Right side: Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4">
                  {isAuthenticated ? (
                    <>
                       <Link to="/compare" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                            Dashboard
                       </Link>
                       <UserProfileDropdown/>
                    </>
                  ) : (
                    <>
                      <NavLink to="/signin">Sign In</NavLink>
                      <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                          Get Started
                      </Link>
                    </>
                  )}
              </div>

               {/* Hamburger Toggle (Mobile) */}
                <div className="lg:hidden">
                  <button onClick={() => setMenuOpen(true)} className="p-2 -mr-2">
                    <Menu className="h-6 w-6 text-slate-800" />
                  </button>
              </div>
            </div>

          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Menu Component */}
      <MobileNav isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />
    </>
  );
};

export default Header;