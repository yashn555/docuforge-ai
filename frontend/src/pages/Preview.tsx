import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiCpu, 
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiEdit2,
  FiFileText,
  FiLayers,
  FiClock
} from 'react-icons/fi';

interface SectionContent {
  sectionType: string;
  content: string;
  generatedBy: 'ai' | 'fallback' | 'hybrid';
  modelUsed?: string;
  processingTime?: number;
  tokensUsed?: number;
  success: boolean;
  error?: string;
}

interface GenerationResult {
  sections: Record<string, SectionContent>;
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

export const Preview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [isComposing, setIsComposing] = useState(false);
  const [composeStatus, setComposeStatus] = useState<string>('');

  useEffect(() => {
    console.log('📄 Preview page loaded');
    
    const state = location.state as { result?: GenerationResult; formData?: any };
    
    if (state?.result) {
      console.log('✅ Result found in state');
      setResult(state.result);
      setFormData(state.formData || {});
      
      const sectionKeys = Object.keys(state.result.sections);
      if (sectionKeys.length > 0) {
        setActiveSection(sectionKeys[0]);
      }
    } else {
      try {
        const savedResult = localStorage.getItem('generationResult');
        if (savedResult) {
          const parsed = JSON.parse(savedResult);
          setResult(parsed);
          const sectionKeys = Object.keys(parsed.sections);
          if (sectionKeys.length > 0) {
            setActiveSection(sectionKeys[0]);
          }
        } else {
          navigate('/setup');
        }
      } catch (error) {
        console.error('Failed to load saved result:', error);
        navigate('/setup');
      }
    }
  }, [location, navigate]);

  const handleDownload = async (format: 'docx' | 'pdf') => {
    console.log(`📥 Downloading as ${format}...`);
    setIsComposing(true);
    setComposeStatus('Composing document with template...');
    
    try {
      // First, compose the document
      setComposeStatus('Generating document with your template...');
      
      const composeResponse = await fetch('/api/compose/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        }
      });

      if (!composeResponse.ok) {
        const error = await composeResponse.json();
        throw new Error(error.message || 'Failed to compose document');
      }

      const composeResult = await composeResponse.json();
      console.log('Compose result:', composeResult);

      if (!composeResult.success) {
        throw new Error(composeResult.errors?.join(', ') || 'Composition failed');
      }

      setComposeStatus('Downloading your document...');

      // Download the composed document
      const downloadResponse = await fetch('/api/compose/download', {
        headers: {
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        }
      });

      if (!downloadResponse.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await downloadResponse.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result?.documentTitle || 'document'}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`✅ Download complete!`);
      setComposeStatus('Download complete!');

    } catch (error) {
      console.error('Download error:', error);
      setComposeStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setIsComposing(false);
        setComposeStatus('');
      }, 3000);
    }
  };

  const handleRegenerateSection = (sectionKey: string) => {
    console.log(`🔄 Regenerating section: ${sectionKey}`);
    // TODO: Implement section regeneration
    alert(`🔄 Regenerating ${sectionKey}... (Will be implemented in Phase 4)`);
  };

  const handleEditSection = (sectionKey: string) => {
    if (editingSection === sectionKey) {
      if (result && result.sections[sectionKey]) {
        const updatedSections = { ...result.sections };
        updatedSections[sectionKey] = {
          ...updatedSections[sectionKey],
          content: editedContent[sectionKey] || updatedSections[sectionKey].content
        };
        setResult({
          ...result,
          sections: updatedSections
        });
        // Save to localStorage
        localStorage.setItem('generationResult', JSON.stringify({
          ...result,
          sections: updatedSections
        }));
      }
      setEditingSection(null);
    } else {
      setEditingSection(sectionKey);
      if (result && result.sections[sectionKey]) {
        setEditedContent({
          ...editedContent,
          [sectionKey]: result.sections[sectionKey].content
        });
      }
    }
  };

  const handleContentChange = (sectionKey: string, content: string) => {
    setEditedContent({
      ...editedContent,
      [sectionKey]: content
    });
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  const sectionKeys = Object.keys(result.sections);
  const activeSectionData = activeSection ? result.sections[activeSection] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/setup')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-4"
            >
              <FiArrowLeft className="mr-2" />
              Back to Setup
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Preview</h1>
              <p className="text-sm text-gray-500">
                {result.documentTitle || 'Generated Document'} • {result.documentType}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-sm px-3 py-1 rounded-full ${
              result.aiGenerated > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <FiCpu className="inline mr-1" />
              {result.aiGenerated} AI • {result.fallbackGenerated} Fallback
            </span>
            <span className="text-sm text-gray-400 flex items-center">
              <FiClock className="mr-1" />
              {Math.round(result.totalTime / 1000)}s
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiLayers className="mr-2" />
                Sections
              </h3>
              <div className="space-y-1">
                {sectionKeys.map((key) => {
                  const section = result.sections[key];
                  const isActive = activeSection === key;
                  const isEditing = editingSection === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{key}</span>
                        <div className="flex items-center space-x-1">
                          {section.generatedBy === 'ai' && (
                            <FiCpu className="w-3 h-3 text-green-500" />
                          )}
                          {isEditing && (
                            <FiEdit2 className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Download Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => handleDownload('docx')}
                  disabled={isComposing}
                  className={`w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium ${
                    isComposing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiDownload className="mr-2" />
                  {isComposing ? 'Composing...' : 'Download DOCX'}
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={isComposing}
                  className={`w-full flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium ${
                    isComposing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiDownload className="mr-2" />
                  {isComposing ? 'Composing...' : 'Download PDF'}
                </button>
                
                {composeStatus && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    {composeStatus}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {activeSectionData && (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        {activeSection}
                      </h2>
                      <span className="ml-3 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {activeSectionData.generatedBy === 'ai' ? '🤖 AI Generated' : '📝 Fallback'}
                        {activeSectionData.modelUsed && ` (${activeSectionData.modelUsed})`}
                        {activeSectionData.processingTime && ` • ${Math.round(activeSectionData.processingTime / 1000)}s`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRegenerateSection(activeSection)}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiRefreshCw className="mr-1 w-4 h-4" />
                        Regenerate
                      </button>
                      <button
                        onClick={() => handleEditSection(activeSection)}
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {editingSection === activeSection ? (
                          <>
                            <FiCheckCircle className="mr-1 w-4 h-4 text-green-500" />
                            Save
                          </>
                        ) : (
                          <>
                            <FiEdit2 className="mr-1 w-4 h-4" />
                            Edit
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    {editingSection === activeSection ? (
                      <textarea
                        value={editedContent[activeSection] || activeSectionData.content}
                        onChange={(e) => handleContentChange(activeSection, e.target.value)}
                        className="w-full min-h-[400px] p-4 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono text-sm"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {activeSectionData.content}
                      </div>
                    )}
                  </div>

                  {activeSectionData.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">Error: {activeSectionData.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-500">Total Sections</p>
                <p className="text-2xl font-bold text-gray-900">{result.totalSections}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-500">AI Generated</p>
                <p className="text-2xl font-bold text-green-600">{result.aiGenerated}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-sm text-gray-500">Fallback Used</p>
                <p className="text-2xl font-bold text-yellow-600">{result.fallbackGenerated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};