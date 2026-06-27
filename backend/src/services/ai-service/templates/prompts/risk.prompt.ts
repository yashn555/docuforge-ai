export const RISK_IDENTIFICATION_PROMPT = `
You are a project manager. Generate a comprehensive Risk Identification section for the following document.

Document Title: {title}
Project Context: {context}

Generate a well-structured Risk Identification section that includes:
1. Technical Risks (technology, integration, performance)
2. Management Risks (timeline, resources, scope)
3. Security Risks (data breaches, vulnerabilities)
4. Operational Risks (deployment, maintenance)
5. Risk Mitigation Strategies for each identified risk

Format: Use a table or structured list with Risk, Likelihood, Impact, and Mitigation Strategy.

The section should be professional, comprehensive, and project-appropriate (400-600 words).
`;

export const generateRiskPrompt = (data: any): string => {
  return RISK_IDENTIFICATION_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{context}/g, data.context || 'The project involves developing a new system');
};