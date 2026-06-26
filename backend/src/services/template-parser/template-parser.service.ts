import { v4 as uuidv4 } from 'uuid';
import { DocumentType, DocumentTypeLabels } from './models/document-type.enum.js';
import { TemplateModel, Placeholder } from './models/template.model.js';
import { Section } from './models/section.model.js';
import { StyleProfile } from './models/style.model.js';
import DocxParser from './parsers/docx-parser.js';
import SectionAnalyzer from './analyzers/section-analyzer.js';
import StyleExtractor from './analyzers/style-extractor.js';
import PlaceholderAnalyzer from './analyzers/placeholder-analyzer.js';
import chalk from 'chalk';

export interface ParseProgress {
  step: string;
  progress: number;
  message: string;
  details?: any;
}

export interface ParseResult {
  templateModel: TemplateModel;
  summary: {
    documentType: DocumentType;
    documentTypeLabel: string;
    confidence: number;
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
    warnings: string[];
    errors: string[];
  };
}

export class TemplateParserService {
  private progressCallbacks: ((progress: ParseProgress) => void)[] = [];

  onProgress(callback: (progress: ParseProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  private emitProgress(step: string, progress: number, message: string, details?: any) {
    const progressData = { step, progress, message, details };
    console.log(chalk.cyan(`[PARSE] ${step}: ${message}`));
    if (details) {
      console.log(chalk.gray(`[PARSE] Details:`, JSON.stringify(details, null, 2)));
    }
    this.progressCallbacks.forEach(cb => cb(progressData));
  }

  async parseTemplate(filePath: string, fileName: string): Promise<ParseResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log(chalk.bold.blue('\n📄 Starting Template Parsing...'));
      console.log(chalk.gray(`File: ${fileName}`));
      console.log(chalk.gray(`Path: ${filePath}\n`));

      // Step 1: Parse DOCX
      this.emitProgress('parsing_docx', 10, 'Extracting DOCX structure...');
      console.log(chalk.yellow('→ Step 1: Parsing DOCX file...'));
      
      const docxResult = await DocxParser.parse(filePath);
      
      console.log(chalk.green(`✓ Extracted ${docxResult.paragraphs.length} paragraphs`));
      console.log(chalk.green(`✓ Found ${docxResult.styles.length} styles`));
      console.log(chalk.green(`✓ Word count: ${docxResult.metadata.wordCount}`));
      
      // Step 2: Analyze structure
      this.emitProgress('analyzing_structure', 30, 'Analyzing document structure...');
      console.log(chalk.yellow('\n→ Step 2: Analyzing document structure...'));
      
      const sectionsResult = SectionAnalyzer.analyze(
        docxResult.paragraphs,
        docxResult.rawText
      );
      
      console.log(chalk.green(`✓ Detected ${sectionsResult.flatSections.length} sections`));
      console.log(chalk.green(`✓ Section types: ${sectionsResult.detectedTypes.join(', ')}`));
      console.log(chalk.green(`✓ Confidence: ${(sectionsResult.confidence * 100).toFixed(0)}%`));
      
      // Step 3: Extract styles
      this.emitProgress('extracting_styles', 50, 'Extracting formatting and styles...');
      console.log(chalk.yellow('\n→ Step 3: Extracting styles...'));
      
      const styleProfile = StyleExtractor.extractStyleProfile(
        docxResult.styles,
        docxResult.paragraphs,
        docxResult.documentXml
      );
      
      console.log(chalk.green(`✓ Page size: ${styleProfile.pageStyle.pageSize?.width}x${styleProfile.pageStyle.pageSize?.height}`));
      console.log(chalk.green(`✓ Margins: T:${styleProfile.pageStyle.margins?.top} B:${styleProfile.pageStyle.margins?.bottom} L:${styleProfile.pageStyle.margins?.left} R:${styleProfile.pageStyle.margins?.right}`));
      console.log(chalk.green(`✓ Header: ${styleProfile.headerFooter.hasHeader ? 'Yes' : 'No'}`));
      console.log(chalk.green(`✓ Footer: ${styleProfile.headerFooter.hasFooter ? 'Yes' : 'No'}`));
      
      // Step 4: Detect placeholders
      this.emitProgress('detecting_placeholders', 70, 'Detecting placeholders...');
      console.log(chalk.yellow('\n→ Step 4: Detecting placeholders...'));
      
      const placeholders = PlaceholderAnalyzer.analyze(
        sectionsResult.sections,
        docxResult.rawText
      );
      
      console.log(chalk.green(`✓ Found ${placeholders.length} placeholders`));
      if (placeholders.length > 0) {
        console.log(chalk.gray(`  → ${placeholders.map(p => `[${p.label}]`).join(', ')}`));
      }
      
      // Step 5: Determine document type
      this.emitProgress('detecting_type', 85, 'Determining document type...');
      console.log(chalk.yellow('\n→ Step 5: Determining document type...'));
      
      const documentType = this.determineDocumentType(
        sectionsResult.detectedTypes,
        docxResult.rawText
      );
      
      console.log(chalk.green(`✓ Document type: ${DocumentTypeLabels[documentType]}`));
      
      // Step 6: Build template model
      this.emitProgress('building_model', 95, 'Building template model...');
      console.log(chalk.yellow('\n→ Step 6: Building template model...'));
      
      const templateModel: TemplateModel = {
        id: uuidv4(),
        fileName: fileName,
        filePath: filePath,
        uploadedAt: new Date().toISOString(),
        documentType: documentType,
        confidence: sectionsResult.confidence,
        sections: sectionsResult.sections,
        flatSectionList: sectionsResult.flatSections,
        sectionCount: sectionsResult.flatSections.length,
        wordCount: docxResult.metadata.wordCount,
        pageCount: docxResult.metadata.pageCount,
        styleProfile: styleProfile,
        rawContent: docxResult.rawText,
        contentPreview: docxResult.rawText.slice(0, 1000),
        placeholders: placeholders,
        hasTitlePage: this.hasTitlePage(sectionsResult.sections),
        hasTableOfContents: false,
        hasCertificate: this.hasCertificate(sectionsResult.detectedTypes),
        hasSignature: this.hasSignature(sectionsResult.detectedTypes),
        hasDeclaration: this.hasDeclaration(sectionsResult.detectedTypes),
        hasAcknowledgement: this.hasAcknowledgement(sectionsResult.detectedTypes),
        parsedAt: new Date().toISOString(),
        parsingVersion: '1.0.0',
        errors: errors,
        warnings: warnings,
        userConfirmed: false,
        userOverrides: undefined
      };
      
      // Build summary
      const summary = {
        documentType: documentType,
        documentTypeLabel: DocumentTypeLabels[documentType] || 'Unknown',
        confidence: sectionsResult.confidence,
        sectionCount: templateModel.sectionCount,
        wordCount: templateModel.wordCount,
        pageCount: templateModel.pageCount,
        hasPlaceholders: placeholders.length > 0,
        placeholderCount: placeholders.length,
        hasTitlePage: templateModel.hasTitlePage,
        hasCertificate: templateModel.hasCertificate,
        hasSignature: templateModel.hasSignature,
        hasDeclaration: templateModel.hasDeclaration,
        hasAcknowledgement: templateModel.hasAcknowledgement,
        warnings: warnings,
        errors: errors
      };
      
      this.emitProgress('complete', 100, '✅ Parsing complete!', summary);
      console.log(chalk.bold.green('\n✅ Template parsing completed successfully!'));
      console.log(chalk.gray(`Summary: ${summary.sectionCount} sections, ${summary.wordCount} words, ${summary.placeholderCount} placeholders\n`));
      
      return {
        templateModel,
        summary
      };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown parsing error';
      errors.push(errorMsg);
      console.log(chalk.bold.red(`\n❌ Parsing failed: ${errorMsg}`));
      this.emitProgress('error', 0, `❌ Error: ${errorMsg}`);
      throw new Error(`Failed to parse template: ${errors.join(', ')}`);
    }
  }
  
