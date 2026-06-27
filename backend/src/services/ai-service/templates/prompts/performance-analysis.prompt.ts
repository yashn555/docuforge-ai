export const PERFORMANCE_ANALYSIS_PROMPT = `
You are a performance engineer. Generate a comprehensive Performance Analysis section for the following document.

Document Title: {title}
Project Type: {documentType}
Project Context: {context}

Generate a well-structured Performance Analysis section that covers:

1. **Performance Objectives** - Speed, throughput, response time goals
2. **Performance Metrics** - Key performance indicators
3. **Testing Approach** - Load testing, stress testing, endurance testing
4. **Performance Benchmarks** - Baseline measurements
5. **Optimization Strategies** - How to improve performance
6. **Monitoring Plan** - How performance will be monitored
7. **Capacity Planning** - Future growth considerations

The section should be professional, detailed, and technically appropriate (400-600 words).
`;

export const generatePerformanceAnalysisPrompt = (data: any): string => {
  return PERFORMANCE_ANALYSIS_PROMPT
    .replace(/{title}/g, data.title || 'Untitled Document')
    .replace(/{documentType}/g, data.documentType || 'Project Report')
    .replace(/{context}/g, data.context || 'The project involves developing a software system');
};