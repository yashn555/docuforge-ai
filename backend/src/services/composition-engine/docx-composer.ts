import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from 'xmldom';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

export interface SectionContent {
  sectionType: string;
  content: string;
  generatedBy: 'ai' | 'fallback' | 'hybrid';
}

export interface CompositionResult {
  success: boolean;
  outputPath: string;
  outputFileName: string;
  sectionsMapped: number;
  totalSections: number;
  errors: string[];
}

export class DocxComposer {
  async composeDocument(
    templatePath: string,
    sections: Record<string, SectionContent>,
    userData: any
  ): Promise<CompositionResult> {
    console.log(chalk.blue('📝 Starting document composition...'));
    const errors: string[] = [];
    let sectionsMapped = 0;
    const totalSections = Object.keys(sections).length;

    try {
      // Read template
      const templateBuffer = fs.readFileSync(templatePath);
      const zip = await JSZip.loadAsync(templateBuffer);

      // Get document XML
      const documentXml = await zip.file('word/document.xml')?.async('string');
      if (!documentXml) {
        throw new Error('Invalid DOCX: No document.xml found');
      }

      console.log(chalk.gray(`📄 Template loaded, ${totalSections} sections to inject`));

      // Parse and modify the XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(documentXml, 'text/xml');

      // Find all paragraphs
      const paragraphs = this.getElementsByTagNameNS(doc, 'p');
      console.log(chalk.gray(`📝 Found ${paragraphs.length} paragraphs`));

      // Map sections to paragraphs
      const sectionMap = this.mapSectionsToParagraphs(paragraphs, sections);
      
      if (sectionMap.size === 0) {
        console.log(chalk.yellow('⚠️ No section headings found, appending content to end'));
        // Append all sections at the end
        const body = this.getElementsByTagNameNS(doc, 'body')[0];
        if (body) {
          for (const [type, section] of Object.entries(sections)) {
            const headingPara = this.createHeadingParagraph(doc, type);
            body.appendChild(headingPara);
            
            const contentPara = this.createContentParagraph(doc, section.content, null);
            body.appendChild(contentPara);
            
            // Add spacing
            const spacing = doc.createElement('w:p');
            body.appendChild(spacing);
            
            sectionsMapped++;
          }
        }
      } else {
        // Insert content after each mapped heading
        for (const [sectionType, { paraIndex, content }] of sectionMap) {
          if (paraIndex >= 0 && paraIndex < paragraphs.length) {
            const paragraph = paragraphs[paraIndex];
            const parent = paragraph.parentNode;

            if (parent) {
              // Create content paragraphs from the text (split by newlines)
              const contentParagraphs = this.createContentParagraphs(doc, content, paragraph);
              
              // Insert after the heading
              let insertAfter = paragraph;
              for (const contentPara of contentParagraphs) {
                const nextSibling = insertAfter.nextSibling;
                if (nextSibling) {
                  parent.insertBefore(contentPara, nextSibling);
                } else {
                  parent.appendChild(contentPara);
                }
                insertAfter = contentPara;
              }
              
              sectionsMapped++;
              console.log(chalk.green(`✓ Injected "${sectionType}" section (${content.length} chars)`));
            }
          }
        }
      }

      // Save the modified XML
      const serializer = new XMLSerializer();
      const modifiedXml = serializer.serializeToString(doc);
      
      // Fix XML declaration
      const finalXml = modifiedXml.replace(/<\?xml[^?]*\?>/, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
      
      zip.file('word/document.xml', finalXml);

      // Generate output
      const outputFileName = `composed_${uuidv4().slice(0, 8)}.docx`;
      const outputDir = path.join(process.cwd(), 'uploads', 'composed');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, outputFileName);
      const outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      fs.writeFileSync(outputPath, outputBuffer);

      console.log(chalk.green(`✅ Composition complete! ${sectionsMapped}/${totalSections} sections mapped`));
      console.log(chalk.gray(`📁 Output: ${outputPath}`));

      return {
        success: true,
        outputPath,
        outputFileName,
        sectionsMapped,
        totalSections,
        errors
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      console.error(chalk.red('❌ Composition failed:'), errorMsg);
      
      return {
        success: false,
        outputPath: '',
        outputFileName: '',
        sectionsMapped: 0,
        totalSections,
        errors
      };
    }
  }

  private mapSectionsToParagraphs(
    paragraphs: Element[],
    sections: Record<string, SectionContent>
  ): Map<string, { paraIndex: number; content: string }> {
    const sectionMap = new Map<string, { paraIndex: number; content: string }>();
    const sectionTypes = Object.keys(sections);

    // Section keywords for matching (more comprehensive)
    const sectionKeywords: Record<string, string[]> = {
      abstract: ['abstract', 'summary', 'synopsis'],
      introduction: ['introduction', 'intro', 'background', '1. introduction'],
      objectives: ['objective', 'aim', 'goal', 'purpose', 'objectives'],
      methodology: ['methodology', 'method', 'approach', 'procedure', 'methodologies'],
      conclusion: ['conclusion', 'summary', 'findings', 'results', 'discussion'],
      certificate: ['certificate', 'certification', 'bonafide', 'completion'],
      acknowledgement: ['acknowledgement', 'acknowledgment', 'thanks'],
      declaration: ['declaration', 'undertaking', 'certificate of']
    };

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const text = this.getParagraphText(para).toLowerCase().trim();
      
      // Skip empty paragraphs
      if (!text) continue;
      
      for (const [type, keywords] of Object.entries(sectionKeywords)) {
        if (sectionTypes.includes(type) && !sectionMap.has(type)) {
          // Check if paragraph contains any keyword (as whole word or phrase)
          const matched = keywords.some(keyword => {
            // Check if the paragraph text contains the keyword as a word or phrase
            const pattern = new RegExp(`\\b${keyword}\\b|^${keyword}`, 'i');
            return pattern.test(text);
          });
          
          if (matched) {
            console.log(chalk.gray(`   ✓ Found "${type}" at paragraph ${i}: "${text.slice(0, 30)}..."`));
            sectionMap.set(type, {
              paraIndex: i,
              content: sections[type].content
            });
            break;
          }
        }
      }
    }

    return sectionMap;
  }

