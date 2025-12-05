import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WalletConnectButton from '../wallet/WalletConnectButton';
import AuthorityWalletConnectButton from '../wallet/Authority/AuthorityWalletConnectButton';
import useAuthorityWalletConnect from '../wallet/Authority/AuthorityWalletConnect';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const location = useLocation();
  
  const { isAuthorized } = useAuthorityWalletConnect();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Report', path: '/report' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Authority', path: '/authority' },
  ];

  const navbarVariants = {
    transparent: {
      backgroundColor: 'rgba(14, 14, 26, 0)',
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
    },
    solid: {
      backgroundColor: 'rgba(14, 14, 26, 0.8)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    },
  };

  return (
    <motion.nav
      variants={navbarVariants}
      animate={isScrolled ? 'solid' : 'transparent'}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 py-4"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Shield className={`h-10 w-10 ${isAuthorized ? 'text-red-500' : 'text-primary-500'}`} />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-white">Whispr</span>
              <span className="text-sm text-gray-400">Anonymous Reporting</span>
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-4">
            <div className="flex items-center justify-center relative">
              {/* Background indicator - stays below links */}
              <motion.div
                layoutId="navbar-indicator"
                className="absolute rounded-md z-[-1]"
                style={{
                  boxShadow: isAuthorized 
                    ? "0 0 10px rgba(239, 68, 68, 0.3)" 
                    : "0 0 10px rgba(123, 97, 255, 0.3)"
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  duration: 0.3
                }}
              >
                {location.pathname === "/" && (
                  <motion.div
                    className="absolute inset-0 bg-dark-700 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      background: isAuthorized 
                        ? "radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)"
                        : "radial-gradient(circle at center, rgba(123, 97, 255, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {location.pathname === "/report" && (
                  <motion.div
                    className="absolute inset-0 bg-dark-700 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      background: isAuthorized 
                        ? "radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)"
                        : "radial-gradient(circle at center, rgba(123, 97, 255, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {location.pathname === "/dashboard" && (
                  <motion.div
                    className="absolute inset-0 bg-dark-700 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1, 
                      background: isAuthorized 
                        ? "radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)"
                        : "radial-gradient(circle at center, rgba(123, 97, 255, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {location.pathname === "/authority" && (
                  <motion.div
                    className="absolute inset-0 bg-dark-700 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      background: isAuthorized 
                        ? "radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)"
                        : "radial-gradient(circle at center, rgba(123, 97, 255, 0.15) 0%, rgba(28, 25, 38, 0.6) 100%)" 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
              
              {/* Hover indicator */}
              <AnimatePresence>
                {hoveredLink && hoveredLink !== location.pathname && (
                  <motion.div
                    layoutId="hover-indicator"
                    className="absolute rounded-md z-[-2] bg-dark-800/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Nav Links */}
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-6 py-3 rounded-md transition-colors text-lg ${
                      isActive
                        ? isAuthorized ? 'text-red-400 font-medium' : 'text-primary-400 font-medium'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onMouseEnter={() => setHoveredLink(link.path)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{ zIndex: 1 }}
                  >
                    <motion.span
                      initial={false}
                      animate={isActive ? { y: 0, opacity: 1 } : { y: 0, opacity: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      {link.name}
                      {isActive && (
                        <motion.div 
                          layoutId="bottom-border"
                          className="absolute left-0 right-0 h-0.5 bottom-[-3px]"
                          style={{
                            backgroundColor: isAuthorized ? "#ef4444" : "#8257ff",
                            boxShadow: isAuthorized 
                              ? "0 0 8px rgba(239, 68, 68, 0.6)" 
                              : "0 0 8px rgba(130, 87, 255, 0.6)"
                          }}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        />
                      )}
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right section with wallet button - Show Authority wallet button if authorized */}
          <div className="hidden md:block">
            {isAuthorized ? (
              <AuthorityWalletConnectButton className="rounded-full" />
            ) : (
              <WalletConnectButton className="rounded-full" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-card mt-2 mx-4 rounded-xl overflow-hidden"
          >
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-md ${
                    location.pathname === link.path
                      ? isAuthorized ? 'bg-red-900/30 text-red-400' : 'bg-dark-700 text-primary-400'
                      : 'text-gray-300'
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={
                      location.pathname === link.path 
                        ? { x: 0 } 
                        : { x: 0 }
                    }
                  >
                    {link.name}
                    {location.pathname === link.path && (
                      <motion.div 
                        layoutId="mobile-indicator"
                        style={{
                          backgroundColor: isAuthorized ? "#ef4444" : "#8257ff",
                          boxShadow: isAuthorized 
                            ? "0 0 6px rgba(239, 68, 68, 0.5)" 
                            : "0 0 6px rgba(130, 87, 255, 0.5)"
                        }}
                        className="h-0.5 mt-1"
                        initial={{ width: "0%" }}
                        animate={{ width: "30%" }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                </Link>
              ))}
              {/* Mobile wallet button - Show Authority wallet button if authorized */}
              <div className="mt-2">
                {isAuthorized ? (
                  <AuthorityWalletConnectButton className="w-full justify-center" />
                ) : (
                  <WalletConnectButton className="w-full justify-center" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;