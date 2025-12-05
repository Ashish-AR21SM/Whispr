import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Database, FileText, MessageSquare } from 'lucide-react';

const FloatingIcons = () => {
  const icons = [
    { Icon: Lock, color: "text-primary-400", delay: 0 },
    { Icon: Database, color: "text-secondary-400", delay: 0.2 },
    { Icon: FileText, color: "text-primary-300", delay: 0.4 },
    { Icon: MessageSquare, color: "text-secondary-300", delay: 0.6 }
  ];
  
  return (
    <div className="relative w-full h-full">
      {/* Center Shield Icon */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <Shield className="w-20 h-20 text-primary-500" />
      </motion.div>
      
      {/* Orbiting Icons */}
      {icons.map(({ Icon, color, delay }, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1,
            scale: 1,
            rotate: 360,
            x: Math.cos(index * (Math.PI / 2)) * 100,
            y: Math.sin(index * (Math.PI / 2)) * 100
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            delay,
            ease: "linear"
          }}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className={`w-8 h-8 ${color}`} />
          </motion.div>
        </motion.div>
      ))}
      
      {/* Glowing Effect */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/30 to-secondary-500/30"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        style={{ filter: 'blur(30px)' }}
      />
    </div>
  );
};

export default FloatingIcons;