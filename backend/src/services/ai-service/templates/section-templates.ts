import { generateAbstractPrompt } from './prompts/abstract.prompt.js';
import { generateIntroductionPrompt } from './prompts/introduction.prompt.js';
import { generateConclusionPrompt } from './prompts/conclusion.prompt.js';
import { generateObjectivesPrompt } from './prompts/objectives.prompt.js';
import { generateMethodologyPrompt } from './prompts/methodology.prompt.js';
import { generateCertificatePrompt } from './prompts/certificate.prompt.js';
import { generateSecurityPrompt } from './prompts/security.prompt.js';
import { generateRiskPrompt } from './prompts/risk.prompt.js';
import { generateSoftwareQualityPrompt } from './prompts/software-quality.prompt.js';
import { generateProjectPlanningPrompt } from './prompts/project-planning.prompt.js';
import { generateQualityAssurancePrompt } from './prompts/quality-assurance.prompt.js';
import { generateSystemArchitecturePrompt } from './prompts/system-architecture.prompt.js';
import { generatePerformanceAnalysisPrompt } from './prompts/performance-analysis.prompt.js';
import { generateResourceManagementPrompt } from './prompts/resource-management.prompt.js';
import { generateBudgetEstimationPrompt } from './prompts/budget-estimation.prompt.js';
import { generateTestingStrategyPrompt } from './prompts/testing-strategy.prompt.js';
import { generateMaintenancePlanPrompt } from './prompts/maintenance-plan.prompt.js';

export interface SectionTemplate {
  type: string;
  promptGenerator: (data: any) => string;
  fallbackContent: (data: any) => string;
  description: string;
}

export const SectionTemplates: Record<string, SectionTemplate> = {
  // Core Sections
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
  },

  // Technical Sections
  system_architecture: {
    type: 'system_architecture',
    promptGenerator: generateSystemArchitecturePrompt,
    fallbackContent: (data: any) => {
      return `The system architecture follows a modern, scalable design pattern. The architecture consists of multiple layers including presentation, business logic, and data access. The system is designed to be maintainable, extensible, and secure.`;
    },
    description: 'Generates system architecture description'
  },
  security_requirements: {
    type: 'security_requirements',
    promptGenerator: generateSecurityPrompt,
    fallbackContent: (data: any) => {
      return `Security requirements include authentication, authorization, data encryption, and secure communication. The system implements industry-standard security measures to protect sensitive data and ensure user privacy.`;
    },
    description: 'Generates security requirements'
  },
  software_quality: {
    type: 'software_quality',
    promptGenerator: generateSoftwareQualityPrompt,
    fallbackContent: (data: any) => {
      return `Software quality attributes include reliability, performance, security, maintainability, and usability. The system is designed to meet high-quality standards and is regularly tested to ensure compliance.`;
    },
    description: 'Generates software quality attributes'
  },
  risk_identification: {
    type: 'risk_identification',
    promptGenerator: generateRiskPrompt,
    fallbackContent: (data: any) => {
      return `Key risks identified include technical challenges, resource constraints, and timeline pressures. Mitigation strategies have been developed for each risk to minimize impact on the project.`;
    },
    description: 'Generates risk identification and mitigation'
  },
  performance_analysis: {
    type: 'performance_analysis',
    promptGenerator: generatePerformanceAnalysisPrompt,
    fallbackContent: (data: any) => {
      return `Performance analysis focuses on response time, throughput, and resource utilization. The system is designed to handle expected load with optimal performance.`;
    },
    description: 'Generates performance analysis'
  },

  // Management Sections
  project_planning: {
    type: 'project_planning',
    promptGenerator: generateProjectPlanningPrompt,
    fallbackContent: (data: any) => {
      return `The project plan includes defined scope, timeline, resources, and milestones. The project is divided into phases with clear deliverables and success criteria.`;
    },
    description: 'Generates project planning'
  },
  resource_management: {
    type: 'resource_management',
    promptGenerator: generateResourceManagementPrompt,
    fallbackContent: (data: any) => {
      return `Resource management covers human resources, materials, and budget. Resources are allocated efficiently to meet project objectives.`;
    },
    description: 'Generates resource management'
  },
  budget_estimation: {
    type: 'budget_estimation',
    promptGenerator: generateBudgetEstimationPrompt,
    fallbackContent: (data: any) => {
      return `The budget estimation includes costs for personnel, infrastructure, software, and operations. A cost-benefit analysis shows the value proposition of the project.`;
    },
    description: 'Generates budget estimation'
  },

  // Quality Sections
  quality_assurance: {
    type: 'quality_assurance',
    promptGenerator: generateQualityAssurancePrompt,
    fallbackContent: (data: any) => {
      return `Quality assurance processes ensure the system meets defined standards. Testing, reviews, and continuous improvement are key components of the QA strategy.`;
    },
    description: 'Generates quality assurance'
  },
  testing_strategy: {
    type: 'testing_strategy',
    promptGenerator: generateTestingStrategyPrompt,
    fallbackContent: (data: any) => {
      return `The testing strategy includes unit, integration, system, and acceptance testing. Automation is used where appropriate to ensure comprehensive test coverage.`;
    },
    description: 'Generates testing strategy'
  },
  maintenance_plan: {
    type: 'maintenance_plan',
    promptGenerator: generateMaintenancePlanPrompt,
    fallbackContent: (data: any) => {
      return `The maintenance plan covers corrective, adaptive, perfective, and preventive maintenance. Regular updates and support ensure the system remains reliable and up-to-date.`;
    },
    description: 'Generates maintenance plan'
  }
};

export default SectionTemplates;