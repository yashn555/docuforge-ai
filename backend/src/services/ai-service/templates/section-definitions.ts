export interface SectionDefinition {
  id: string;
  label: string;
  description: string;
  category: 'core' | 'technical' | 'management' | 'quality';
  default: boolean;
  icon: string;
}

export const AllSectionDefinitions: SectionDefinition[] = [
  // Core Sections
  { id: 'abstract', label: 'Abstract', description: 'Overview of the document', category: 'core', default: true, icon: '📄' },
  { id: 'introduction', label: 'Introduction', description: 'Background and context', category: 'core', default: true, icon: '📝' },
  { id: 'objectives', label: 'Objectives', description: 'Goals and aims of the project', category: 'core', default: true, icon: '🎯' },
  { id: 'methodology', label: 'Methodology', description: 'Research approach and methods', category: 'core', default: true, icon: '🔬' },
  { id: 'conclusion', label: 'Conclusion', description: 'Summary and findings', category: 'core', default: true, icon: '📊' },
  
  // Technical Sections
  { id: 'system_architecture', label: 'System Architecture', description: 'Technical architecture and design', category: 'technical', default: false, icon: '🏗️' },
  { id: 'security_requirements', label: 'Security Requirements', description: 'Security concerns and measures', category: 'technical', default: false, icon: '🔒' },
  { id: 'software_quality', label: 'Software Quality Attributes', description: 'Quality metrics and standards', category: 'technical', default: false, icon: '✅' },
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

export const SectionCategories = {
  core: { label: 'Core Sections', icon: '📋' },
  technical: { label: 'Technical Sections', icon: '💻' },
  management: { label: 'Management Sections', icon: '📊' },
  quality: { label: 'Quality Sections', icon: '⭐' }
};