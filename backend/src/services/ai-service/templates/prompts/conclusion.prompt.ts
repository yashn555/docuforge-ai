export const CONCLUSION_PROMPT = `
You are an academic writer. Generate a comprehensive conclusion section for the following document.

Document Title: {title}
Document Type: {documentType}

Summary of Findings:
{findings}

Key Conclusions:
{keyConclusions}

Future Work:
{futureWork}

Generate a well-structured conclusion that:
1. Summarizes the main findings and contributions
2. Discusses the significance and implications
3. Addresses limitations (if any)
4. Suggests future directions or applications

The conclusion should be professional, reflective, and academically appropriate (200-400 words).
`;

export const generateConclusionPrompt = (data: any): string => {
  return CONCLUSION_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Academic Report')
    .replace(/{findings}/g, data.findings || 'Key findings and results')
    .replace(/{keyConclusions}/g, data.keyConclusions || 'Main conclusions drawn')
    .replace(/{futureWork}/g, data.futureWork || 'Potential future research directions');
};