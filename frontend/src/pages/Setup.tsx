import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiCpu, 
  FiSend, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiAlertCircle,
  FiFileText,
  FiUser,
  FiBook,
  FiCode,
  FiTarget,
  FiLayers,
  FiClipboard,
  FiChevronRight
} from 'react-icons/fi';

interface SectionData {
  title: string;
  key: string;
  generated: boolean;
  content?: string;
  icon: React.ReactNode;
}

interface GenerationResult {
  sections: Record<string, {
    sectionType: string;
    content: string;
    generatedBy: 'ai' | 'fallback' | 'hybrid';
    modelUsed?: string;
    processingTime?: number;
    tokensUsed?: number;
    success: boolean;
    error?: string;
  }>;
  totalSections: number;
  aiGenerated: number;
  fallbackGenerated: number;
  totalTime: number;
  success: boolean;
  errors: string[];
}

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [aiStatus, setAiStatus] = useState<{ available: boolean; models: string[] }>({
    available: false,
    models: []
  });
  const [currentStep, setCurrentStep] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    studentName: '',
    teacherName: '',
    collegeName: '',
    department: '',
    academicYear: new Date().getFullYear().toString(),
    abstractPoints: '',
    objectives: '',
    problemStatement: '',
    technologies: '',
    methodology: '',
    conclusion: '',
    certificateType: 'Certificate of Completion',
    recipientName: '',
    organization: '',
    eventTitle: '',
    duration: '',
    date: new Date().toLocaleDateString(),
    authority: ''
  });

  const sections: SectionData[] = [
    { title: 'Abstract', key: 'abstract', generated: false, icon: <FiFileText className="w-4 h-4" /> },
    { title: 'Introduction', key: 'introduction', generated: false, icon: <FiBook className="w-4 h-4" /> },
    { title: 'Objectives', key: 'objectives', generated: false, icon: <FiTarget className="w-4 h-4" /> },
    { title: 'Methodology', key: 'methodology', generated: false, icon: <FiLayers className="w-4 h-4" /> },
    { title: 'Conclusion', key: 'conclusion', generated: false, icon: <FiClipboard className="w-4 h-4" /> },
  ];

  useEffect(() => {
    checkAIStatus();
    // Load saved form data if exists
    const savedData = localStorage.getItem('setupFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }

    // Cleanup function for navigation timeouts
    return () => {
      const timeoutId = setTimeout(() => {}, 0);
      clearTimeout(timeoutId);
    };
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/generate/status', {
        headers: {
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAiStatus({
          available: data.aiStatus?.available || false,
          models: data.aiStatus?.models || []
        });
      }
    } catch (error) {
      console.error('Failed to check AI status:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('setupFormData', JSON.stringify(updated));
      return updated;
    });
  };

  const handleNavigation = useCallback((result: GenerationResult) => {
    setIsNavigating(true);
    try {
      if (!result || !result.sections) {
        throw new Error('Invalid generation result');
      }
      
      console.log('➡️ Navigating to preview...');
      navigate('/preview', { 
        state: { 
          result: result, 
          formData: formData,
          timestamp: Date.now()
        } 
      });
    } catch (error) {
      console.error('Navigation error:', error);
      setGenerationError('Failed to navigate to preview. Please try again.');
      setIsNavigating(false);
    }
  }, [navigate, formData]);

  const handleContinueToSections = () => {
    // Save form data
    localStorage.setItem('setupFormData', JSON.stringify(formData));
    
    // Create serializable sections (without React elements)
    const serializableSections = sections.map(s => ({
      title: s.title,
      key: s.key,
      generated: s.generated,
      content: s.content || ''
    }));
    
    // Store sections in localStorage for the SectionSelection page
    localStorage.setItem('sectionsData', JSON.stringify(serializableSections));
    
    // Navigate to section selection with only serializable data
    navigate('/sections', { 
      state: { 
        formData: formData
      } 
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(0);
    setCurrentStep('Starting generation...');

    try {
      const steps = [
        { progress: 10, message: 'Preparing prompts...' },
        { progress: 25, message: 'Generating Abstract...' },
        { progress: 40, message: 'Generating Introduction...' },
        { progress: 55, message: 'Generating Objectives...' },
        { progress: 70, message: 'Generating Methodology...' },
        { progress: 85, message: 'Generating Conclusion...' },
        { progress: 95, message: 'Finalizing document...' },
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          const step = steps[stepIndex];
          setGenerationProgress(step.progress);
          setCurrentStep(step.message);
          stepIndex++;
        }
      }, 800);

      const response = await fetch('/api/generate/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        },
        body: JSON.stringify({
          userInput: formData,
          sectionsToGenerate: sections.map(s => s.key),
          options: {
            useAI: aiStatus.available,
            useFallback: true,
            temperature: 0.7
          }
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Generation failed');
      }

      const data = await response.json();
      console.log('Generation result:', data);

      if (data.success && data.result) {
        setGenerationResult(data.result);
        setGenerationProgress(100);
        setCurrentStep('✅ Generation complete!');
        setIsGenerated(true);
        
        sections.forEach(section => {
          if (data.result.sections[section.key]) {
            section.generated = true;
            section.content = data.result.sections[section.key].content;
          }
        });

        localStorage.setItem('generationResult', JSON.stringify(data.result));
        localStorage.setItem('formData', JSON.stringify(formData));
        
        setTimeout(() => {
          handleNavigation(data.result);
        }, 1500);
      } else {
        throw new Error(data.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error');
      setCurrentStep('❌ Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // If generating, show progress page
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative z-10"></div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Document</h2>
              <p className="text-gray-500 mb-6">{currentStep}</p>
              
              <div className="w-full max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{generationProgress}% complete</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-md mx-auto">
                {sections.map((section, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-center text-sm px-3 py-2 rounded-lg border ${
                      section.generated 
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {section.generated ? (
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                    )}
                    {section.title}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-sm">
                {aiStatus.available ? (
                  <span className="text-green-600 flex items-center justify-center">
                    <FiCheckCircle className="mr-2" /> AI model available: {aiStatus.models.join(', ')}
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center justify-center">
                    <FiAlertCircle className="mr-2" /> AI not available, using fallback generation
                  </span>
                )}
              </div>

              {generationError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600">{generationError}</p>
                  <button
                    onClick={() => {
                      setGenerationError(null);
                      setIsGenerating(false);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    ← Go back and try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navigation loading overlay
  if (isNavigating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 font-semibold text-lg">Preparing Preview...</p>
          <p className="text-gray-500 text-sm mt-2">Your document is almost ready</p>
        </div>
      </div>
    );
  }

  // Main Setup Form
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Setup</h1>
              <p className="text-gray-500 text-sm">Fill in the details to generate your document with AI</p>
            </div>
            <div className="flex items-center space-x-3">
              {aiStatus.available ? (
                <span className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <FiCheckCircle className="mr-1.5" /> AI Ready
                </span>
              ) : (
                <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  <FiAlertCircle className="mr-1.5" /> Fallback Mode
                </span>
              )}
              <button
                onClick={checkAIStatus}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Check AI Status"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {generationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600">{generationError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="flex items-center space-x-2 mb-2">
                <FiUser className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Personal Details</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Final Year Project Report"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Student/Author Name *</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teacher/Guide Name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter guide name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">College/Institute Name *</label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter college/institute name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Year</label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., 2024-2025"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center space-x-2 mb-2">
                <FiFileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Content Details</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Abstract Key Points</label>
                <textarea
                  name="abstractPoints"
                  value={formData.abstractPoints}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                  rows={2}
                  placeholder="Brief description of what your work is about..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Objectives</label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                  rows={2}
                  placeholder="List your main objectives..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Problem Statement</label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                  rows={2}
                  placeholder="What problem are you addressing?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Technologies Used</label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Methodology</label>
                <textarea
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                  rows={2}
                  placeholder="Describe your research methodology..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <FiCode className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Sections to Generate</h3>
              <span className="text-sm text-gray-400 ml-2">({sections.length} sections)</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={`flex items-center px-4 py-2 rounded-lg border text-sm transition-all ${
                    section.generated
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                  {section.generated && (
                    <FiCheckCircle className="ml-2 w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3">
              All sections will be generated using {aiStatus.available ? 'AI (with fallback)' : 'fallback templates'}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleContinueToSections}
                disabled={!formData.title || !formData.studentName || !formData.collegeName}
              >
                <FiChevronRight className="mr-2" />
                Continue to Section Selection →
              </button>
              {( !formData.title || !formData.studentName || !formData.collegeName) && (
                <span className="text-sm text-gray-400">
                  {!formData.title ? 'Title required' : 
                   !formData.studentName ? 'Name required' : 
                   !formData.collegeName ? 'College required' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <span className={`flex items-center ${aiStatus.available ? 'text-green-600' : 'text-yellow-600'}`}>
                {aiStatus.available ? (
                  <><FiCheckCircle className="mr-1.5" /> AI Ready</>
                ) : (
                  <><FiAlertCircle className="mr-1.5" /> Fallback Mode</>
                )}
              </span>
            </div>
          </div>

          {isGenerated && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
              <p className="text-green-700 flex items-center">
                <FiCheckCircle className="mr-2" />
                Document generated successfully!
              </p>
              <button
                onClick={() => {
                  const storedResult = localStorage.getItem('generationResult');
                  if (storedResult) {
                    try {
                      const result = JSON.parse(storedResult);
                      handleNavigation(result);
                    } catch (e) {
                      console.error('Failed to parse stored result:', e);
                    }
                  }
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Click here if you're not redirected automatically →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};