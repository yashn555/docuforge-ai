import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiCircle, 
  FiChevronRight,
  FiChevronDown,
  FiMove,
  FiPlus,
  FiX,
  FiLayers
} from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface SectionDefinition {
  id: string;
  label: string;
  description: string;
  category: 'core' | 'technical' | 'management' | 'quality';
  default: boolean;
  icon: string;
}

const SectionCategories = {
  core: { label: '📋 Core Sections', color: 'blue' },
  technical: { label: '💻 Technical Sections', color: 'purple' },
  management: { label: '📊 Management Sections', color: 'green' },
  quality: { label: '⭐ Quality Sections', color: 'orange' }
};

export const SectionSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<any>({});
  const [selectedSections, setSelectedSections] = useState<SectionDefinition[]>([]);
  const [availableSections, setAvailableSections] = useState<SectionDefinition[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['core', 'technical', 'management', 'quality']);

  const allSections: SectionDefinition[] = [
    // Core Sections
    { id: 'abstract', label: 'Abstract', description: 'Overview of the document', category: 'core', default: true, icon: '📄' },
    { id: 'introduction', label: 'Introduction', description: 'Background and context', category: 'core', default: true, icon: '📝' },
    { id: 'objectives', label: 'Objectives', description: 'Goals and aims of the project', category: 'core', default: true, icon: '🎯' },
    { id: 'methodology', label: 'Methodology', description: 'Research approach and methods', category: 'core', default: true, icon: '🔬' },
    { id: 'conclusion', label: 'Conclusion', description: 'Summary and findings', category: 'core', default: true, icon: '📊' },
    
    // Technical Sections
    { id: 'system_architecture', label: 'System Architecture', description: 'Technical architecture and design', category: 'technical', default: false, icon: '🏗️' },
    { id: 'security_requirements', label: 'Security Requirements', description: 'Security concerns and measures', category: 'technical', default: false, icon: '🔒' },
    { id: 'software_quality', label: 'Software Quality', description: 'Quality metrics and standards', category: 'technical', default: false, icon: '✅' },
    { id: 'risk_identification', label: 'Risk Identification', description: 'Potential risks and mitigation', category: 'technical', default: false, icon: '⚠️' },
    { id: 'performance_analysis', label: 'Performance Analysis', description: 'Performance metrics and analysis', category: 'technical', default: false, icon: '⚡' },
    
    // Management Sections
    { id: 'project_planning', label: 'Project Planning', description: 'Project timeline and resources', category: 'management', default: false, icon: '📅' },
    { id: 'resource_management', label: 'Resource Management', description: 'Resource allocation and management', category: 'management', default: false, icon: '👥' },
    { id: 'budget_estimation', label: 'Budget Estimation', description: 'Cost analysis and budget', category: 'management', default: false, icon: '💰' },
    
    // Quality Sections
    { id: 'quality_assurance', label: 'Quality Assurance', description: 'Quality processes and standards', category: 'quality', default: false, icon: '🔍' },
    { id: 'testing_strategy', label: 'Testing Strategy', description: 'Testing approaches and plans', category: 'quality', default: false, icon: '🧪' },
    { id: 'maintenance_plan', label: 'Maintenance Plan', description: 'Maintenance and support plans', category: 'quality', default: false, icon: '🔧' },
  ];

  useEffect(() => {
    console.log('📄 SectionSelection mounted');
    
    // Get form data
    const state = location.state as { formData?: any };
    if (state?.formData) {
      setFormData(state.formData);
    } else {
      try {
        const saved = localStorage.getItem('formData');
        if (saved) {
          setFormData(JSON.parse(saved));
        }
      } catch (e) {}
    }

    // Load saved selections or use defaults
    try {
      const savedSections = localStorage.getItem('selectedSections');
      if (savedSections) {
        const savedIds = JSON.parse(savedSections);
        const selected = allSections.filter(s => savedIds.includes(s.id));
        if (selected.length > 0) {
          setSelectedSections(selected);
          const available = allSections.filter(s => !savedIds.includes(s.id));
          setAvailableSections(available);
          console.log('📦 Loaded saved sections:', selected.map(s => s.id));
          return;
        }
      }
    } catch (e) {}

    // Default: core sections
    const defaultSections = allSections.filter(s => s.default);
    setSelectedSections(defaultSections);
    const available = allSections.filter(s => !s.default);
    setAvailableSections(available);
    console.log('📦 Using default sections:', defaultSections.map(s => s.id));
  }, []);

  const toggleSection = (section: SectionDefinition) => {
    const isSelected = selectedSections.some(s => s.id === section.id);
    
    if (isSelected) {
      // Remove from selected
      const updatedSelected = selectedSections.filter(s => s.id !== section.id);
      setSelectedSections(updatedSelected);
      
      // Add to available, sorted alphabetically
      const updatedAvailable = [...availableSections, section].sort((a, b) => a.label.localeCompare(b.label));
      setAvailableSections(updatedAvailable);
      
      console.log(`➖ Removed: ${section.id}`);
    } else {
      // Add to selected (at the end)
      setSelectedSections([...selectedSections, section]);
      // Remove from available
      setAvailableSections(availableSections.filter(s => s.id !== section.id));
      console.log(`➕ Added: ${section.id}`);
    }
  };

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      console.log('❌ No destination');
      return;
    }

    const items = Array.from(selectedSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    console.log(`🔄 Reordered: ${reorderedItem.id} from ${result.source.index} to ${result.destination.index}`);
    setSelectedSections(items);
  };

  const handleContinue = () => {
    const selectedIds = selectedSections.map(s => s.id);
    console.log('📤 Continuing with sections:', selectedIds);
    
    // Save to localStorage
    localStorage.setItem('selectedSections', JSON.stringify(selectedIds));
    localStorage.setItem('sectionOrder', JSON.stringify(selectedIds));
    localStorage.setItem('formData', JSON.stringify(formData));
    
    // Navigate to generate
    navigate('/generate', { 
      state: { 
        formData: formData,
        selectedSections: selectedIds
      } 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      technical: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      management: 'border-green-200 bg-green-50 hover:bg-green-100',
      quality: 'border-orange-200 bg-orange-50 hover:bg-orange-100'
    };
    return colors[category] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
  };

  const getCategoryBorderColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'border-blue-300',
      technical: 'border-purple-300',
      management: 'border-green-300',
      quality: 'border-orange-300'
    };
    return colors[category] || 'border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
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
              <h1 className="text-2xl font-bold text-gray-900">Select Sections</h1>
              <p className="text-sm text-gray-500">
                Choose the sections you want in your document and arrange them in order
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm">
            <FiLayers className="text-blue-500" />
            <span className="text-sm text-gray-500">Selected:</span>
            <span className="text-sm font-bold text-blue-600">
              {selectedSections.length} / {allSections.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Sections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiCircle className="mr-2 text-blue-500" />
                Available Sections
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Click on sections to add them to your document
              </p>

              {Object.entries(SectionCategories).map(([category, { label }]) => {
                const sectionsInCategory = availableSections.filter(s => s.category === category);
                if (sectionsInCategory.length === 0) return null;
                
                const isExpanded = expandedCategories.includes(category);
                const categoryColor = getCategoryColor(category);
                const borderColor = getCategoryBorderColor(category);
                
                return (
                  <div key={category} className="mb-4">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-700">{label}</span>
                      <span className="text-sm text-gray-500 flex items-center">
                        {sectionsInCategory.length} sections
                        {isExpanded ? <FiChevronDown className="inline ml-2" /> : <FiChevronRight className="inline ml-2" />}
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-2 space-y-2">
                        {sectionsInCategory.map((section) => (
                          <div
                            key={section.id}
                            className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${categoryColor} ${borderColor}`}
                            onClick={() => toggleSection(section)}
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              <span className="text-2xl mr-3 flex-shrink-0">{section.icon}</span>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900">{section.label}</p>
                                <p className="text-sm text-gray-500 truncate">{section.description}</p>
                              </div>
                            </div>
                            <button
                              className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center flex-shrink-0 ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(section);
                              }}
                            >
                              <FiPlus className="mr-1" /> Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {availableSections.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">All sections are selected!</p>
                  <p className="text-xs mt-1">Remove some sections to see them here</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Sections */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FiCheckCircle className="mr-2 text-green-500" />
                Selected Sections
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  (drag to reorder)
                </span>
              </h2>

              {selectedSections.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No sections selected</p>
                  <p className="text-xs mt-1">Click on sections to add them</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="selected-sections">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-2 min-h-[100px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                        }`}
                      >
                        {selectedSections.map((section, index) => {
                          const categoryColor = getCategoryColor(section.category);
                          const borderColor = getCategoryBorderColor(section.category);
                          
                          return (
                            <Draggable 
                              key={section.id} 
                              draggableId={section.id} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                                    snapshot.isDragging 
                                      ? 'shadow-lg scale-105 border-blue-500 bg-blue-50' 
                                      : `${categoryColor} ${borderColor}`
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <FiMove className={`mr-2 cursor-move flex-shrink-0 ${
                                      snapshot.isDragging ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                    <span className="text-xl mr-2 flex-shrink-0">{section.icon}</span>
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">{section.label}</p>
                                      <p className="text-xs text-gray-500">{section.category}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection(section);
                                    }}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0 ml-2"
                                    title="Remove section"
                                  >
                                    <FiX />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>Total sections:</span>
                  <span className="font-bold text-blue-600">{selectedSections.length}</span>
                </div>
                
                <button
                  onClick={handleContinue}
                  disabled={selectedSections.length === 0}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    selectedSections.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue to Generate
                  <FiChevronRight className="ml-2" />
                </button>
                
                {selectedSections.length > 0 && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {selectedSections.length} sections will be generated in the order shown
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionSelection;