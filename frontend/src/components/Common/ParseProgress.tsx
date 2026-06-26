import React from 'react';
import { 
  FiFile, 
  FiLayers, 
  FiType, 
  FiHash, 
  FiCheckCircle,
  FiAlertCircle,
  FiCpu,
  FiBookOpen
} from 'react-icons/fi';

export interface ParseProgressData {
  step: string;
  progress: number;
  message: string;
  details?: any;
}

interface ParseProgressProps {
  progress: ParseProgressData;
  isComplete: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const ParseProgress: React.FC<ParseProgressProps> = ({
  progress,
  isComplete,
  hasError,
  errorMessage
}) => {
  // Helper function for step progress
  const getStepProgress = (current: string, target: string): boolean => {
    const steps = ['parsing_docx', 'analyzing_structure', 'extracting_styles', 'detecting_placeholders', 'detecting_type', 'building_model', 'complete'];
    const currentIndex = steps.indexOf(current);
    const targetIndex = steps.indexOf(target);
    return currentIndex < targetIndex;
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'parsing_docx':
        return <FiFile className="w-5 h-5" />;
      case 'analyzing_structure':
        return <FiLayers className="w-5 h-5" />;
      case 'extracting_styles':
        return <FiType className="w-5 h-5" />;
      case 'detecting_placeholders':
        return <FiHash className="w-5 h-5" />;
      case 'detecting_type':
        return <FiBookOpen className="w-5 h-5" />;
      case 'building_model':
        return <FiCpu className="w-5 h-5" />;
      case 'complete':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiCpu className="w-5 h-5" />;
    }
  };

  const getStepColor = (step: string) => {
    if (hasError) return 'text-red-500';
    if (isComplete) return 'text-green-500';
    switch (step) {
      case 'parsing_docx':
        return 'text-blue-500';
      case 'analyzing_structure':
        return 'text-indigo-500';
      case 'extracting_styles':
        return 'text-purple-500';
      case 'detecting_placeholders':
        return 'text-pink-500';
      case 'detecting_type':
        return 'text-orange-500';
      case 'building_model':
        return 'text-teal-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStepBackground = (step: string) => {
    if (hasError) return 'bg-red-50 border-red-200';
    if (isComplete) return 'bg-green-50 border-green-200';
    switch (step) {
      case 'parsing_docx':
        return 'bg-blue-50 border-blue-200';
      case 'analyzing_structure':
        return 'bg-indigo-50 border-indigo-200';
      case 'extracting_styles':
        return 'bg-purple-50 border-purple-200';
      case 'detecting_placeholders':
        return 'bg-pink-50 border-pink-200';
      case 'detecting_type':
        return 'bg-orange-50 border-orange-200';
      case 'building_model':
        return 'bg-teal-50 border-teal-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (hasError) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <div className="flex items-center mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Parsing Failed</h3>
          </div>
          <p className="text-red-600">{errorMessage || 'An error occurred during parsing.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${getStepColor(progress.step)} bg-opacity-10 mr-3`}>
              {getStepIcon(progress.step)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isComplete ? '✅ Analysis Complete!' : 'Analyzing Your Template'}
              </h3>
              <p className="text-sm text-gray-500">
                {isComplete ? 'Your template has been successfully analyzed' : 'Please wait while we analyze your document'}
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {Math.round(progress.progress)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>

        {/* Current Step */}
        <div className={`p-4 rounded-xl border ${getStepBackground(progress.step)}`}>
          <div className="flex items-start">
            <div className={`mt-0.5 ${getStepColor(progress.step)}`}>
              {getStepIcon(progress.step)}
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900">
                {progress.message}
              </p>
              {progress.details && !isComplete && (
                <div className="mt-2 text-sm text-gray-600">
                  {typeof progress.details === 'object' ? (
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(progress.details).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{String(progress.details)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[
            { step: 'parsing_docx', label: 'Parse' },
            { step: 'analyzing_structure', label: 'Structure' },
            { step: 'extracting_styles', label: 'Styles' },
            { step: 'detecting_placeholders', label: 'Placeholders' },
            { step: 'detecting_type', label: 'Type' }
          ].map((item) => {
            const isActive = progress.step === item.step;
            const isDone = getStepProgress(item.step, progress.step);
            
            return (
              <div key={item.step} className="text-center">
                <div className={`h-1 rounded-full mb-1 ${
                  isDone ? 'bg-green-500' : 
                  isActive ? 'bg-blue-500 animate-pulse' : 
                  'bg-gray-200'
                }`} />
                <p className={`text-xs ${
                  isDone ? 'text-green-600' :
                  isActive ? 'text-blue-600 font-medium' : 
                  'text-gray-400'
                }`}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ParseProgress;