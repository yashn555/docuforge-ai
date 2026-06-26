import { TextStyle, ParagraphStyle } from './style.model.js';

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  level: number; // heading level (1-6)
  startOffset: number;
  endOffset: number;
  pageNumber?: number;
  style?: ParagraphStyle;
  subSections: Section[];
  metadata?: {
    isTitlePage?: boolean;
    isTableOfContents?: boolean;
    isCertificate?: boolean;
    isSignature?: boolean;
    isDeclaration?: boolean;
    isAcknowledgement?: boolean;
    isAbstract?: boolean;
    isConclusion?: boolean;
    isReferences?: boolean;
    isAppendix?: boolean;
  };
}

export enum SectionType {
  TITLE = 'title',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  TABLE = 'table',
  LIST = 'list',
  BLOCK = 'block',
  CERTIFICATE = 'certificate',
  SIGNATURE = 'signature',
  DECLARATION = 'declaration',
  ABSTRACT = 'abstract',
  INTRODUCTION = 'introduction',
  OBJECTIVES = 'objectives',
  METHODOLOGY = 'methodology',
  CONCLUSION = 'conclusion',
  REFERENCES = 'references',
  APPENDIX = 'appendix',
  ACKNOWLEDGEMENT = 'acknowledgement',
  UNKNOWN = 'unknown'
}

export interface SectionDetection {
  sections: Section[];
  confidence: number;
  detectedTypes: SectionType[];
}