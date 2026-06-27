export const SYSTEM_ARCHITECTURE_PROMPT = `
You are a software architect. Generate a comprehensive System Architecture section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}
Technologies Used: {technologies}

Generate a well-structured System Architecture section that covers:

1. **Architecture Overview** - High-level system design
2. **Architecture Style** - Client-server, microservices, layered, etc.
3. **Component Description** - Each component's role and responsibility
4. **Data Flow** - How data moves through the system
5. **Technology Stack** - Languages, frameworks, databases used
6. **Integration Points** - How components integrate
7. **Scalability Considerations** - How the system handles growth
8. **Security Architecture** - Security design considerations

The section should be professional, detailed, and technically appropriate (400-600 words).
`;

export const generateSystemArchitecturePrompt = (data: any): string => {
  return SYSTEM_ARCHITECTURE_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a software system')
    .replace(/{technologies}/g, data.technologies || 'Modern web technologies');
};