import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Twitter, Linkedin, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Reusable Styled Components for Footer ---

const BrandLogo = () => (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">FreightCompare</h1>
    </Link>
);

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link to={to} className="text-slate-400 hover:text-blue-500 transition-colors duration-300">
        {children}
    </Link>
);

const FooterSectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
        {children}
    </h3>
);

const SocialIcon = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors duration-300">
        {icon}
    </a>
)

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="bg-slate-900 text-slate-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">

          {/* Column 1: Brand Info (spans 2 columns on larger screens) */}
          <div className="col-span-2 lg:col-span-2">
            <BrandLogo />
            <p className="mt-4 text-slate-400 leading-relaxed max-w-xs">
              Making smarter logistics decisions, effortlessly. Compare real-time quotes and save on every shipment.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1">
            <FooterSectionTitle>Quick Links</FooterSectionTitle>
            <div className="space-y-3">
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/features">Features</FooterLink>
                <FooterLink to="/contact">Contact</FooterLink>
            </div>
          </div>
          
          {/* Column 3: Resources */}
           <div className="col-span-1">
            <FooterSectionTitle>Resources</FooterSectionTitle>
            <div className="space-y-3">
                <FooterLink to="/compare">Calculator</FooterLink>
                <FooterLink to="/help-center">Help Center</FooterLink>
                <FooterLink to="/blog">Blog</FooterLink>
            </div>
          </div>

          {/* Column 4: Legal */}
          <div className="col-span-2 sm:col-span-1">
            <FooterSectionTitle>Legal</FooterSectionTitle>
            <div className="space-y-3">
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
                <FooterLink to="/terms">Terms of Service</FooterLink>
            </div>
          </div>

        </div>

        {/* Sub-Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-slate-500 text-center sm:text-left mb-4 sm:mb-0">
                © {currentYear} FreightCompare, Inc. All rights reserved.
            </p>
            <div className="flex items-center space-x-5">
                <SocialIcon href="#" icon={<Twitter size={20} />} />
                <SocialIcon href="#" icon={<Linkedin size={20} />} />
                <SocialIcon href="#" icon={<Facebook size={20} />} />
            </div>
        </div>

      </div>
    </motion.footer>
  );
};

export default Footer;