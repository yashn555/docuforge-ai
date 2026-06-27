export const BUDGET_ESTIMATION_PROMPT = `
You are a financial analyst. Generate a comprehensive Budget Estimation section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Budget Estimation section that covers:

1. **Cost Categories** - Hardware, software, personnel, operational costs
2. **Cost Estimation Methods** - How costs were estimated
3. **Budget Breakdown** - Detailed cost allocation
4. **Contingency Planning** - Buffer for unexpected costs
5. **Cost-Benefit Analysis** - Return on investment calculation
6. **Budget Monitoring** - How budget will be tracked
7. **Funding Sources** - Where funding comes from

Format: Use a structured approach with tables for cost breakdown.

The section should be professional, comprehensive, and project-appropriate (400-600 words).
`;

export const generateBudgetEstimationPrompt = (data: any): string => {
  return BUDGET_ESTIMATION_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a new system');
};