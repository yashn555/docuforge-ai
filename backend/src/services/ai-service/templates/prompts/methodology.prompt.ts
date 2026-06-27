export const METHODOLOGY_PROMPT = `
You are an academic writer. Generate a comprehensive methodology section for the following document.

Document Title: {title}
Document Type: {documentType}

Research Approach:
{researchApproach}

Tools and Technologies:
{technologies}

Methods:
{methods}

Generate a well-structured methodology that:
1. Describes the research approach and design
2. Explains data collection methods
3. Details tools and technologies used
4. Outlines the analysis approach
5. Addresses reliability and validity

The methodology should be professional, detailed, and academically appropriate (300-500 words).
`;

export const generateMethodologyPrompt = (data: any): string => {
  return METHODOLOGY_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Academic Report')
    .replace(/{researchApproach}/g, data.researchApproach || 'Research methodology approach')
    .replace(/{technologies}/g, data.technologies || 'Tools and technologies used')
    .replace(/{methods}/g, data.methods || 'Research methods employed');
};