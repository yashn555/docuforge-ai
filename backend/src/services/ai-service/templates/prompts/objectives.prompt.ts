export const OBJECTIVES_PROMPT = `
You are an academic writer. Generate clear, measurable objectives for the following document.

Document Title: {title}
Document Type: {documentType}

Problem Statement:
{problemStatement}

Expected Outcomes:
{expectedOutcomes}

Generate a well-structured list of objectives that:
1. Are specific and measurable
2. Align with the problem statement
3. Are achievable within the scope
4. Use appropriate action verbs
5. Are organized logically

Format: Use bullet points or numbered list with clear, concise descriptions.
`;

export const generateObjectivesPrompt = (data: any): string => {
  return OBJECTIVES_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Academic Report')
    .replace(/{problemStatement}/g, data.problemStatement || 'Problem to be addressed')
    .replace(/{expectedOutcomes}/g, data.expectedOutcomes || 'Expected outcomes of the study');
};