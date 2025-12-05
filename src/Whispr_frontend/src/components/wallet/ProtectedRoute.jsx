import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import EnhancedWalletPrompt from './EnhancedWalletPrompt';
// Use the renamed hook
import useWalletConnect from './WalletConnect';
// Import the Authority hook to check for Authority login
import useAuthorityWalletConnect from './Authority/AuthorityWalletConnect';

const ProtectedRoute = ({ children }) => {
  // Now call it correctly as a hook and get initialCheckComplete
  const { isConnected, isLoading, initialCheckComplete } = useWalletConnect();
  // Check if user is logged in as Authority
  const { 
    isConnected: isAuthorityConnected, 
    isAuthorized: isAuthorityAuthorized, 
    initialCheckComplete: authorityCheckComplete 
  } = useAuthorityWalletConnect();
  
  const location = useLocation();

  // Store the path user was trying to access for redirect after connection
  React.useEffect(() => {
    // Only store path if we know for sure the user is not connected
    if (!isConnected && !isLoading && initialCheckComplete) {
      sessionStorage.setItem('redirectAfterConnect', location.pathname);
    }
  }, [isConnected, location.pathname, isLoading, initialCheckComplete]);

  // Show loading spinner if we're loading OR if initial check isn't complete yet
  // Also wait for authority check to complete
  if (isLoading || !initialCheckComplete || !authorityCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-12 h-12 rounded-full border-4 border-t-primary-500 border-r-secondary-500 border-b-primary-300 border-l-secondary-300"></div>
      </div>
    );
  }

  // If user is logged in as Authority, redirect to Authority page
  if (isAuthorityConnected && isAuthorityAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-lg w-full bg-slate-900/80 backdrop-blur-md rounded-xl p-8 border border-red-800/30 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 h-8 w-8">
                <path d="M12 9v4"></path>
                <path d="M12 16h.01"></path>
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path>
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-4">Authority Access Only</h2>
          <p className="text-center text-gray-400 mb-6">
            You are currently logged in with an Authority wallet. Regular user features are not accessible with Authority credentials.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.href = '/authority'}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg flex items-center justify-center"
            >
              Go to Authority Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only show wallet prompt if we're sure the user isn't connected
  if (!isConnected && initialCheckComplete) {
    return <EnhancedWalletPrompt />;
  }
  
  return children;
};

export default ProtectedRoute;