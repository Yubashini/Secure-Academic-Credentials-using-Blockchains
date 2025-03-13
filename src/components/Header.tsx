import React, { useEffect } from 'react';
import { WalletIcon } from 'lucide-react';
import { connectWallet, isAdminAddress, subscribeToAccountChanges } from '../utils/web3';
import toast from 'react-hot-toast';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
}

export function Header({ isAdmin, setIsAdmin, isConnected, setIsConnected }: HeaderProps) {
  useEffect(() => {
    subscribeToAccountChanges((accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setIsAdmin(false);
        toast.error('Wallet disconnected');
      } else {
        const newAddress = accounts[0];
        setIsAdmin(isAdminAddress(newAddress));
      }
    });
  }, [setIsConnected, setIsAdmin]);

  const handleConnect = async () => {
    try {
      const address = await connectWallet();
      setIsConnected(true);
      
      if (isAdminAddress(address)) {
        setIsAdmin(true);
        toast.success('Connected as admin');
      } else {
        setIsAdmin(false);
        toast.success('Connected as student');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      toast.error(errorMessage);
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {isConnected && isAdmin && (
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                Admin Mode
              </div>
            )}
          </div>

          <button
            onClick={handleConnect}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
              ${isConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            <WalletIcon className="w-4 h-4" />
            <span>{isConnected ? 'Connected' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}