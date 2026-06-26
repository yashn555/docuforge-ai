import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { DOMParser } from 'xmldom';

export interface DocxParseResult {
  rawText: string;
  html: string;
  paragraphs: ParagraphInfo[];
  styles: StyleInfo[];
  documentXml: string;
  metadata: {
    wordCount: number;
    charCount: number;
    pageCount?: number;
  };
}

export interface ParagraphInfo {
  text: string;
  styleName: string;
  isHeading: boolean;
  headingLevel?: number;
  isListItem: boolean;
  listLevel?: number;
  alignment?: string;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  indent?: number;
  lineSpacing?: number;
  pageBreakBefore?: boolean;
  keepWithNext?: boolean;
}

export interface StyleInfo {
  name: string;
  type: 'paragraph' | 'character' | 'table';
  basedOn?: string;
  next?: string;
  isHeading?: boolean;
  headingLevel?: number;
  fontName?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
}

export class DocxParser {
  private zip: JSZip | null = null;
  private documentXml: string = '';
  private stylesXml: string = '';
  private numberingXml: string = '';

  async parse(filePath: string): Promise<DocxParseResult> {
    const fileBuffer = fs.readFileSync(filePath);
    this.zip = await JSZip.loadAsync(fileBuffer);

    // Extract XML files
    this.documentXml = await this.extractFile('word/document.xml');
    this.stylesXml = await this.extractFile('word/styles.xml');
    this.numberingXml = await this.extractFile('word/numbering.xml');

    // Parse content
    const paragraphs = await this.parseParagraphs();
    const styles = await this.parseStyles();

    // Get raw text using mammoth for better text extraction
    const mammothResult = await mammoth.extractRawText({ buffer: fileBuffer });
    const htmlResult = await mammoth.convertToHtml({ buffer: fileBuffer });

    return {
      rawText: mammothResult.value,
      html: htmlResult.value,
      paragraphs,
      styles,
      documentXml: this.documentXml,
      metadata: {
        wordCount: mammothResult.value.split(/\s+/).length,
        charCount: mammothResult.value.length,
        pageCount: await this.estimatePageCount()
      }
    };
  }

  private async extractFile(filePath: string): Promise<string> {
    if (!this.zip) {
      throw new Error('Zip file not loaded');
    }
    const file = this.zip.file(filePath);
    if (!file) {
      return '';
    }
    const content = await file.async('string');
    return content;
  }

  private async parseParagraphs(): Promise<ParagraphInfo[]> {
    if (!this.documentXml) {
      return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(this.documentXml, 'text/xml');

    // Namespace handling - use a generic approach
    const paragraphs: ParagraphInfo[] = [];

    // Find all paragraphs (using namespace-agnostic approach)
    const paraNodes = this.getElementsByTagNameNS(doc as any, 'p');
    
    for (const paraNode of paraNodes) {
      const paraInfo: ParagraphInfo = {
        text: '',
        styleName: '',
        isHeading: false,
        isListItem: false
      };

      // Get style from paragraph properties
      const pPr = this.getFirstElementByTagNameNS(paraNode, 'pPr');
      if (pPr) {
        const pStyle = this.getFirstElementByTagNameNS(pPr, 'pStyle');
        if (pStyle) {
          const val = pStyle.getAttribute('w:val') || pStyle.getAttribute('val');
          if (val) {
            paraInfo.styleName = val;
            // Check if it's a heading
            if (val.toLowerCase().startsWith('heading')) {
              paraInfo.isHeading = true;
              const match = val.match(/\d+/);
              if (match) {
                paraInfo.headingLevel = parseInt(match[0]);
              }
            }
          }
        }
      }

      // Get text content
      const textNodes = this.getElementsByTagNameNS(paraNode, 't');
      const texts: string[] = [];
      for (const textNode of textNodes) {
        const text = textNode.textContent || '';
        texts.push(text);
      }
      paraInfo.text = texts.join(' ').trim();

      // Get formatting from runs
      const runs = this.getElementsByTagNameNS(paraNode, 'r');
      for (const run of runs) {
        const rPr = this.getFirstElementByTagNameNS(run, 'rPr');
        if (rPr) {
          // Check for bold
          const bold = this.getFirstElementByTagNameNS(rPr, 'b');
          if (bold) {
            paraInfo.isBold = true;
          }
          // Check for italic
          const italic = this.getFirstElementByTagNameNS(rPr, 'i');
          if (italic) {
            paraInfo.isItalic = true;
          }
          // Check for underline
          const underline = this.getFirstElementByTagNameNS(rPr, 'u');
          if (underline) {
            paraInfo.isUnderline = true;
          }
        }
      }

      if (paraInfo.text || paraInfo.isHeading) {
        paragraphs.push(paraInfo);
      }
    }

    return paragraphs;
  }

  private async parseStyles(): Promise<StyleInfo[]> {
    if (!this.stylesXml) {
      return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(this.stylesXml, 'text/xml');
    const styles: StyleInfo[] = [];

    const styleNodes = this.getElementsByTagNameNS(doc as any, 'style');
    for (const styleNode of styleNodes) {
      const styleInfo: StyleInfo = {
        name: '',
        type: 'paragraph'
      };

      const name = styleNode.getAttribute('w:styleId') || styleNode.getAttribute('styleId');
      if (name) {
        styleInfo.name = name;
      }

      const type = styleNode.getAttribute('w:type') || styleNode.getAttribute('type');
      if (type) {
        styleInfo.type = type as any;
      }

      // Check if heading
      if (name && name.toLowerCase().startsWith('heading')) {
        styleInfo.isHeading = true;
        const match = name.match(/\d+/);
        if (match) {
          styleInfo.headingLevel = parseInt(match[0]);
        }
      }

      // Get name display
      const nameNode = this.getFirstElementByTagNameNS(styleNode, 'name');
      if (nameNode) {
        const val = nameNode.getAttribute('w:val') || nameNode.getAttribute('val');
        if (val) {
          styleInfo.name = val;
        }
      }

      styles.push(styleInfo);
    }

    return styles;
  }

  private async estimatePageCount(): Promise<number> {
    // Simple estimation based on word count
    // A typical page has ~250-300 words
    const wordCount = this.documentXml ? this.documentXml.length / 5 : 0;
    return Math.max(1, Math.ceil(wordCount / 250));
  }

  // Helper methods for namespace-agnostic DOM traversal
  private getElementsByTagNameNS(element: any, tagName: string): any[] {
    const result: any[] = [];
    
    // Try with different namespace prefixes
    const prefixes = ['w', 'wpc', 'wp', 'wps', 'wpg', 'w14', 'w15', 'w16'];
    for (const prefix of prefixes) {
      const elements = element.getElementsByTagName(`${prefix}:${tagName}`);
      for (let i = 0; i < elements.length; i++) {
        result.push(elements[i]);
      }
    }
    
    // Also try without namespace
    const elements = element.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      result.push(elements[i]);
    }
    
    return result;
  }

  private getFirstElementByTagNameNS(element: any, tagName: string): any | null {
    const elements = this.getElementsByTagNameNS(element, tagName);
    return elements.length > 0 ? elements[0] : null;
  }
}

export default new DocxParser();