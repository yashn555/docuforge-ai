import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from '../components/Upload/UploadZone';
import { UploadProgress } from '../components/Upload/UploadProgress';
import { 
  FiShield, 
  FiZap, 
  FiFileText, 
  FiCpu, 
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiLock
} from 'react-icons/fi';
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
    
    setTimeout(() => {
      navigate('/dashboard', { state: { uploadResponse: response } });
    }, 1500);
  };

  const features = [
    { icon: <FiFileText className="w-6 h-6" />, title: 'Upload Template', desc: 'Upload any DOCX template' },
    { icon: <FiCpu className="w-6 h-6" />, title: 'AI Generation', desc: 'Local AI with Ollama' },
    { icon: <FiShield className="w-6 h-6" />, title: 'Privacy First', desc: 'No account needed' },
    { icon: <FiCheckCircle className="w-6 h-6" />, title: 'Preserve Formatting', desc: 'Keep your template style' },
  ];

  const steps = [
    { number: '01', title: 'Upload Template', desc: 'Upload your DOCX template with formatting' },
    { number: '02', title: 'AI Analysis', desc: 'We analyze structure and sections' },
    { number: '03', title: 'Generate Content', desc: 'AI creates content for each section' },
    { number: '04', title: 'Download', desc: 'Get your formatted document' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <FiZap className="w-4 h-4 mr-2" />
            AI-Powered Document Generation
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Generate Documents from
            <span className="gradient-text block mt-2">
              Any Template
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in">
            Upload a template, and let AI generate a complete document 
            that preserves your original formatting and structure.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 animate-fade-in">
            <span className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FiFileText className="mr-2 text-blue-500" /> DOCX Templates
            </span>
            <span className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FiCpu className="mr-2 text-purple-500" /> Local AI
            </span>
            <span className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FiLock className="mr-2 text-green-500" /> No Account Needed
            </span>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="px-4 pb-16 animate-fade-in">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <UploadZone onUploadSuccess={handleUploadSuccess} />
            <UploadProgress 
              isUploading={isUploading}
              progress={uploadProgress}
              isComplete={isComplete}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-12 md:py-16 bg-gray-50/80">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Why <span className="gradient-text">DocuForge AI</span>
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            Everything you need to generate professional documents with AI
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            Simple 4-step process to generate your document
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16 gradient-bg">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Ready to Generate Your Document?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Upload your template and let AI do the heavy lifting
          </p>
          <button
            onClick={() => {
              document.querySelector('section:nth-child(2)')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Get Started
            <FiArrowRight className="ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
};