import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleBackground from '../three/ParticleBackground';

const Layout = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Simulate a loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add this effect to scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
                rotate: [0, 180, 360] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="w-16 h-16 rounded-full border-4 border-t-primary-500 border-r-secondary-500 border-b-primary-300 border-l-secondary-300"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>
      <Navbar />
      
      <main className="flex-grow z-10 relative pt-24 pb-24">
        <div className={`container mx-auto ${isHomePage ? '' : 'px-4 md:px-6 lg:px-8'} pb-16`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;