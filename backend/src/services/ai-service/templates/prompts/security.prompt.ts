export const SECURITY_REQUIREMENTS_PROMPT = `
You are a technical writer. Generate a comprehensive Security Requirements section for the following document.

Document Title: {title}
Document Type: {documentType}
Project Context: {context}

Generate a well-structured Security Requirements section that includes:
1. Authentication and Authorization requirements
2. Data Encryption and Privacy measures
3. Network Security considerations
4. Application Security best practices
5. Compliance and Regulatory requirements
6. Security Testing and Monitoring

The section should be professional, detailed, and technically appropriate (400-600 words).
`;

export const generateSecurityPrompt = (data: any): string => {
  return SECURITY_REQUIREMENTS_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a secure application');
};