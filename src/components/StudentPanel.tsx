import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { connectWallet } from '../utils/web3';

export function StudentPanel() {
  const [studentData, setStudentData] = useState<any>(null);
  const [rollNumber, setRollNumber] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentByWallet = async () => {
      if (!walletAddress) return;

      try {
        const response = await fetch(`/api/students/wallet/${walletAddress}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('No student record found for this wallet');
            return;
          }
          throw new Error('Failed to fetch student data');
        }
        const data = await response.json();
        setStudentData(data);
        setRollNumber(data.rollNumber);
        toast.success('Student data retrieved successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to retrieve student data');
        console.error(error);
      }
    };

    if (walletAddress) {
      fetchStudentByWallet();
    }
  }, [walletAddress]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/students/${rollNumber}`);
      if (!response.ok) {
        throw new Error('Student not found');
      }
      const data = await response.json();
      setStudentData(data);
      toast.success('Student data retrieved successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to retrieve student data');
      console.error(error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect wallet');
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        {!walletAddress ? (
          <div className="text-center">
            <button
              onClick={handleConnectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Your Certificate
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter Roll Number"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {studentData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData.rollNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData.department}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Admission Year</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData.admissionYear}</p>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
                    <p className="mt-1 text-sm font-mono text-gray-900">{studentData.walletAddress}</p>
                  </div>
                </div>

                {studentData.certificateUrl && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate QR Code</h3>
                    <div className="flex items-center justify-center space-x-6">
                      <div className="p-4 bg-white border rounded-lg">
                        <QRCodeSVG value={`${window.location.origin}${studentData.certificateUrl}`} size={200} />
                      </div>
                      <button
                        onClick={() => window.open(studentData.certificateUrl)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download Certificate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}