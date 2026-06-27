export const QUALITY_ASSURANCE_PROMPT = `
You are a quality assurance specialist. Generate a comprehensive Quality Assurance section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Quality Assurance section that covers:

1. **Quality Objectives** - Quality goals and targets
2. **Quality Standards** - Standards and regulations to follow
3. **Quality Planning** - How quality will be ensured
4. **Quality Control** - Testing and verification methods
5. **Quality Improvement** - Continuous improvement processes
6. **Review Process** - How reviews will be conducted
7. **Defect Management** - Tracking and fixing defects
8. **Quality Metrics** - How quality will be measured

The section should be professional, detailed, and technically appropriate (400-600 words).
`;

export const generateQualityAssurancePrompt = (data: any): string => {
  return QUALITY_ASSURANCE_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a software system');
};