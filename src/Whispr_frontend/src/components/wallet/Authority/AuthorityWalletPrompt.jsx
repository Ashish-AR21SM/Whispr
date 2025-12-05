import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import useAuthorityWalletConnect from './AuthorityWalletConnect';

const AuthorityWalletPrompt = () => {
  const {
    connectWallet,
    isLoading,
    error,
  } = useAuthorityWalletConnect();

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
              boxShadow: ['0 0 0 rgba(239, 68, 68, 0.3)', '0 0 20px rgba(239, 68, 68, 0.6)', '0 0 0 rgba(239, 68, 68, 0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield className="w-16 h-16 text-red-500" />
          </motion.div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-4">Authority Access Required</h2>
        
        <p className="text-gray-400 text-center mb-4">
          You need to connect an authorized authority wallet to access this section.
        </p>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-900/30 text-red-300 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <p className="text-gray-500 text-sm text-center mb-6">
          Only authorized government officials and law enforcement can access this section.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              Connect Authority Wallet
              <Shield className="ml-2 h-5 w-5" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AuthorityWalletPrompt;