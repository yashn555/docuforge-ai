import { 
  StyleProfile, 
  PageStyle, 
  HeaderFooterStyle, 
  ParagraphStyle, 
  TextStyle 
} from '../models/style.model.js';
import { StyleInfo, ParagraphInfo } from '../parsers/docx-parser.js';

export class StyleExtractor {
  extractStyleProfile(
    styles: StyleInfo[],
    paragraphs: ParagraphInfo[],
    documentXml: string
  ): StyleProfile {
    const pageStyle = this.extractPageStyle(documentXml);
    const headerFooter = this.extractHeaderFooter(documentXml);
    const defaultParagraph = this.extractDefaultParagraphStyle(paragraphs);
    const headingStyles = this.extractHeadingStyles(paragraphs);
    
    return {
      pageStyle,
      headerFooter,
      defaultParagraph,
      headingStyles,
      tableStyles: {
        borderStyle: 'solid',
        cellPadding: 5
      }
    };
  }

  private extractPageStyle(documentXml: string): PageStyle {
    // Default values
    const pageStyle: PageStyle = {
      pageSize: {
        width: 612, // 8.5 inches in points
        height: 792 // 11 inches in points
      },
      margins: {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72
      },
      orientation: 'portrait'
    };

    try {
      // Extract from XML if possible
      // Look for page size and margin information
      const sizeMatch = documentXml.match(/<w:pgSz[^>]*w:w="(\d+)"[^>]*w:h="(\d+)"/);
      if (sizeMatch) {
        pageStyle.pageSize = {
          width: parseInt(sizeMatch[1]),
          height: parseInt(sizeMatch[2])
        };
        if (parseInt(sizeMatch[1]) > parseInt(sizeMatch[2])) {
          pageStyle.orientation = 'landscape';
        }
      }

      const marginMatch = documentXml.match(/<w:pgMar[^>]*w:top="(\d+)"[^>]*w:bottom="(\d+)"[^>]*w:left="(\d+)"[^>]*w:right="(\d+)"/);
      if (marginMatch) {
        pageStyle.margins = {
          top: parseInt(marginMatch[1]),
          bottom: parseInt(marginMatch[2]),
          left: parseInt(marginMatch[3]),
          right: parseInt(marginMatch[4])
        };
      }
    } catch (error) {
      console.warn('Failed to extract page style:', error);
    }

    return pageStyle;
  }

  private extractHeaderFooter(documentXml: string): HeaderFooterStyle {
    const headerFooter: HeaderFooterStyle = {
      hasHeader: documentXml.includes('<w:headerReference'),
      hasFooter: documentXml.includes('<w:footerReference'),
      pageNumbering: {
        placement: 'none',
        style: 'none'
      }
    };

    // Check for page numbering
    if (documentXml.includes('PAGE') || documentXml.includes('NUMPAGES')) {
      headerFooter.pageNumbering = {
        placement: 'bottom',
        style: 'numeric',
        startAt: 1
      };
    }

    return headerFooter;
  }

  private extractDefaultParagraphStyle(paragraphs: ParagraphInfo[]): ParagraphStyle {
    if (paragraphs.length === 0) {
      return this.getDefaultParagraphStyle();
    }

    // Find the most common style
    const styleCounts = new Map<string, number>();
    for (const para of paragraphs) {
      const key = `${para.fontSize || 11}-${para.lineSpacing || 1.15}`;
      styleCounts.set(key, (styleCounts.get(key) || 0) + 1);
    }

    let maxCount = 0;
    let mostCommonKey = '11-1.15';
    for (const [key, count] of styleCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonKey = key;
      }
    }

    const [fontSize, lineSpacing] = mostCommonKey.split('-').map(Number);

    // Find alignment from most common
    const alignCounts = new Map<string, number>();
    for (const para of paragraphs) {
      const align = para.alignment || 'left';
      alignCounts.set(align, (alignCounts.get(align) || 0) + 1);
    }

    let maxAlignCount = 0;
    let mostCommonAlign = 'left';
    for (const [align, count] of alignCounts) {
      if (count > maxAlignCount) {
        maxAlignCount = count;
        mostCommonAlign = align;
      }
    }

    // Get font from first paragraph
    const firstPara = paragraphs[0];

    return {
      alignment: mostCommonAlign as any,
      lineSpacing: lineSpacing || 1.15,
      spacingBefore: 0,
      spacingAfter: 8,
      textStyle: {
        fontFamily: firstPara?.fontFamily || 'Calibri',
        fontSize: fontSize || 11
      }
    };
  }

  private extractHeadingStyles(paragraphs: ParagraphInfo[]): Record<number, ParagraphStyle> {
    const headingStyles: Record<number, ParagraphStyle> = {};
    
    for (let level = 1; level <= 6; level++) {
      // Find first heading of this level
      const heading = paragraphs.find(p => 
        p.isHeading && p.headingLevel === level && p.text
      );

      if (heading) {
        const fontSize = heading.fontSize || (16 - (level - 1) * 1.5);
        headingStyles[level] = {
          textStyle: {
            fontFamily: heading.fontFamily || 'Calibri',
            fontSize: fontSize,
            isBold: heading.isBold || level <= 3,
            isItalic: heading.isItalic || false
          },
          alignment: 'left',
          spacingBefore: 12,
          spacingAfter: 6,
          lineSpacing: 1.15
        };
      } else {
        // Default heading styles
        const defaultSize = 16 - (level - 1) * 1.5;
        headingStyles[level] = {
          textStyle: {
            fontSize: Math.max(defaultSize, 10),
            isBold: true
          },
          alignment: 'left',
          spacingBefore: 12,
          spacingAfter: 6,
          lineSpacing: 1.15
        };
      }
    }

    return headingStyles;
  }

  private getDefaultParagraphStyle(): ParagraphStyle {
    return {
      alignment: 'left',
      lineSpacing: 1.15,
      spacingBefore: 0,
      spacingAfter: 8,
      textStyle: {
        fontFamily: 'Calibri',
        fontSize: 11
      }
    };
  }
}

export default new StyleExtractor();