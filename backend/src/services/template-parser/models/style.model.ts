export interface TextStyle {
  fontFamily?: string;
  fontSize?: number; // in points
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  color?: string;
  isStrikethrough?: boolean;
  isSuperscript?: boolean;
  isSubscript?: boolean;
}

export interface ParagraphStyle {
  alignment?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: number; // multiple
  spacingBefore?: number; // in points
  spacingAfter?: number; // in points
  indentLeft?: number; // in points
  indentRight?: number; // in points
  firstLineIndent?: number; // in points
  textStyle?: TextStyle;
}

export interface PageStyle {
  pageSize?: {
    width: number; // in points
    height: number; // in points
  };
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  orientation?: 'portrait' | 'landscape';
}

export interface HeaderFooterStyle {
  hasHeader: boolean;
  hasFooter: boolean;
  headerContent?: string;
  footerContent?: string;
  pageNumbering?: {
    placement: 'top' | 'bottom' | 'none';
    style: 'numeric' | 'roman' | 'none';
    startAt?: number;
  };
}

export interface StyleProfile {
  pageStyle: PageStyle;
  headerFooter: HeaderFooterStyle;
  defaultParagraph: ParagraphStyle;
  headingStyles: Record<number, ParagraphStyle>;
  tableStyles: {
    borderStyle?: string;
    cellPadding?: number;
  };
}