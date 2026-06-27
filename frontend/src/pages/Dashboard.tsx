import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadResponse } from '../types';
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiFile, 
  FiAlertCircle,
  FiCpu,
  FiBookOpen,
  FiLayers,
  FiGrid,
  FiHash,
  FiInfo,
  FiClock,
  FiTrendingUp,
  FiShield,
  FiZap
} from 'react-icons/fi';
import { ParseProgress, ParseProgressData } from '../components/Common/ParseProgress';

interface TemplateSummary {
  documentType: string;
  documentTypeLabel: string;
  sectionCount: number;
  wordCount: number;
  pageCount?: number;
  hasPlaceholders: boolean;
  placeholderCount: number;
  hasTitlePage: boolean;
  hasCertificate: boolean;
  hasSignature: boolean;
  hasDeclaration: boolean;
  hasAcknowledgement: boolean;
  confidence: number;
  warnings: string[];
  errors: string[];
}

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [summary, setSummary] = useState<TemplateSummary | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState<ParseProgressData>({
    step: 'start',
    progress: 0,
    message: 'Initializing...'
  });

  useEffect(() => {
    console.log('📄 Dashboard mounted');
    const state = location.state as { uploadResponse?: UploadResponse };
    
    if (state?.uploadResponse) {
      console.log('✅ Upload response found in state');
      setUploadData(state.uploadResponse);
      // Auto-parse the template
      parseTemplate();
    } else {
      const sessionId = localStorage.getItem('sessionId');
      console.log(`🔑 Session ID: ${sessionId || 'none'}`);
      if (sessionId) {
        // Check if we already have a summary in localStorage
        const savedSummary = localStorage.getItem('templateSummary');
        if (savedSummary) {
          try {
            const parsedSummary = JSON.parse(savedSummary);
            console.log('✅ Found saved summary:', parsedSummary);
            setSummary(parsedSummary);
            setParseComplete(true);
            
            // Also try to get upload data
            fetchUploadData(sessionId);
            return;
          } catch (e) {
            console.warn('Failed to parse saved summary:', e);
          }
        }
        fetchSessionData(sessionId);
      } else {
        console.warn('⚠️ No session ID found, redirecting to home');
        navigate('/');
      }
    }
  }, [location, navigate]);

  const fetchUploadData = async (sessionId: string) => {
    try {
      const response = await fetch('/api/upload/status', {
        headers: { 'X-Session-Id': sessionId },
      });
      if (response.ok) {
        const data = await response.json();
        setUploadData(data);
      }
    } catch (error) {
      console.warn('Failed to fetch upload data:', error);
    }
  };

  const parseTemplate = async () => {
    console.log('🚀 Starting template parsing...');
    setIsParsing(true);
    setParseComplete(false);
    setParseError(null);
    setParseProgress({
      step: 'start',
      progress: 0,
      message: 'Starting template analysis...'
    });

    try {
      const sessionId = localStorage.getItem('sessionId');
      console.log(`📡 Sending parse request with session: ${sessionId}`);

      const response = await fetch('/api/parse/template', {
        method: 'POST',
        headers: {
          'X-Session-Id': sessionId || '',
          'Accept': 'text/event-stream',
        },
      });

      console.log(`📡 Parse response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Parse failed with status ${response.status}:`, errorText);
        
        let errorMessage = 'Failed to parse template';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log(`📊 Progress: ${data.step} - ${data.progress}% - ${data.message}`);
              
              if (data.step === 'complete') {
                console.log('✅ Parsing complete!', data.result);
                if (data.result && data.result.summary) {
                  setSummary(data.result.summary);
                  localStorage.setItem('templateSummary', JSON.stringify(data.result.summary));
                }
                setParseComplete(true);
                setIsParsing(false);
                setParseProgress({
                  step: 'complete',
                  progress: 100,
                  message: '✅ Parsing complete!'
                });
                
                // If we have upload data, update file size
                if (uploadData?.file) {
                  const fileInfo = {
                    ...uploadData,
                    file: {
                      ...uploadData.file,
                      size: uploadData.file.size || 0
                    }
                  };
                  setUploadData(fileInfo);
                }
              } else if (data.step === 'error') {
                console.error('❌ Parse error:', data.error);
                setParseError(data.error || data.message);
                setIsParsing(false);
                setParseProgress({
                  step: 'error',
                  progress: 0,
                  message: data.message
                });
              } else {
                setParseProgress({
                  step: data.step || 'processing',
                  progress: data.progress || 0,
                  message: data.message || 'Processing...',
                  details: data.details
                });
              }
            } catch (e) {
              console.warn('⚠️ Failed to parse SSE message:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Parse error:', error);
      setParseError(error instanceof Error ? error.message : 'Unknown error');
      setIsParsing(false);
      setParseComplete(false);
    }
  };

  const fetchSessionData = async (sessionId: string) => {
    console.log(`📡 Fetching session data for: ${sessionId}`);
    
    try {
      // Try to get parse status first
      const parseResponse = await fetch('/api/parse/status', {
        headers: { 'X-Session-Id': sessionId },
      });

      if (parseResponse.ok) {
        const data = await parseResponse.json();
        console.log('✅ Parse status found:', data.summary);
        setSummary(data.summary);
        setUploadData({
          success: true,
          sessionId: sessionId,
          file: {
            name: data.templateModel?.fileName || 'Unknown',
            size: 0,
            path: ''
          },
          preview: {
            content: data.templateModel?.contentPreview || '',
            wordCount: data.summary?.wordCount || 0,
            charCount: 0
          },
          message: 'Template loaded from session'
        });
        setParseComplete(true);
        return;
      }

      // If not parsed, get upload status and parse
      console.log('ℹ️ No parse status found, checking upload status...');
      const uploadResponse = await fetch('/api/upload/status', {
        headers: { 'X-Session-Id': sessionId },
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        console.log('✅ Upload data found:', data);
        setUploadData(data);
        // Auto-parse
        await parseTemplate();
      } else {
        console.warn('⚠️ No upload or parse data found, redirecting to home');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Failed to fetch session:', error);
      navigate('/');
    }
  };

  // Show parsing progress
  if (isParsing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-4 md:mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm md:text-base"
            >
              <FiArrowLeft className="mr-2" />
              Back to Home
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center mb-6">
              <FiCpu className="w-6 h-6 text-blue-600 mr-3 animate-pulse" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Analyzing Your Template
                </h1>
                <p className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-none">
                  {uploadData?.file?.name || 'Processing...'}
                </p>
              </div>
            </div>
            
            <ParseProgress 
              progress={parseProgress}
              isComplete={false}
              hasError={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show error
  if (parseError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-4 md:mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm md:text-base"
            >
              <FiArrowLeft className="mr-2" />
              Back to Home
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="text-center">
              <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Parsing Failed</h2>
              <p className="text-gray-600 mb-6">{parseError}</p>
              <button
                onClick={() => {
                  setParseError(null);
                  setParseComplete(false);
                  parseTemplate();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If parsing is complete but no summary yet
  if (parseComplete && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template data...</p>
        </div>
      </div>
    );
  }

  // Show template analysis result
  if (!summary && !uploadData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-gray-600">No template found</p>
          <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Upload a Template
          </button>
        </div>
      </div>
    );
  }

  // MAIN VIEW - Template Analysis Complete
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4 md:mb-6 text-sm md:text-base"
        >
          <FiArrowLeft className="mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Template Analysis Complete
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                We've analyzed your template structure and formatting
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-600 font-medium">Analyzed</span>
            </div>
          </div>
        </div>

        {/* Summary Cards - Mobile Responsive */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FiBookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="ml-2 md:ml-3 min-w-0">
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">Document Type</p>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm truncate">{summary.documentTypeLabel}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 md:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <FiLayers className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div className="ml-2 md:ml-3">
                  <p className="text-[10px] md:text-xs text-gray-500">Sections</p>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{summary.sectionCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <FiHash className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <div className="ml-2 md:ml-3">
                  <p className="text-[10px] md:text-xs text-gray-500">Placeholders</p>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{summary.placeholderCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 md:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                  <FiGrid className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                </div>
                <div className="ml-2 md:ml-3">
                  <p className="text-[10px] md:text-xs text-gray-500">Confidence</p>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">
                    {(summary.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Info */}
        {uploadData && (
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded File
            </h2>
            <div className="flex items-center p-3 md:p-4 bg-gray-50 rounded-xl">
              <FiFile className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-3 md:mr-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm md:text-base truncate">{uploadData.file?.name || 'Unknown'}</p>
                <p className="text-xs md:text-sm text-gray-500">
                  {summary?.wordCount || 0} words • 
                  {summary?.pageCount || '?'} pages
                </p>
              </div>
              <FiInfo className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Template Structure */}
        {summary && (
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Template Structure
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] md:text-xs text-gray-500">Title Page</p>
                <p className="font-medium text-xs md:text-sm">{summary.hasTitlePage ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] md:text-xs text-gray-500">Certificate</p>
                <p className="font-medium text-xs md:text-sm">{summary.hasCertificate ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] md:text-xs text-gray-500">Declaration</p>
                <p className="font-medium text-xs md:text-sm">{summary.hasDeclaration ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] md:text-xs text-gray-500">Acknowledgement</p>
                <p className="font-medium text-xs md:text-sm">{summary.hasAcknowledgement ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] md:text-xs text-gray-500">Signature</p>
                <p className="font-medium text-xs md:text-sm">{summary.hasSignature ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] md:text-xs text-gray-500">Placeholders</p>
                <p className="font-medium text-xs md:text-sm">{summary.hasPlaceholders ? `✅ ${summary.placeholderCount} found` : '❌ None'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Detected Sections */}
        {summary && summary.sectionCount > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detected Sections
            </h2>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {['Title', 'Abstract', 'Introduction', 'Objectives', 'Methodology', 'Conclusion', 'References', 'Certificate', 'Signature'].map((section) => (
                <span 
                  key={section}
                  className="px-2 py-1 md:px-3 md:py-1 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm border border-blue-200"
                >
                  {section}
                </span>
              ))}
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-3">
              {summary.sectionCount} total sections detected
            </p>
          </div>
        )}

        {/* Warnings */}
        {summary?.warnings && summary.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 md:p-4 mb-4 md:mb-6">
            <div className="flex items-start">
              <FiAlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mt-0.5 mr-2 md:mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 text-sm md:text-base">Parsing Warnings</p>
                <ul className="text-xs md:text-sm text-yellow-700 mt-1 list-disc list-inside">
                  {summary.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps - Updated with better mobile responsiveness */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-8 border border-blue-100">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            🚀 Ready for AI Generation
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
            Your template has been parsed successfully. Next, we'll collect the information 
            needed to generate your document with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center">
            <button 
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center text-sm md:text-base"
              onClick={() => {
                console.log('🔄 Navigate to Setup clicked');
                navigate('/setup');
              }}
            >
              Continue to Document Setup →
            </button>
            <span className="text-xs md:text-sm text-gray-500">
              This will take you to the document setup page
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;