import React from 'react';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
  isComplete: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  progress,
  isComplete
}) => {
  if (!isUploading && !isComplete) return null;

  return (
    <div className="mt-6 w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isComplete ? (
              <FiCheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <FiLoader className="w-6 h-6 text-blue-500 animate-spin" />
            )}
            <span className="font-medium text-gray-700">
              {isComplete ? 'Upload Complete!' : 'Uploading your template...'}
            </span>
          </div>
          <span className="text-sm font-medium text-blue-600">
            {isComplete ? '100%' : `${Math.round(progress)}%`}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isComplete ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: isComplete ? '100%' : `${progress}%` }}
          />
        </div>
        
        {isComplete && (
          <p className="mt-3 text-sm text-green-600">
            ✓ Your template has been uploaded successfully
          </p>
        )}
      </div>
    </div>
  );
};