  private determineDocumentType(
    detectedTypes: string[],
    rawContent: string
  ): DocumentType {
    const lowerContent = rawContent.toLowerCase();
    
    // Check for certificate
    if (detectedTypes.includes('certificate') || 
        lowerContent.includes('certificate') ||
        lowerContent.includes('bonafide')) {
      return DocumentType.CERTIFICATE;
    }
    
    // Check for project report
    if (detectedTypes.includes('abstract') || 
        detectedTypes.includes('introduction') ||
        detectedTypes.includes('objectives') ||
        detectedTypes.includes('methodology') ||
        lowerContent.includes('project report') ||
        lowerContent.includes('final year project')) {
      return DocumentType.PROJECT_REPORT;
    }
    
    // Check for thesis
    if (lowerContent.includes('thesis') || 
        lowerContent.includes('dissertation')) {
      return DocumentType.THESIS;
    }
    
    // Check for internship
    if (lowerContent.includes('internship') || 
        lowerContent.includes('training report')) {
      return DocumentType.INTERNSHIP_REPORT;
    }
    
    // Check for office report
    if (lowerContent.includes('office') || 
        lowerContent.includes('department') ||
        lowerContent.includes('organization')) {
      return DocumentType.OFFICE_REPORT;
    }
    
    // Check for letter
    if (lowerContent.includes('dear') || 
        lowerContent.includes('sincerely') ||
        lowerContent.includes('yours faithfully')) {
      return DocumentType.LETTER;
    }
    
    // Check for proposal
    if (lowerContent.includes('proposal') || 
        lowerContent.includes('project plan')) {
      return DocumentType.PROPOSAL;
    }
    
    // Check for assignment
    if (lowerContent.includes('assignment') || 
        lowerContent.includes('homework')) {
      return DocumentType.ASSIGNMENT;
    }
    
    return DocumentType.UNKNOWN;
  }
  
  private hasTitlePage(sections: Section[]): boolean {
    if (sections.length === 0) return false;
    
    const firstSection = sections[0];
    if (firstSection.type === 'title' || 
        firstSection.title.includes('title') ||
        firstSection.title.includes('project report')) {
      return true;
    }
    
    if (firstSection.content.length < 100 && firstSection.title) {
      return true;
    }
    
    return false;
  }
  
  private hasCertificate(detectedTypes: string[]): boolean {
    return detectedTypes.includes('certificate');
  }
  
  private hasSignature(detectedTypes: string[]): boolean {
    return detectedTypes.includes('signature');
  }
  
  private hasDeclaration(detectedTypes: string[]): boolean {
    return detectedTypes.includes('declaration');
  }
  
  private hasAcknowledgement(detectedTypes: string[]): boolean {
    return detectedTypes.includes('acknowledgement');
  }
}

export default new TemplateParserService();