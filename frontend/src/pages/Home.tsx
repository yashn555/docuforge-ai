import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from '../components/Upload/UploadZone';
import { UploadProgress } from '../components/Upload/UploadProgress';
import { FiShield, FiZap, FiFileText, FiCpu } from 'react-icons/fi';
import { UploadResponse } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);

  const handleUploadSuccess = (response: UploadResponse) => {
    setUploadResponse(response);
    setIsComplete(true);
    setIsUploading(false);
    
    // Navigate to dashboard after short delay
    setTimeout(() => {
      navigate('/dashboard', { state: { uploadResponse: response } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <FiZap className="w-4 h-4 mr-2" />
            AI-Powered Document Generation
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Generate Documents from
            <span className="gradient-text block mt-2">
              Any Template
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a template, and let AI generate a complete document 
            that preserves your original formatting and structure.
          </p>
          
          <div className="flex justify-center space-x-6 mt-6 text-sm text-gray-500">
            <span className="flex items-center">
              <FiFileText className="mr-2" /> DOCX Templates
            </span>
            <span className="flex items-center">
              <FiCpu className="mr-2" /> Local AI
            </span>
            <span className="flex items-center">
              <FiShield className="mr-2" /> No Account Needed
            </span>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="px-4 pb-16">
        <div className="container mx-auto">
          <UploadZone onUploadSuccess={handleUploadSuccess} />
          <UploadProgress 
            isUploading={isUploading}
            progress={uploadProgress}
            isComplete={isComplete}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center mb-10">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Upload Template</h3>
              <p className="text-gray-600 text-sm">
                Upload your DOCX template. We'll analyze its structure and formatting.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCpu className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. AI Generation</h3>
              <p className="text-gray-600 text-sm">
                AI generates content for each section based on your input.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiZap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Edit & Export</h3>
              <p className="text-gray-600 text-sm">
                Review, edit, and download your final document in DOCX or PDF.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};