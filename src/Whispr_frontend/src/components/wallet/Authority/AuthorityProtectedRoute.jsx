import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthorityWalletPrompt from './AuthorityWalletPrompt';
import useAuthorityWalletConnect from './AuthorityWalletConnect';

const AuthorityProtectedRoute = ({ children }) => {
  const { isConnected, isAuthorized, isLoading, initialCheckComplete } = useAuthorityWalletConnect();
  const location = useLocation();

  // Store the path user was trying to access for redirect after connection
  React.useEffect(() => {
    if ((!isConnected || !isAuthorized) && !isLoading && initialCheckComplete) {
      sessionStorage.setItem('authorityRedirectAfterConnect', location.pathname);
    }
  }, [isConnected, isAuthorized, location.pathname, isLoading, initialCheckComplete]);

  // Show loading spinner if we're loading OR if initial check isn't complete yet
  if (isLoading || !initialCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-12 h-12 rounded-full border-4 border-t-red-500 border-r-red-300 border-b-red-500 border-l-red-300"></div>
      </div>
    );
  }

  // Show wallet prompt if not connected or not authorized
  if (!isConnected || !isAuthorized) {
    return <AuthorityWalletPrompt />;
  }
  
  // User is connected and authorized, show the protected content
  return children;
};

export default AuthorityProtectedRoute;