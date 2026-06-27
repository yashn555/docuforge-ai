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
  FiLayers,
  FiClock,
  FiEye,
  FiEyeOff,
  FiSave
} from 'react-icons/fi';
import { RichTextEditor } from '../components/Editor/RichTextEditor';

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
  
  // All hooks must be called in the same order every time
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [isComposing, setIsComposing] = useState(false);
  const [composeStatus, setComposeStatus] = useState<string>('');
  const [showRaw, setShowRaw] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  useEffect(() => {
    console.log('📄 Preview page loaded');
    
    const state = location.state as { result?: GenerationResult; formData?: any };
    
    // Load section order from localStorage
    try {
      const savedOrder = localStorage.getItem('sectionOrder');
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        setSectionOrder(parsedOrder);
        console.log('📋 Loaded section order:', parsedOrder);
      }
    } catch (e) {}

    let loadedResult: GenerationResult | null = null;
    let loadedFormData: any = null;

    if (state?.result) {
      console.log('✅ Result found in state');
      loadedResult = state.result;
      loadedFormData = state.formData || {};
    } else {
      try {
        const savedResult = localStorage.getItem('generationResult');
        if (savedResult) {
          loadedResult = JSON.parse(savedResult);
          console.log('✅ Result loaded from localStorage');
        }
      } catch (error) {
        console.error('Failed to load saved result:', error);
      }
    }

    if (loadedResult) {
      setResult(loadedResult);
      setFormData(loadedFormData);
      
      // Reorder sections if we have a saved order
      const sectionKeys = Object.keys(loadedResult.sections);
      let orderedKeys = sectionKeys;
      
      if (sectionOrder.length > 0) {
        // Reorder based on saved order
        const reordered: string[] = [];
        for (const id of sectionOrder) {
          if (loadedResult.sections[id]) {
            reordered.push(id);
          }
        }
        // Add any remaining sections not in the order
        for (const key of sectionKeys) {
          if (!reordered.includes(key)) {
            reordered.push(key);
          }
        }
        orderedKeys = reordered;
        
        // Rebuild sections object with new order
        const reorderedSections: Record<string, SectionContent> = {};
        for (const key of orderedKeys) {
          reorderedSections[key] = loadedResult.sections[key];
        }
        setResult({
          ...loadedResult,
          sections: reorderedSections
        });
      }
      
      if (orderedKeys.length > 0) {
        setActiveSection(orderedKeys[0]);
      }
    } else {
      console.warn('⚠️ No result found, redirecting to setup');
      navigate('/setup');
    }
    
    setIsLoading(false);
  }, [location, navigate]);

  const handleDownload = async (format: 'docx' | 'pdf') => {
    console.log(`📥 Downloading as ${format}...`);
    setIsComposing(true);
    setComposeStatus('Composing document with template...');
    
    try {
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

  const handleRegenerateSection = async (sectionKey: string) => {
    console.log(`🔄 Regenerating section: ${sectionKey}`);
    setIsRegenerating(sectionKey);
    
    try {
      const response = await fetch(`/api/generate/section/${sectionKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        },
        body: JSON.stringify({
          userInput: formData || {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate section');
      }

      const data = await response.json();
      console.log('Regeneration result:', data);

      if (data.success && data.content && result) {
        const updatedSections = { ...result.sections };
        updatedSections[sectionKey] = {
          ...updatedSections[sectionKey],
          content: data.content.content || data.content,
          generatedBy: data.content.generatedBy || 'ai',
          processingTime: data.content.processingTime || 0
        };
        
        setResult({
          ...result,
          sections: updatedSections
        });
        
        localStorage.setItem('generationResult', JSON.stringify({
          ...result,
          sections: updatedSections
        }));
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      alert(`Failed to regenerate ${sectionKey}`);
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleEditSection = (sectionKey: string) => {
    if (editingSection === sectionKey) {
      if (result && result.sections[sectionKey]) {
        const updatedSections = { ...result.sections };
        const newContent = editedContent[sectionKey] || updatedSections[sectionKey].content;
        
        updatedSections[sectionKey] = {
          ...updatedSections[sectionKey],
          content: newContent
        };
        
        setResult({
          ...result,
          sections: updatedSections
        });
        
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Document Found</h2>
          <p className="text-gray-600 mb-6">Please generate a document first.</p>
          <button onClick={() => navigate('/setup')} className="btn-primary">
            Go to Setup
          </button>
        </div>
      </div>
    );
  }

  const sectionKeys = Object.keys(result.sections);
  const activeSectionData = activeSection ? result.sections[activeSection] : null;
  const isEditing = editingSection === activeSection;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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
                {result.documentTitle || 'Generated Document'} • {result.documentType || 'Report'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              {showRaw ? <FiEyeOff className="mr-1.5" /> : <FiEye className="mr-1.5" />}
              {showRaw ? 'Show Formatted' : 'Show Raw'}
            </button>
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
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  ({sectionKeys.length})
                </span>
              </h3>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {sectionKeys.map((key) => {
                  const section = result.sections[key];
                  const isActive = activeSection === key;
                  const isEditingThis = editingSection === key;
                  
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
                        <span className="capitalize truncate">{key.replace(/_/g, ' ')}</span>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {section.generatedBy === 'ai' && (
                            <FiCpu className="w-3 h-3 text-green-500" />
                          )}
                          {isEditingThis && (
                            <FiEdit2 className="w-3 h-3 text-blue-500" />
                          )}
                          {isRegenerating === key && (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                  className={`w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium ${
                    isComposing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiDownload className="mr-2" />
                  {isComposing ? 'Composing...' : 'Download DOCX'}
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={isComposing}
                  className={`w-full flex items-center justify-center px-4 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium ${
                    isComposing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiDownload className="mr-2" />
                  {isComposing ? 'Composing...' : 'Download PDF'}
                </button>
                
                {composeStatus && (
                  <div className={`text-xs text-center mt-2 ${
                    composeStatus.includes('Error') ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {composeStatus}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-lg font-bold text-gray-900">{result.totalSections}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">AI Generated</p>
                  <p className="text-lg font-bold text-green-600">{result.aiGenerated}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {activeSectionData && (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 flex-wrap gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        {activeSection.replace(/_/g, ' ')}
                      </h2>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeSectionData.generatedBy === 'ai' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {activeSectionData.generatedBy === 'ai' ? '🤖 AI' : '📝 Fallback'}
                        {activeSectionData.modelUsed && ` (${activeSectionData.modelUsed})`}
                        {activeSectionData.processingTime && ` • ${Math.round(activeSectionData.processingTime / 1000)}s`}
                      </span>
                      {isEditing && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          ✏️ Editing
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRegenerateSection(activeSection)}
                        disabled={isRegenerating === activeSection}
                        className={`flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${
                          isRegenerating === activeSection ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isRegenerating === activeSection ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1.5"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw className="mr-1.5 w-4 h-4" />
                            Regenerate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEditSection(activeSection)}
                        className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          isEditing 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {isEditing ? (
                          <>
                            <FiSave className="mr-1.5 w-4 h-4" />
                            Save
                          </>
                        ) : (
                          <>
                            <FiEdit2 className="mr-1.5 w-4 h-4" />
                            Edit
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {showRaw ? (
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                      {activeSectionData.content}
                    </div>
                  ) : (
                    <RichTextEditor
                      content={isEditing ? (editedContent[activeSection] || activeSectionData.content) : activeSectionData.content}
                      onChange={(content) => handleContentChange(activeSection, content)}
                      readOnly={!isEditing}
                      placeholder={`Enter ${activeSection} content...`}
                      className="min-h-[300px]"
                    />
                  )}

                  {activeSectionData.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">Error: {activeSectionData.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700 flex items-center">
                <FiEdit2 className="mr-2 flex-shrink-0" />
                <span>
                  <strong>Tip:</strong> Click <span className="font-medium">Edit</span> to modify content, 
                  <span className="font-medium mx-1">Regenerate</span> to get AI to rewrite a section, or 
                  <span className="font-medium mx-1">Download</span> to save as DOCX/PDF with your template formatting.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;