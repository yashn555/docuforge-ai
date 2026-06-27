export const ABSTRACT_PROMPT = `
You are an academic writer. Generate a comprehensive abstract for the following document.

Document Title: {title}
Document Type: {documentType}
Author: {author}
Institution: {institution}
Department: {department}

Key Points to Include:
{abstractPoints}

Generate a well-structured abstract that:
1. States the purpose and objectives
2. Briefly describes the methodology
3. Highlights key findings or results
4. Concludes with significance or implications

The abstract should be professional, concise (150-250 words), and academically appropriate.
`;

export const generateAbstractPrompt = (data: any): string => {
  return ABSTRACT_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Academic Report')
    .replace(/{author}/g, data.author || 'Student')
    .replace(/{institution}/g, data.institution || 'College/University')
    .replace(/{department}/g, data.department || 'Department')
    .replace(/{abstractPoints}/g, data.abstractPoints || 'Research on the topic');
};