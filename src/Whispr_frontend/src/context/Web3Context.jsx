import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTokenBalance, initializeNewUser, reinitializeWithIdentity, getCurrentPrincipal } from '../api/whisprBackend';

const Web3Context = createContext(undefined);

export const Web3Provider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);

  // Initialize user with tokens on first visit
  useEffect(() => {
    initializeNewUser();
    loadTokenBalance();
    checkExistingConnection();
    
    // Listen for token balance updates
    const handleBalanceUpdate = (event) => {
      setBalance(event.detail.newBalance);
    };
    
    window.addEventListener('tokenBalanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('tokenBalanceUpdated', handleBalanceUpdate);
    };
  }, []);

  const checkExistingConnection = async () => {
    // Check if Plug wallet is already connected
    if (window.ic?.plug) {
      try {
        const connected = await window.ic.plug.isConnected();
        if (connected) {
          const principal = await window.ic.plug.getPrincipal();
          setAddress(principal.toString());
          setIsConnected(true);
          await reinitializeWithIdentity(null); // Use Plug's identity
          await loadTokenBalance();
        }
      } catch (e) {
        console.log("No existing Plug connection");
      }
    }
  };

  const loadTokenBalance = async () => {
    try {
      const tokenBalance = await getTokenBalance();
      setBalance(tokenBalance);
    } catch (error) {
      console.error('Error loading token balance:', error);
      setBalance(100); // Default for new users
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Check if Plug wallet is available
      if (window.ic?.plug) {
        // Detect environment
        const isLocal = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('.localhost');
        
        const CANISTER_ID = isLocal 
          ? "uxrrr-q7777-77774-qaaaq-cai"  // Local development
          : "bdggw-2qaaa-aaaag-aua3q-cai"; // IC Mainnet production
        
        const HOST = isLocal 
          ? "http://localhost:4943"  // Local development
          : "https://icp-api.io";    // IC Mainnet
        
        // Request connection to Plug
        const connected = await window.ic.plug.requestConnect({
          whitelist: [CANISTER_ID],
          host: HOST,
        });
        
        if (connected) {
          const principal = await window.ic.plug.getPrincipal();
          const principalStr = principal.toString();
          setAddress(principalStr);
          setIsConnected(true);
          
          // Reinitialize backend with Plug's identity
          await reinitializeWithIdentity(null); // Will use Plug's agent
          
          // Check if this principal is an authority
          const authorityPrincipals = [
            "d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe"
          ];
          setIsAuthority(authorityPrincipals.includes(principalStr));
          
          await loadTokenBalance();
          console.log("Connected to Plug wallet with principal:", principalStr);
        }
      } else {
        // Fallback: use the generated identity
        console.log("Plug wallet not available, using generated identity");
        const principal = await getCurrentPrincipal();
        setAddress(principal);
        setIsConnected(true);
        await loadTokenBalance();
      }
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Fallback to generated identity
      const principal = await getCurrentPrincipal();
      setAddress(principal);
      setIsConnected(true);
      setBalance(100);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (window.ic?.plug) {
      try {
        await window.ic.plug.disconnect();
      } catch (e) {
        console.log("Error disconnecting Plug:", e);
      }
    }
    setIsConnected(false);
    setAddress(null);
    setIsAuthority(false);
  };

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        connectWallet,
        disconnectWallet,
        address,
        balance,
        isLoading,
        isAuthority,
        refreshBalance: loadTokenBalance,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};