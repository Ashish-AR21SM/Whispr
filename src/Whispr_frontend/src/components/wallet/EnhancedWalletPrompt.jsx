import React from 'react';
import { motion } from 'framer-motion';
// Use the renamed hook
import useWalletConnect from './WalletConnect';

const EnhancedWalletPrompt = () => {
  // Now call it correctly as a hook
  const {
    connectWallet,
    isLoading,
  } = useWalletConnect();

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-8 border border-slate-800 shadow-xl"
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            animate={{ 
              boxShadow: ['0 0 0 rgba(139, 92, 246, 0.3)', '0 0 20px rgba(139, 92, 246, 0.6)', '0 0 0 rgba(139, 92, 246, 0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-16 h-16 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 5c1.4 0 2.8 1.1 2.8 2.5V11h1.8v5H7.5v-5h1.8V8.5C9.2 7.1 10.6 6 12 6zm0 2c-.5 0-.8.3-.8.8v1.7h1.5V8.8c0-.5-.3-.8-.7-.8z" />
            </svg>
          </motion.div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-4">Connect Your Wallet</h2>
        
        <p className="text-gray-400 text-center mb-8">
          You need to connect your wallet to access your reports and messages securely.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full py-4 px-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-white transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Connect Wallet'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default EnhancedWalletPrompt;