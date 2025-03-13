import { ethers } from 'ethers';

// Load admin address from environment variable or use default
let ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '';

export function getAdminAddress(): string {
  return ADMIN_ADDRESS;
}

export function setAdminAddress(address: string): void {
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  ADMIN_ADDRESS = address;
}