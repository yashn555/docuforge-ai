export const RESOURCE_MANAGEMENT_PROMPT = `
You are a project manager. Generate a comprehensive Resource Management section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Resource Management section that covers:

1. **Human Resources** - Team size, roles, skills required
2. **Material Resources** - Equipment, software, tools needed
3. **Financial Resources** - Budget allocation and cost estimates
4. **Resource Allocation** - How resources will be distributed
5. **Resource Scheduling** - When resources will be needed
6. **Resource Optimization** - How to efficiently use resources
7. **Resource Monitoring** - Tracking resource usage

The section should be professional, comprehensive, and project-appropriate (400-600 words).
`;

export const generateResourceManagementPrompt = (data: any): string => {
  return RESOURCE_MANAGEMENT_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a new system');
};