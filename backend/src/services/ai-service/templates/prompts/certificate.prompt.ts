export const CERTIFICATE_PROMPT = `
You are a professional document writer. Generate a certificate text for the following:

Certificate Type: {certificateType}
Recipient Name: {recipientName}
Organization: {organization}
Event/Project Title: {eventTitle}
Duration: {duration}
Date: {date}
Issuing Authority: {authority}

Generate a formal certificate text that includes:
1. Certificate title
2. Recipient information
3. Description of achievement or participation
4. Duration and date
5. Issuing authority and signature line

The certificate should be professional, formal, and appropriate for the context.
`;

export const generateCertificatePrompt = (data: any): string => {
  return CERTIFICATE_PROMPT
    .replace(/{certificateType}/g, data.certificateType || 'Certificate of Completion')
    .replace(/{recipientName}/g, data.recipientName || 'Recipient Name')
    .replace(/{organization}/g, data.organization || 'Organization Name')
    .replace(/{eventTitle}/g, data.eventTitle || 'Event/Project Title')
    .replace(/{duration}/g, data.duration || 'Duration')
    .replace(/{date}/g, data.date || new Date().toLocaleDateString())
    .replace(/{authority}/g, data.authority || 'Issuing Authority');
};