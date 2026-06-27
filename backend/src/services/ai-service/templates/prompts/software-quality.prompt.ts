export const SOFTWARE_QUALITY_PROMPT = `
You are a software quality assurance expert. Generate a comprehensive Software Quality Attributes section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Software Quality Attributes section that covers:

1. **Functional Suitability** - How well the software meets user needs
2. **Performance Efficiency** - Speed, response time, resource usage
3. **Compatibility** - Interoperability with other systems
4. **Usability** - User experience, accessibility, learnability
5. **Reliability** - Availability, fault tolerance, recoverability
6. **Security** - Confidentiality, integrity, non-repudiation
7. **Maintainability** - Modularity, reusability, analyzability
8. **Portability** - Adaptability, installability, replaceability

For each attribute, provide:
- Description of the requirement
- How it will be achieved
- Metrics for measurement

The section should be professional, detailed, and technically appropriate (400-600 words).
`;

export const generateSoftwareQualityPrompt = (data: any): string => {
  return SOFTWARE_QUALITY_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a software system');
};