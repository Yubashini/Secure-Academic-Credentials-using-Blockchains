import React, { useState, useEffect } from 'react';
import { Shield, GraduationCap, QrCode } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { StudentPanel } from './components/StudentPanel';
import { Header } from './components/Header';
import { Toaster } from 'react-hot-toast';
import { subscribeToChainChanges } from './utils/web3';
import toast from 'react-hot-toast';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    subscribeToChainChanges(() => {
      setIsConnected(false);
      setIsAdmin(false);
      toast.error('Network changed. Please reconnect.');
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      <Header 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student Certificate Management System
          </h1>
          <p className="text-lg text-gray-600">
            Secure, transparent, and verifiable student certificates on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-500" />}
            title="Secure Verification"
            description="Blockchain-based verification ensures certificate authenticity"
          />
          <FeatureCard
            icon={<GraduationCap className="w-8 h-8 text-blue-500" />}
            title="Student Management"
            description="Efficient student data and certificate management"
          />
          <FeatureCard
            icon={<QrCode className="w-8 h-8 text-blue-500" />}
            title="Easy Access"
            description="QR code-based certificate access and verification"
          />
        </div>

        {isConnected ? (
          isAdmin ? <AdminPanel /> : <StudentPanel />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please connect your MetaMask wallet to continue</p>
          </div>
        )}
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:scale-105">
      <div className="flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default App;