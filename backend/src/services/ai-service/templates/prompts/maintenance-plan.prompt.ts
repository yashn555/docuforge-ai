export const MAINTENANCE_PLAN_PROMPT = `
You are a software engineer. Generate a comprehensive Maintenance Plan section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Maintenance Plan section that covers:

1. **Maintenance Objectives** - Goals for system maintenance
2. **Maintenance Types** - Corrective, adaptive, perfective, preventive
3. **Maintenance Process** - How maintenance will be handled
4. **Roles and Responsibilities** - Who does what
5. **Maintenance Schedule** - Regular maintenance activities
6. **Documentation** - What needs to be documented
7. **Release Management** - How releases will be managed
8. **Support Plan** - How user support will be provided

The section should be professional, comprehensive, and project-appropriate (400-600 words).
`;

export const generateMaintenancePlanPrompt = (data: any): string => {
  return MAINTENANCE_PLAN_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a new system');
};