import { useState, useEffect, useCallback } from 'react';
import { registerAsAuthority, reinitializeWithIdentity, getCurrentPrincipal, isAuthority as checkIsAuthorityApi } from '../../../api/whisprBackend';

// Authorized principal ID that's allowed to access authority features
const AUTHORIZED_PRINCIPAL = "d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe";

const useAuthorityWalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  
  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      
      // Make sure the IC object exists in window
      if (typeof window.ic?.plug === 'undefined') {
        console.log("Plug wallet extension not detected");
        setIsLoading(false);
        setInitialCheckComplete(true);
        return;
      }

      try {
        const connected = await window.ic.plug.isConnected();
        
        if (connected) {
          setIsConnected(true);
          // Get principal ID
          const principal = await window.ic.plug.agent.getPrincipal();
          const principalText = principal.toString();
          
          // Check if this is an authorized authority wallet
          const authorized = principalText === AUTHORIZED_PRINCIPAL;
          setIsAuthorized(authorized);
          
          if (!authorized) {
            setError("This wallet is not authorized for authority access");
          } else {
            // Register as authority in the backend if authorized
            try {
              await reinitializeWithIdentity(null); // Reinitialize with Plug wallet
              await registerAsAuthority();
              console.log("Registered as authority in backend on reconnect");
            } catch (regError) {
              console.warn("Backend authority registration on reconnect:", regError.message);
            }
          }
          
          setWalletInfo({
            principal: principalText,
            isAuthority: authorized,
            accountId: 'c6ea0cfefa62ef67b27d7ac212e2217b8044a345ea8f860f72b719e403398a2b'
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      } finally {
        setIsLoading(false);
        setInitialCheckComplete(true);
      }
    };
    
    // Small delay to ensure the plug extension has loaded
    const timer = setTimeout(() => {
      checkConnection();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Connect to Plug wallet for authority access
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (typeof window.ic?.plug === 'undefined') {
      window.open('https://plugwallet.ooo/', '_blank');
      setIsLoading(false);
      setError("Plug wallet not installed. Please install Plug and refresh.");
      return;
    }

    try {
      // Whitelist of canisters to connect with - include the backend canister
      const whitelist = ["bdggw-2qaaa-aaaag-aua3q-cai"];
      const host = "https://icp-api.io";

      // Request connection
      const result = await window.ic.plug.requestConnect({
        whitelist,
        host,
        timeout: 60000,
      });

      if (result) {
        setIsConnected(true);
        
        // Get principal ID
        const principal = await window.ic.plug.agent.getPrincipal();
        const principalText = principal.toString();
        
        // Check if this is an authorized authority wallet
        const authorized = principalText === AUTHORIZED_PRINCIPAL;
        setIsAuthorized(authorized);
        
        setWalletInfo({
          principal: principalText,
          isAuthority: authorized,
          accountId: 'c6ea0cfefa62ef67b27d7ac212e2217b8044a345ea8f860f72b719e403398a2b'
        });
        
        if (authorized) {
          setSuccessMessage("Authority wallet connected successfully!");
          
          // Register as authority in the backend
          try {
            await reinitializeWithIdentity(null); // Reinitialize with Plug wallet
            await registerAsAuthority();
            console.log("Registered as authority in backend");
          } catch (regError) {
            console.warn("Backend authority registration:", regError.message);
            // Continue anyway - might already be registered
          }
          
          // Handle redirect if there was a saved path
          const redirectPath = sessionStorage.getItem('authorityRedirectAfterConnect');
          if (redirectPath) {
            sessionStorage.removeItem('authorityRedirectAfterConnect');
            window.location.href = redirectPath;
          }
        } else {
          setError("Connected wallet is not authorized for authority access");
        }
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError("Wallet connection was rejected");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError("Failed to connect: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to disconnect using the Plug API
      if (window.ic?.plug) {
        try {
          await window.ic.plug.disconnect();
        } catch (apiError) {
          console.warn("Error with plug.disconnect API:", apiError);
        }
      }
      
      // Reset React state
      setIsConnected(false);
      setIsAuthorized(false);
      setWalletInfo(null);
      
      // Clear localStorage entries
      try {
        localStorage.removeItem('ic-identity');
        localStorage.removeItem('ic-delegation');
      } catch (storageError) {
        console.warn("Error clearing localStorage:", storageError);
      }
      
      // Clear any other state or caches
      if (window.ic?.plug?.agent) {
        try {
          window.ic.plug.agent = null;
        } catch (err) {}
      }
      
      setSuccessMessage("Authority wallet disconnected successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Disconnect error:", error);
      setError("Error disconnecting wallet: " + (error.message || "Unknown error"));
      
      // Even if there's an error, still reset the React state as a fallback
      setIsConnected(false);
      setIsAuthorized(false);
      setWalletInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    isAuthorized,
    walletInfo,
    isLoading,
    error,
    successMessage,
    initialCheckComplete,
    connectWallet,
    disconnectWallet,
    setError,
    setSuccessMessage
  };
};

export default useAuthorityWalletConnect;