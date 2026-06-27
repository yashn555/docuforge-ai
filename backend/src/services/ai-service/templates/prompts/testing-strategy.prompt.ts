export const TESTING_STRATEGY_PROMPT = `
You are a quality assurance engineer. Generate a comprehensive Testing Strategy section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Testing Strategy section that covers:

1. **Testing Objectives** - What testing aims to achieve
2. **Testing Levels** - Unit, integration, system, acceptance testing
3. **Testing Types** - Functional, performance, security, usability testing
4. **Test Environment** - Hardware, software, network setup
5. **Test Data** - Data requirements and preparation
6. **Test Automation** - What will be automated
7. **Defect Management** - Reporting, tracking, fixing defects
8. **Test Metrics** - How testing success will be measured

The section should be professional, detailed, and technically appropriate (400-600 words).
`;

export const generateTestingStrategyPrompt = (data: any): string => {
  return TESTING_STRATEGY_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a software system');
};