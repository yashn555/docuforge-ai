import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadResponse } from '../types';
import { FiArrowLeft, FiCheckCircle, FiFile, FiDownload } from 'react-icons/fi';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get upload data from navigation state
    const state = location.state as { uploadResponse?: UploadResponse };
    
    if (state?.uploadResponse) {
      setUploadData(state.uploadResponse);
      setIsLoading(false);
    } else {
      // Check if we have a session
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        // Fetch session data
        fetchSessionData(sessionId);
      } else {
        navigate('/');
      }
    }
  }, [location, navigate]);

  const fetchSessionData = async (sessionId: string) => {
    try {
      const response = await fetch('/api/upload/status', {
        headers: {
          'X-Session-Id': sessionId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUploadData(data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!uploadData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No template uploaded</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 btn-primary"
          >
            Upload a Template
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Template Analysis
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Your template has been uploaded and analyzed
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Analyzed</span>
            </div>
          </div>
        </div>

        {/* File Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded File
          </h2>
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <FiFile className="w-8 h-8 text-blue-600 mr-4" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{uploadData.file.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB • 
                {uploadData.preview.wordCount} words • 
                {uploadData.preview.charCount} characters
              </p>
            </div>
            <FiDownload className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Content Preview
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {uploadData.preview.content}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🚀 Ready for AI Generation
          </h2>
          <p className="text-gray-600 mb-6">
            Your template has been parsed. Next, we'll collect the information needed 
            to generate your document.
          </p>
          <button className="btn-primary">
            Continue to Document Setup →
          </button>
        </div>
      </div>
    </div>
  );
};