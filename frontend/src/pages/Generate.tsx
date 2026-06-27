import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCpu, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiArrowLeft,
  FiLoader,
  FiClock,
  FiFileText,
  FiLayers
} from 'react-icons/fi';

interface GenerationResult {
  sections: Record<string, any>;
  totalSections: number;
  aiGenerated: number;
  fallbackGenerated: number;
  totalTime: number;
  success: boolean;
  errors: string[];
  documentTitle: string;
  documentType: string;
  generatedAt: string;
}

export const Generate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing to generate...');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionStatus, setSectionStatus] = useState<Record<string, 'pending' | 'generating' | 'complete'>>({});
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    console.log('📄 Generate page mounted');
    
    // Get data from location state
    const state = location.state as { formData?: any; selectedSections?: string[] };
    console.log('📦 Location state:', state);
    
    let finalFormData = {};
    let finalSelectedSections: string[] = [];

    // Try to get form data from state or localStorage
    if (state?.formData) {
      finalFormData = state.formData;
      console.log('✅ Form data from state:', finalFormData);
    } else {
      try {
        const saved = localStorage.getItem('formData');
        if (saved) {
          finalFormData = JSON.parse(saved);
          console.log('✅ Form data from localStorage:', finalFormData);
        } else {
          // Try setupFormData
          const setupSaved = localStorage.getItem('setupFormData');
          if (setupSaved) {
            finalFormData = JSON.parse(setupSaved);
            console.log('✅ Form data from setupFormData:', finalFormData);
          }
        }
      } catch (e) {
        console.error('Failed to load form data:', e);
      }
    }

    // Try to get selected sections from state or localStorage
    if (state?.selectedSections && state.selectedSections.length > 0) {
      finalSelectedSections = state.selectedSections;
      console.log('✅ Selected sections from state:', finalSelectedSections);
    } else {
      try {
        // Try to get from localStorage (saved by SectionSelection)
        const saved = localStorage.getItem('selectedSections');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            finalSelectedSections = parsed;
            console.log('✅ Selected sections from localStorage:', finalSelectedSections);
          }
        }
        
        // Also try sectionOrder
        if (finalSelectedSections.length === 0) {
          const orderSaved = localStorage.getItem('sectionOrder');
          if (orderSaved) {
            const parsed = JSON.parse(orderSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              finalSelectedSections = parsed;
              console.log('✅ Section order from localStorage:', finalSelectedSections);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load sections:', e);
      }
    }

    // If still no sections, use defaults (core sections)
    if (finalSelectedSections.length === 0) {
      console.log('⚠️ No sections found, using defaults');
      finalSelectedSections = ['abstract', 'introduction', 'objectives', 'methodology', 'conclusion'];
    }

    setFormData(finalFormData);
    setSelectedSections(finalSelectedSections);
    
    // Initialize section status
    const initialStatus: Record<string, 'pending' | 'generating' | 'complete'> = {};
    finalSelectedSections.forEach(section => {
      initialStatus[section] = 'pending';
    });
    setSectionStatus(initialStatus);
    
    console.log('📤 Final data:', { 
      formData: finalFormData, 
      selectedSections: finalSelectedSections,
      sectionCount: finalSelectedSections.length
    });

    // Start generation
    generateDocument(finalFormData, finalSelectedSections);

    // Timer for elapsed time
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const generateDocument = async (formData: any, sections: string[]) => {
    setIsGenerating(true);
    setProgress(0);
    setStatus('Preparing to generate...');
    setError(null);

    console.log('🚀 Starting generation with sections in order:', sections);
    console.log('📋 Form data:', formData);

    try {
      // Progress steps with section updates
      const steps = [
        { progress: 5, status: 'Initializing AI model...' },
        { progress: 15, status: 'Preparing prompts...' },
        { progress: 25, status: 'Generating content...' },
        { progress: 40, status: 'Processing sections...' },
        { progress: 60, status: 'Composing document...' },
        { progress: 75, status: 'Finalizing...' },
        { progress: 90, status: 'Almost done...' },
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          const step = steps[stepIndex];
          setProgress(step.progress);
          setStatus(step.status);
          stepIndex++;
        }
      }, 800);

      // Update section status as they complete
      sections.forEach((section, index) => {
        setTimeout(() => {
          setSectionStatus(prev => ({
            ...prev,
            [section]: 'generating'
          }));
        }, 1000 + (index * 500));
      });

      // Make API call to generate - preserve section order
      const requestBody = {
        userInput: {
          ...formData,
          sections: sections, // Include sections in userInput for context
          sectionOrder: sections // Explicitly pass order
        },
        sectionsToGenerate: sections, // Order is preserved here
        options: {
          useAI: true,
          useFallback: true,
          temperature: 0.7,
          maxTokens: 2048
        }
      };
      
      console.log('📡 Sending generate request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/api/generate/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        },
        body: JSON.stringify(requestBody)
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Generation failed:', errorData);
        throw new Error(errorData.message || errorData.error || 'Generation failed');
      }

      const data = await response.json();
      console.log('✅ Generation result:', data);

      if (data.success && data.result) {
        setResult(data.result);
        setProgress(100);
        setStatus('✅ Generation complete!');
        
        // Mark all sections as complete
        const completedStatus: Record<string, 'complete'> = {};
        sections.forEach(section => {
          completedStatus[section] = 'complete';
        });
        setSectionStatus(completedStatus);
        
        // Save to localStorage
        localStorage.setItem('generationResult', JSON.stringify(data.result));
        localStorage.setItem('generatedAt', new Date().toISOString());
        
        // Navigate to preview after short delay
        setTimeout(() => {
          console.log('➡️ Navigating to preview with result');
          navigate('/preview', { 
            state: { 
              result: data.result, 
              formData: formData,
              sections: sections
            } 
          });
        }, 1500);
      } else {
        throw new Error(data.message || data.error || 'Generation failed');
      }

    } catch (error) {
      console.error('❌ Generation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setStatus('❌ Generation failed');
      setIsGenerating(false);
      
      // Update sections to show error
      const errorStatus: Record<string, 'pending' | 'generating' | 'complete'> = {};
      sections.forEach(section => {
        errorStatus[section] = 'pending';
      });
      setSectionStatus(errorStatus);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generation Failed</h2>
            <p className="text-gray-600 mb-2">{error}</p>
            <p className="text-sm text-gray-400 mb-6">Please check your connection and try again.</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/sections')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Go Back to Section Selection
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setIsGenerating(true);
                  generateDocument(formData, selectedSections);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Retry Generation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center">
          {/* Back button */}
          <button
            onClick={() => navigate('/sections')}
            className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>

          {/* Animated Icon */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative z-10"></div>
            <FiCpu className="absolute inset-0 m-auto w-8 h-8 text-blue-600 z-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Document</h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-gray-500">{status}</span>
            <span className="text-xs text-gray-400 flex items-center">
              <FiClock className="mr-1" />
              {formatTime(elapsedTime)}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
          </div>

          {/* Section Status - Shows in order */}
          {selectedSections.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-center">
                <FiLayers className="mr-2" />
                Sections in Order
                <span className="ml-2 text-xs text-gray-400">({selectedSections.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                {selectedSections.map((section, index) => {
                  const status = sectionStatus[section] || 'pending';
                  const isDone = status === 'complete' || progress > 85;
                  const isActive = status === 'generating' || (!isDone && progress > 15);
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center text-sm px-3 py-2 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : isActive
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {isDone ? (
                        <FiCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      ) : isActive ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                      ) : (
                        <FiLoader className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {index + 1}. {section.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistics */}
          {result && (
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md mx-auto text-sm">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-500">Total Sections</p>
                <p className="font-bold text-gray-900">{result.totalSections}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-500">AI Generated</p>
                <p className="font-bold text-green-600">{result.aiGenerated}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-500">Time</p>
                <p className="font-bold text-gray-900">{Math.round(result.totalTime / 1000)}s</p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 text-sm text-gray-400">
            <p className="flex items-center justify-center">
              <FiFileText className="mr-2" />
              {selectedSections.length} sections being generated in your chosen order
            </p>
          </div>

          {/* Cancel button (if still generating) */}
          {isGenerating && progress < 100 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel generation?')) {
                  navigate('/sections');
                }
              }}
              className="mt-4 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Cancel Generation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};