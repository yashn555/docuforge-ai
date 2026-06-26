import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';
import clsx from 'clsx';
import axios from 'axios';
import { UploadResponse } from '../../types';

interface UploadZoneProps {
  onUploadSuccess: (response: UploadResponse) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate file type
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'docx') {
        setError('Please upload a .docx file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      handleUpload(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    onDropRejected: (rejected) => {
      const err = rejected[0]?.errors[0];
      if (err?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (err?.code === 'file-invalid-type') {
        setError('Please upload a valid .docx file.');
      } else {
        setError('Failed to upload file. Please try again.');
      }
    }
  });

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('template', file);

    try {
      const response = await axios.post<UploadResponse>('/api/upload/template', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      // Store session ID
      if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }

      onUploadSuccess(response.data);
      setIsUploading(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Upload failed. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer',
          isDragActive
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {!file ? (
            <>
              <div className="p-4 bg-blue-100 rounded-full">
                <FiUploadCloud className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-700">
                  Upload your document template
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop a .docx file here, or click to browse
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>📄 DOCX only</span>
                <span>•</span>
                <span>📦 Max 10MB</span>
                <span>•</span>
                <span>🔒 Session-based</span>
              </div>
            </>
          ) : (
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FiFile className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-700 truncate max-w-[150px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-blue-600 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <FiX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};