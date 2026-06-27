export interface PromptData {
  documentType: string;
  title: string;
  author: string;
  institution: string;
  department: string;
  academicYear: string;
  abstractPoints: string;
  objectives: string;
  problemStatement: string;
  expectedOutcomes: string;
  background: string;
  findings: string;
  keyConclusions: string;
  futureWork: string;
  researchApproach: string;
  technologies: string;
  methods: string;
  certificateType: string;
  recipientName: string;
  organization: string;
  eventTitle: string;
  duration: string;
  date: string;
  authority: string;
}

export class PromptBuilder {
  static buildPromptData(userInput: any): PromptData {
    return {
      documentType: userInput.documentType || 'Academic Report',
      title: userInput.title || 'Untitled Document',
      author: userInput.author || userInput.studentName || 'Student',
      institution: userInput.institution || userInput.collegeName || 'College/University',
      department: userInput.department || 'General Department',
      academicYear: userInput.academicYear || 'Current Academic Year',
      abstractPoints: userInput.abstractPoints || 'Research on the topic',
      objectives: userInput.objectives || 'To explore the subject',
      problemStatement: userInput.problemStatement || 'Understanding the key challenges',
      expectedOutcomes: userInput.expectedOutcomes || 'Meaningful insights',
      background: userInput.background || 'Background information about the topic',
      findings: userInput.findings || 'Key findings and results',
      keyConclusions: userInput.keyConclusions || 'Main conclusions drawn',
      futureWork: userInput.futureWork || 'Potential future research directions',
      researchApproach: userInput.researchApproach || 'Comprehensive research methodology',
      technologies: userInput.technologies || 'Relevant tools and technologies',
      methods: userInput.methods || 'Research methods employed',
      certificateType: userInput.certificateType || 'Certificate of Completion',
      recipientName: userInput.recipientName || 'Recipient Name',
      organization: userInput.organization || 'Organization Name',
      eventTitle: userInput.eventTitle || 'Event/Project Title',
      duration: userInput.duration || 'Duration',
      date: userInput.date || new Date().toLocaleDateString(),
      authority: userInput.authority || 'Issuing Authority'
    };
  }
}

export default PromptBuilder;