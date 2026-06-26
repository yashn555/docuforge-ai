export enum DocumentType {
  PROJECT_REPORT = 'project_report',
  INTERNSHIP_REPORT = 'internship_report',
  OFFICE_REPORT = 'office_report',
  CERTIFICATE = 'certificate',
  THESIS = 'thesis',
  ASSIGNMENT = 'assignment',
  LETTER = 'letter',
  PROPOSAL = 'proposal',
  UNKNOWN = 'unknown'
}

export const DocumentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.PROJECT_REPORT]: 'Project Report',
  [DocumentType.INTERNSHIP_REPORT]: 'Internship Report',
  [DocumentType.OFFICE_REPORT]: 'Office Report',
  [DocumentType.CERTIFICATE]: 'Certificate',
  [DocumentType.THESIS]: 'Thesis',
  [DocumentType.ASSIGNMENT]: 'Assignment',
  [DocumentType.LETTER]: 'Letter',
  [DocumentType.PROPOSAL]: 'Proposal',
  [DocumentType.UNKNOWN]: 'Unknown Document Type'
};