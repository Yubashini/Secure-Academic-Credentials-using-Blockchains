import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { getAdminAddress } from '../config/admin';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum, {
      name: 'Student Certificate System',
      chainId: 1,
    });

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

export function isAdminAddress(address: string): boolean {
  const adminAddress = getAdminAddress();
  if (!adminAddress) {
    toast.error('Admin address not configured');
    return false;
  }
  return address.toLowerCase() === adminAddress.toLowerCase();
}

export async function updateAdminAddress(newAddress: string): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  }) as string[];

  const currentAdmin = getAdminAddress();
  
  if (currentAdmin && accounts[0].toLowerCase() !== currentAdmin.toLowerCase()) {
    throw new Error('Only current admin can update admin address');
  }

  if (!ethers.isAddress(newAddress)) {
    throw new Error('Invalid Ethereum address');
  }

  localStorage.setItem('adminAddress', newAddress);
  window.location.reload();
}

export async function getChainId(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  return await window.ethereum.request({ method: 'eth_chainId' }) as string;
}

export function subscribeToAccountChanges(callback: (accounts: string[]) => void): void {
  if (!window.ethereum) return;

  window.ethereum.on('accountsChanged', callback);
}

export function subscribeToChainChanges(callback: (chainId: string) => void): void {
  if (!window.ethereum) return;

  window.ethereum.on('chainChanged', callback);
}