import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, MessageSquare, CheckCircle, XCircle, 
  Wallet, FileText, AlertTriangle, ArrowRight, Info
} from 'lucide-react';

const FlowChart = () => {
  const [hoveredStep, setHoveredStep] = useState(null);
  
  const steps = [
    {
      id: 'connect',
      title: 'Connect Wallet',
      icon: Wallet,
      description: 'Connect securely with blockchain',
      color: 'from-purple-600 to-indigo-600',
      detailedInfo: 'Your wallet connects anonymously through zero-knowledge proofs, ensuring your identity remains protected while verifying your ability to stake tokens.'
    },
    {
      id: 'report',
      title: 'Submit Report',
      icon: FileText,
      description: 'Description, Evidence, Location',
      color: 'from-indigo-600 to-blue-600',
      detailedInfo: 'Provide detailed information with secure evidence upload. All data is encrypted and stored on decentralized storage, accessible only to authorized parties.'
    },
    {
      id: 'stake',
      title: 'Stake Tokens',
      icon: Lock,
      description: 'Stake to verify authenticity',
      color: 'from-blue-600 to-cyan-600',
      detailedInfo: 'Staking adds credibility to your report. Higher stakes indicate stronger confidence and result in larger rewards if your report is validated.'
    },
    {
      id: 'review',
      title: 'Authority Review',
      icon: Shield,
      description: 'Secure verification process',
      color: 'from-cyan-600 to-teal-600',
      detailedInfo: 'Authorized personnel review your report through secure channels. Your identity remains hidden while the information is thoroughly investigated.'
    },
    {
      id: 'chat',
      title: 'Anonymous Chat',
      icon: MessageSquare,
      description: 'Encrypted communication',
      color: 'from-teal-600 to-green-600',
      detailedInfo: 'If needed, authorities can communicate with you through end-to-end encrypted channels, maintaining your anonymity throughout the process.'
    }
  ];

  const outcomes = [
    {
      id: 'valid',
      title: 'Valid Report',
      icon: CheckCircle,
      description: '10x Token Reward',
      color: 'from-green-600 to-emerald-600',
      detailedInfo: 'When your report is validated, you receive 10x your staked tokens as a reward. This incentivizes genuine reporting and community participation.'
    },
    {
      id: 'invalid',
      title: 'False Report',
      icon: XCircle,
      description: 'Tokens Burned',
      color: 'from-red-600 to-rose-600',
      detailedInfo: 'If your report is found to be false or malicious, your staked tokens will be burned. This discourages misuse of the platform and maintains integrity.'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const lineVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { 
      width: "100%", 
      opacity: 0.7,
      transition: { 
        duration: 0.8, 
        ease: "easeInOut",
        delay: 0.4
      }
    }
  };

  const detailVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 15, stiffness: 500 }
    },
    exit: { opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } }
  };

  const glowVariants = {
    idle: { boxShadow: '0 0 0 rgba(139, 92, 246, 0)' },
    hover: { 
      boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)', 
      transition: { duration: 0.8, repeat: Infinity, repeatType: "reverse" } 
    }
  };

  return (
    <div className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              How Whispr Works
            </span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Secure, anonymous reporting with blockchain validation
          </p>
        </motion.div>

        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-700 rounded-full filter blur-[120px] opacity-20"></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-indigo-700 rounded-full filter blur-[120px] opacity-20"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-700 rounded-full filter blur-[120px] opacity-20"></div>
          </div>

          <motion.div 
            className="relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Main Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 relative">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <motion.div 
                    className={`bg-gradient-to-br ${step.color} p-[1px] rounded-2xl`}
                    whileHover="hover"
                    animate={hoveredStep === step.id ? "hover" : "idle"}
                    variants={glowVariants}
                  >
                    <div className="bg-gray-900 backdrop-blur-sm p-6 rounded-2xl h-full relative overflow-hidden">
                      {/* Circle decorations */}
                      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white opacity-[0.03] rounded-full"></div>
                      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white opacity-[0.02] rounded-full"></div>
                      
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div className="relative">
                          <motion.div
                            className="h-20 w-20 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center mb-4"
                            whileHover={{ 
                              rotate: 360, 
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
                            }}
                            transition={{ duration: 0.7 }}
                          >
                            <step.icon className="h-9 w-9 text-white" />
                          </motion.div>
                          <motion.div
                            className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-900"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                          >
                            {index + 1}
                          </motion.div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-300">{step.description}</p>
                        
                        {/* Learn more indicator */}
                        <motion.p 
                          className="text-xs text-purple-400 mt-3 font-medium flex items-center opacity-0"
                          animate={{ opacity: hoveredStep === step.id ? 1 : 0 }}
                        >
                          <Info className="h-3 w-3 mr-1" /> 
                          Learn more
                        </motion.p>
                      </div>

                      {/* Detailed info popup */}
                      <AnimatePresence>
                        {hoveredStep === step.id && (
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm p-6 rounded-2xl flex flex-col z-20"
                            variants={detailVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <div className="flex items-center mb-3">
                              <step.icon className="h-6 w-6 text-purple-400 mr-2" />
                              <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                            </div>
                            <p className="text-gray-300 text-sm">{step.detailedInfo}</p>
                            <div className="mt-auto pt-3 text-xs text-purple-400 flex items-center">
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </motion.div>
                              <span className="ml-1">Hover next step</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Connecting lines */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block h-0.5 absolute top-1/2 -right-4 left-[calc(100%-16px)] transform -translate-y-1/2 overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${step.color} rounded-full`}
                        variants={lineVariants}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Outcomes */}
            <div className="relative mt-20 mb-8">
              <div className="absolute left-1/2 -top-10 h-16 w-0.5 transform -translate-x-1/2">
                <motion.div 
                  className="h-full w-full bg-gradient-to-b from-teal-500 to-green-500 rounded-full"
                  variants={lineVariants}
                />
              </div>
              
              <motion.h3 
                className="text-2xl font-bold text-center mb-8 text-white"
                variants={itemVariants}
              >
                Possible Outcomes
              </motion.h3>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                variants={containerVariants}
              >
                {outcomes.map((outcome) => (
                  <motion.div
                    key={outcome.id}
                    variants={itemVariants}
                    onMouseEnter={() => setHoveredStep(outcome.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <motion.div
                      className={`bg-gradient-to-br ${outcome.color} p-[1px] rounded-2xl`}
                      whileHover="hover"
                      animate={hoveredStep === outcome.id ? "hover" : "idle"}
                      variants={glowVariants}
                    >
                      <div className="bg-gray-900 p-6 rounded-2xl relative overflow-hidden">
                        {/* Circle decorations */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-[0.02] rounded-full"></div>
                        
                        <div className="flex items-center space-x-5 relative z-10">
                          <motion.div
                            className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
                            whileHover={{ 
                              rotate: 360, 
                              backgroundColor: outcome.id === 'valid' ? "rgba(0, 100, 0, 0.3)" : "rgba(100, 0, 0, 0.3)",
                            }}
                            transition={{ duration: 0.7 }}
                          >
                            <outcome.icon className="h-8 w-8 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{outcome.title}</h3>
                            <p className="text-gray-300">{outcome.description}</p>
                            
                            {/* Learn more indicator */}
                            <motion.p 
                              className="text-xs text-purple-400 mt-2 font-medium flex items-center opacity-0"
                              animate={{ opacity: hoveredStep === outcome.id ? 1 : 0 }}
                            >
                              <Info className="h-3 w-3 mr-1" /> 
                              Learn more
                            </motion.p>
                          </div>
                        </div>

                        {/* Detailed info popup */}
                        <AnimatePresence>
                          {hoveredStep === outcome.id && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm p-6 rounded-2xl flex flex-col z-20"
                              variants={detailVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <div className="flex items-center mb-3">
                                <outcome.icon className="h-6 w-6 text-purple-400 mr-2" />
                                <h4 className="text-lg font-semibold text-white">{outcome.title}</h4>
                              </div>
                              <p className="text-gray-300 text-sm">{outcome.detailedInfo}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Security Notice */}
            <motion.div 
              className="mt-16 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              <motion.div 
                className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-[1px] rounded-2xl"
                whileHover={{ 
                  boxShadow: '0 0 25px rgba(139, 92, 246, 0.3)', 
                  transition: { duration: 0.8 } 
                }}
              >
                <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl relative overflow-hidden">
                  {/* Circle decoration */}
                  <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white opacity-[0.02] rounded-full"></div>
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-white opacity-[0.02] rounded-full"></div>
                  
                  <div className="flex items-start space-x-5 relative z-10">
                    <div className="p-4 bg-purple-900/40 backdrop-blur-sm rounded-xl">
                      <AlertTriangle className="h-7 w-7 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Security Guarantee</h4>
                      <p className="text-gray-300">
                        Your identity remains completely anonymous through blockchain technology. 
                        All communications are end-to-end encrypted and evidence is stored securely using decentralized storage. 
                        Zero-knowledge proofs ensure verification without revealing your personal information.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded-full">End-to-End Encryption</span>
                        <span className="px-3 py-1 bg-indigo-900/30 text-indigo-300 text-sm rounded-full">Zero-Knowledge Proofs</span>
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-full">Decentralized Storage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FlowChart;