  private getParagraphText(paragraph: Element): string {
    const textNodes = this.getElementsByTagNameNS(paragraph, 't');
    let text = '';
    for (const node of textNodes) {
      text += node.textContent || '';
    }
    return text;
  }

  private createContentParagraphs(doc: Document, content: string, templateParagraph: Element | null): Element[] {
    const paragraphs: Element[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const p = doc.createElement('w:p');
      
      // Copy style from template if available
      if (templateParagraph) {
        const pPr = this.getElementsByTagNameNS(templateParagraph, 'pPr')[0];
        if (pPr) {
          const newPPr = pPr.cloneNode(true) as Element;
          p.appendChild(newPPr);
        }
      } else {
        // Default paragraph properties
        const pPr = doc.createElement('w:pPr');
        const pStyle = doc.createElement('w:pStyle');
        pStyle.setAttribute('w:val', 'Normal');
        pPr.appendChild(pStyle);
        p.appendChild(pPr);
      }

      // Add content as run
      const r = doc.createElement('w:r');
      const rPr = doc.createElement('w:rPr');
      const rFonts = doc.createElement('w:rFonts');
      rFonts.setAttribute('w:ascii', 'Calibri');
      rFonts.setAttribute('w:hAnsi', 'Calibri');
      rPr.appendChild(rFonts);
      
      const color = doc.createElement('w:color');
      color.setAttribute('w:val', '000000');
      rPr.appendChild(color);
      
      r.appendChild(rPr);
      
      const t = doc.createElement('w:t');
      t.textContent = line.trim();
      r.appendChild(t);
      p.appendChild(r);
      
      paragraphs.push(p);
    }
    
    return paragraphs;
  }

  private createHeadingParagraph(doc: Document, headingText: string): Element {
    const p = doc.createElement('w:p');
    
    const pPr = doc.createElement('w:pPr');
    const pStyle = doc.createElement('w:pStyle');
    pStyle.setAttribute('w:val', 'Heading1');
    pPr.appendChild(pStyle);
    p.appendChild(pPr);

    const r = doc.createElement('w:r');
    const rPr = doc.createElement('w:rPr');
    const b = doc.createElement('w:b');
    rPr.appendChild(b);
    r.appendChild(rPr);
    
    const t = doc.createElement('w:t');
    t.textContent = headingText.charAt(0).toUpperCase() + headingText.slice(1);
    r.appendChild(t);
    p.appendChild(r);

    return p;
  }

  private createContentParagraph(doc: Document, content: string, templateParagraph: Element | null): Element {
    const p = doc.createElement('w:p');
    
    // Copy style from template if available
    if (templateParagraph) {
      const pPr = this.getElementsByTagNameNS(templateParagraph, 'pPr')[0];
      if (pPr) {
        const newPPr = pPr.cloneNode(true) as Element;
        p.appendChild(newPPr);
      }
    } else {
      const pPr = doc.createElement('w:pPr');
      const pStyle = doc.createElement('w:pStyle');
      pStyle.setAttribute('w:val', 'Normal');
      pPr.appendChild(pStyle);
      p.appendChild(pPr);
    }

    const r = doc.createElement('w:r');
    const t = doc.createElement('w:t');
    t.textContent = content;
    r.appendChild(t);
    p.appendChild(r);

    return p;
  }

  private getElementsByTagNameNS(element: Element | Document, tagName: string): Element[] {
    const result: Element[] = [];
    const prefixes = ['w', 'wpc', 'wp', 'wps', 'wpg', 'w14', 'w15', 'w16'];
    
    for (const prefix of prefixes) {
      const elements = (element as any).getElementsByTagName(`${prefix}:${tagName}`);
      for (let i = 0; i < elements.length; i++) {
        result.push(elements[i] as Element);
      }
    }
    
    const elements = (element as any).getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      result.push(elements[i] as Element);
    }
    
    return result;
  }
}

export default new DocxComposer();