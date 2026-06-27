export const INTRODUCTION_PROMPT = `
You are an academic writer. Generate a comprehensive introduction section for the following document.

Document Title: {title}
Document Type: {documentType}
Author: {author}
Institution: {institution}
Department: {department}
Academic Year: {academicYear}

Background Context:
{background}

Objectives:
{objectives}

Generate a well-structured introduction that:
1. Provides necessary background and context
2. Identifies the problem or research gap
3. States clear objectives or research questions
4. Outlines the scope and significance
5. Briefly previews the document structure

The introduction should be professional, engaging, and academically appropriate (300-500 words).
`;

export const generateIntroductionPrompt = (data: any): string => {
  return INTRODUCTION_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Academic Report')
    .replace(/{author}/g, data.author || 'Student')
    .replace(/{institution}/g, data.institution || 'College/University')
    .replace(/{department}/g, data.department || 'Department')
    .replace(/{academicYear}/g, data.academicYear || 'Current Year')
    .replace(/{background}/g, data.background || 'Background information about the topic')
    .replace(/{objectives}/g, data.objectives || 'The objectives of this study');
};