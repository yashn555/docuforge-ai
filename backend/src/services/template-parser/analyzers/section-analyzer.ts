import { Section, SectionType } from '../models/section.model.js';
import { ParagraphInfo } from '../parsers/docx-parser.js';

export interface SectionAnalysisResult {
  sections: Section[];
  flatSections: Section[];
  detectedTypes: SectionType[];
  confidence: number;
}

export class SectionAnalyzer {
  private sectionKeywords: Map<SectionType, string[]> = new Map([
    [SectionType.TITLE, ['title', 'project title', 'report title', 'certificate']],
    [SectionType.ABSTRACT, ['abstract', 'summary', 'synopsis']],
    [SectionType.INTRODUCTION, ['introduction', 'intro', 'background']],
    [SectionType.OBJECTIVES, ['objective', 'aim', 'goal', 'purpose']],
    [SectionType.METHODOLOGY, ['methodology', 'method', 'approach', 'procedure']],
    [SectionType.CONCLUSION, ['conclusion', 'summary', 'findings', 'results']],
    [SectionType.REFERENCES, ['references', 'bibliography', 'works cited']],
    [SectionType.APPENDIX, ['appendix', 'appendices']],
    [SectionType.ACKNOWLEDGEMENT, ['acknowledgement', 'acknowledgment']],
    [SectionType.DECLARATION, ['declaration', 'undertaking', 'certificate of']],
    [SectionType.CERTIFICATE, ['certificate', 'certification', 'bonafide']],
    [SectionType.SIGNATURE, ['signature', 'sign', 'authorized']]
  ]);

  analyze(
    paragraphs: ParagraphInfo[],
    documentText: string
  ): SectionAnalysisResult {
    const sections: Section[] = [];
    let currentSection: Section | null = null;
    let sectionId = 0;

    // First pass: identify section boundaries
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      
      // Check if this paragraph is a heading
      if (para.isHeading || this.isLikelyHeading(para)) {
        // Close current section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Create new section
        const level = para.headingLevel || this.detectHeadingLevel(para);
        const type = this.detectSectionType(para.text);
        
        currentSection = {
          id: `section-${sectionId++}`,
          type: type || SectionType.HEADING,
          title: para.text,
          content: '',
          level: level,
          startOffset: i,
          endOffset: i,
          subSections: [],
          metadata: {}
        };
      } else if (currentSection) {
        // Add content to current section
        currentSection.content += para.text + '\n';
        currentSection.endOffset = i;
      }
    }

    // Close last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // Build hierarchical structure
    const hierarchicalSections = this.buildHierarchy(sections);
    const flatSections = this.flattenSections(hierarchicalSections);

    // Detect document types
    const detectedTypes = this.detectDocumentTypes(flatSections);
    const confidence = this.calculateConfidence(detectedTypes);

    return {
      sections: hierarchicalSections,
      flatSections: flatSections,
      detectedTypes: detectedTypes,
      confidence: confidence
    };
  }

  private isLikelyHeading(para: ParagraphInfo): boolean {
    // Check if text is all caps or ends with colon, or has formatting
    const text = para.text.trim();
    if (!text) return false;
    
    // All caps (and not too short)
    if (text === text.toUpperCase() && text.length > 3) {
      return true;
    }
    
    // Ends with colon
    if (text.endsWith(':')) {
      return true;
    }
    
    // Has strong formatting
    if (para.isBold && !para.text.includes(' ')) {
      return true;
    }
    
    // Check for numbered section (1., 1.1, etc.)
    if (/^\d+\.\d*/.test(text)) {
      return true;
    }
    
    return false;
  }

  private detectHeadingLevel(para: ParagraphInfo): number {
    const text = para.text.trim();
    
    // Check for numbered headings
    const match = text.match(/^(\d+)\./);
    if (match) {
      const num = parseInt(match[1]);
      if (num <= 6) return Math.min(num, 6);
    }
    
    // Check for formatting
    if (para.isBold && para.fontSize && para.fontSize > 14) {
      return 1;
    } else if (para.isBold && para.fontSize && para.fontSize > 12) {
      return 2;
    } else if (para.isBold) {
      return 3;
    } else if (para.isItalic) {
      return 4;
    }
    
    return 2; // default
  }

  private detectSectionType(title: string): SectionType | null {
    const lowerTitle = title.toLowerCase().trim();
    
    // Remove numbering prefixes
    const cleanTitle = lowerTitle.replace(/^[\d\.]+\s*/, '');
    
    for (const [type, keywords] of this.sectionKeywords) {
      for (const keyword of keywords) {
        if (cleanTitle.includes(keyword)) {
          return type;
        }
      }
    }
    
    return null;
  }

  private detectDocumentTypes(sections: Section[]): SectionType[] {
    const types = new Set<SectionType>();
    
    for (const section of sections) {
      if (section.type !== SectionType.UNKNOWN) {
        types.add(section.type);
      }
    }
    
    return Array.from(types);
  }

  private calculateConfidence(detectedTypes: SectionType[]): number {
    // More detected types = higher confidence
    const baseConfidence = Math.min(detectedTypes.length * 0.15, 0.7);
    
    // Bonus for having key sections
    const keySections = [
      SectionType.INTRODUCTION,
      SectionType.CONCLUSION,
      SectionType.ABSTRACT
    ];
    
    let bonus = 0;
    for (const type of keySections) {
      if (detectedTypes.includes(type)) {
        bonus += 0.1;
      }
    }
    
    return Math.min(baseConfidence + bonus, 0.95);
  }

  private buildHierarchy(sections: Section[]): Section[] {
    const result: Section[] = [];
    const stack: Section[] = [];

    for (const section of sections) {
      let parent = null;
      
      // Find appropriate parent
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }
      
      if (stack.length > 0) {
        parent = stack[stack.length - 1];
      }
      
      if (parent) {
        parent.subSections.push(section);
      } else {
        result.push(section);
      }
      
      stack.push(section);
    }
    
    return result;
  }

  private flattenSections(sections: Section[]): Section[] {
    const result: Section[] = [];
    
    const traverse = (section: Section) => {
      result.push(section);
      for (const sub of section.subSections) {
        traverse(sub);
      }
    };
    
    for (const section of sections) {
      traverse(section);
    }
    
    return result;
  }
}

export default new SectionAnalyzer();