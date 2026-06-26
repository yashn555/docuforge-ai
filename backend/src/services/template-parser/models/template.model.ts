import { DocumentType } from './document-type.enum.js';
import { Section } from './section.model.js';
import { StyleProfile } from './style.model.js';

export interface TemplateModel {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  documentType: DocumentType;
  confidence: number; // confidence in document type detection
  
  // Structure
  sections: Section[];
  flatSectionList: Section[];
  sectionCount: number;
  wordCount: number;
  pageCount?: number;
  
  // Formatting
  styleProfile: StyleProfile;
  
  // Content
  rawContent: string;
  contentPreview: string;
  
  // Placeholders detected
  placeholders: Placeholder[];
  
  // Metadata
  hasTitlePage: boolean;
  hasTableOfContents: boolean;
  hasCertificate: boolean;
  hasSignature: boolean;
  hasDeclaration: boolean;
  hasAcknowledgement: boolean;
  
  // Parsing metadata
  parsedAt: string;
  parsingVersion: string;
  errors: string[];
  warnings: string[];
  
  // User confirmation
  userConfirmed: boolean;
  userOverrides?: Partial<TemplateModel>;
}

export interface Placeholder {
  id: string;
  type: 'text' | 'field' | 'table' | 'signature';
  label: string;
  value?: string;
  location: {
    sectionId: string;
    position: number;
  };
  metadata?: {
    fieldType?: 'name' | 'date' | 'title' | 'institution' | 'custom';
    required?: boolean;
    defaultValue?: string;
  };
}