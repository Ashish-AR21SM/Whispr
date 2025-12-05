import React from 'react';
import { motion } from 'framer-motion';
import useAuthorityWalletConnect from './AuthorityWalletConnect';
import { LogIn, LogOut, Shield, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

// Global notification container - will be created if it doesn't exist
const getNotificationContainer = () => {
  let container = document.getElementById('authority-notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'authority-notification-container';
    container.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
    document.body.appendChild(container);
  }
  return container;
};

// Add animation keyframes style to head
const addAnimationStyles = () => {
  if (!document.getElementById('notification-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-animation-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
};

const Notification = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div
      className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white animate-[slideInRight_0.3s_ease-out] ${
        type === 'success' ? 'bg-green-800/90' : 'bg-red-800/90'
      }`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-300 mr-2" />
        )}
        <span>{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="ml-4 text-sm hover:text-white"
      >
        ✕
      </button>
    </div>,
    getNotificationContainer()
  );
};

const AuthorityWalletConnectButton = ({ className = "" }) => {
  // FIXED: Moved useLayoutEffect inside the component
  React.useEffect(() => {
    addAnimationStyles();
  }, []);

  const {
    isConnected,
    isAuthorized,
    walletInfo,
    isLoading,
    error,
    successMessage,
    connectWallet,
    disconnectWallet,
    setError,
    setSuccessMessage
  } = useAuthorityWalletConnect();

  const [copied, setCopied] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const copyToClipboard = () => {
    if (!walletInfo?.principal) return;
    
    navigator.clipboard.writeText(walletInfo.principal)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectWallet();
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <>
      {successMessage && (
        <Notification 
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      
      {error && (
        <Notification 
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          disabled={isLoading}
          className={`bg-red-600 hover:bg-red-700 text-white text-base py-2 px-4 rounded-full flex items-center gap-2 ${className}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Connecting...</span>
            </> 
          ) : (
            <>
              <span className="text-base">Authority Connect</span>
              <Shield className="w-5 h-5" />
            </>
          )}
        </motion.button>
      ) : (
        <div className="flex items-center space-x-2">
          <div 
            className={`border text-white px-3 py-1.5 rounded-lg shadow-inner flex items-center cursor-pointer group hover:bg-red-900/30 ${isAuthorized ? 'bg-red-900/20 border-red-700/50' : 'bg-slate-800 border-slate-700'}`}
            onClick={copyToClipboard}
          >
            <div className={`h-2 w-2 rounded-full mr-2 ${isAuthorized ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">
              {walletInfo?.principal && `${walletInfo.principal.substring(0, 4)}...${walletInfo.principal.substring(walletInfo.principal.length - 3)}`}
              {isAuthorized ? ' (Auth)' : ''}
            </span>
            <div className="ml-2 text-slate-400 group-hover:text-red-300">
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="bg-red-900/30 hover:bg-red-900/50 text-white text-sm py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-red-800/50"
            title="Disconnect"
          >
            {isDisconnecting ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span className="sr-only sm:not-sr-only">Disconnect</span>
                <LogOut className="h-4 w-4" />
              </>
            )}
          </motion.button> 
        </div>
      )}
    </>
  );
};

export default AuthorityWalletConnectButton;