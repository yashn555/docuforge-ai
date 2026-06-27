import { generateAbstractPrompt } from './prompts/abstract.prompt.js';
import { generateIntroductionPrompt } from './prompts/introduction.prompt.js';
import { generateConclusionPrompt } from './prompts/conclusion.prompt.js';
import { generateObjectivesPrompt } from './prompts/objectives.prompt.js';
import { generateMethodologyPrompt } from './prompts/methodology.prompt.js';
import { generateCertificatePrompt } from './prompts/certificate.prompt.js';

export interface SectionTemplate {
  type: string;
  promptGenerator: (data: any) => string;
  fallbackContent: (data: any) => string;
  description: string;
}

export const SectionTemplates: Record<string, SectionTemplate> = {
  abstract: {
    type: 'abstract',
    promptGenerator: generateAbstractPrompt,
    fallbackContent: (data: any) => {
      return `This document explores the topic of ${data.title || 'the subject'} in detail. The study examines key aspects and presents findings that contribute to the field. The research demonstrates significant insights and provides recommendations for future work.`;
    },
    description: 'Generates a comprehensive abstract'
  },
  introduction: {
    type: 'introduction',
    promptGenerator: generateIntroductionPrompt,
    fallbackContent: (data: any) => {
      return `This report presents a comprehensive study on ${data.title || 'the topic'}. The document covers essential background information, identifies key areas of focus, and outlines the approach taken. The introduction establishes the context and significance of the work.`;
    },
    description: 'Generates a comprehensive introduction'
  },
  conclusion: {
    type: 'conclusion',
    promptGenerator: generateConclusionPrompt,
    fallbackContent: (data: any) => {
      return `In conclusion, this study has addressed the key objectives and presented meaningful findings. The results demonstrate the effectiveness of the approach and suggest directions for future research and application.`;
    },
    description: 'Generates a comprehensive conclusion'
  },
  objectives: {
    type: 'objectives',
    promptGenerator: generateObjectivesPrompt,
    fallbackContent: (data: any) => {
      return `• To analyze the current state of ${data.title || 'the field'}\n• To identify key challenges and opportunities\n• To develop effective solutions\n• To evaluate the results and provide recommendations`;
    },
    description: 'Generates a list of objectives'
  },
  methodology: {
    type: 'methodology',
    promptGenerator: generateMethodologyPrompt,
    fallbackContent: (data: any) => {
      return `The methodology employed in this study follows a systematic approach. Research methods were selected based on the objectives and constraints. Data collection and analysis were conducted using established procedures to ensure reliability.`;
    },
    description: 'Generates a comprehensive methodology'
  },
  certificate: {
    type: 'certificate',
    promptGenerator: generateCertificatePrompt,
    fallbackContent: (data: any) => {
      return `This is to certify that ${data.recipientName || 'the recipient'} has successfully completed the ${data.eventTitle || 'program'}. The achievement is recognized and appreciated.`;
    },
    description: 'Generates a formal certificate text'
  }
};

export default SectionTemplates;