export const PROJECT_PLANNING_PROMPT = `
You are a project manager. Generate a comprehensive Project Planning section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Project Planning section that includes:

1. **Project Scope** - What is included and excluded
2. **Project Timeline** - Phases and milestones
3. **Resource Allocation** - Team members, roles, and responsibilities
4. **Task Breakdown** - Work breakdown structure
5. **Dependencies** - Task dependencies and critical path
6. **Risk Management** - Potential risks and mitigation
7. **Quality Management** - Quality standards and assurance
8. **Communication Plan** - Stakeholder communication

Format: Use a structured approach with tables where appropriate.

The section should be professional, comprehensive, and project-appropriate (400-600 words).
`;

export const generateProjectPlanningPrompt = (data: any): string => {
  return PROJECT_PLANNING_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a new system');
};