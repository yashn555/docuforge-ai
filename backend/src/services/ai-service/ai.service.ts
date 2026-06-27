import { HybridGenerator, HybridGenerationResult } from './generators/hybrid-generator.js';
import chalk from 'chalk';

export interface AIGenerationRequest {
  userInput: {
    title?: string;
    studentName?: string;
    teacherName?: string;
    collegeName?: string;
    department?: string;
    academicYear?: string;
    abstractPoints?: string;
    objectives?: string;
    problemStatement?: string;
    technologies?: string;
    methodology?: string;
    conclusion?: string;
    context?: string;
    documentType?: string;
    selectedSections?: string[];
    templateStructure?: any;
    existingContent?: Record<string, any>;
    sectionToRegenerate?: string;
    [key: string]: any;
  };
  sectionsToGenerate: string[];
  options?: {
    useAI?: boolean;
    useFallback?: boolean;
    temperature?: number;
    maxTokens?: number;
    regenerateMode?: boolean;
    sectionSpecificPrompts?: boolean;
  };
}

export interface AIGenerationResult extends HybridGenerationResult {
  documentTitle: string;
  documentType: string;
  generatedAt: string;
  contextUsed?: {
    hasContext: boolean;
    hasExistingContent: boolean;
    isRegeneration: boolean;
  };
}

export class AIService {
  private generator: HybridGenerator;
  private generationHistory: Map<string, AIGenerationResult> = new Map();

  constructor() {
    this.generator = new HybridGenerator();
    console.log(chalk.blue('🤖 AI Service initialized'));
  }

  async generateDocument(request: AIGenerationRequest): Promise<AIGenerationResult> {
    const startTime = Date.now();
    console.log(chalk.cyan(`📝 Generating document with ${request.sectionsToGenerate.length} sections`));
    console.log(chalk.gray(`   AI Enabled: ${request.options?.useAI !== false}`));
    console.log(chalk.gray(`   Fallback: ${request.options?.useFallback !== false}`));
    console.log(chalk.gray(`   Regenerate Mode: ${request.options?.regenerateMode || false}`));
    
    // Enhanced context logging
    const hasContext = !!request.userInput.context;
    const hasExistingContent = !!request.userInput.existingContent && 
      Object.keys(request.userInput.existingContent).length > 0;
    const isRegeneration = !!request.options?.regenerateMode;
    
    console.log(chalk.gray(`   Has Context: ${hasContext}`));
    console.log(chalk.gray(`   Has Existing Content: ${hasExistingContent}`));
    console.log(chalk.gray(`   Is Regeneration: ${isRegeneration}`));

    // Prepare enhanced user input with context
    const enhancedUserInput = this.prepareUserInput(request.userInput, {
      hasContext,
      hasExistingContent,
      isRegeneration,
      sections: request.sectionsToGenerate
    });

    console.log(chalk.gray(`   Enhanced Context: ${enhancedUserInput.context?.substring(0, 100)}...`));

    // Generate the document
    const result = await this.generator.generateDocument(
      enhancedUserInput,
      request.sectionsToGenerate,
      {
        useAI: request.options?.useAI !== false,
        useFallback: request.options?.useFallback !== false,
        temperature: request.options?.temperature,
        maxTokens: request.options?.maxTokens,
        regenerateMode: request.options?.regenerateMode || false,
        sectionSpecificPrompts: request.options?.sectionSpecificPrompts !== false
      }
    );

    // Build final result
    const documentTitle = request.userInput.title || 'Generated Document';
    const documentType = request.userInput.documentType || 'Report';
    const processingTime = Date.now() - startTime;

    const finalResult: AIGenerationResult = {
      ...result,
      documentTitle,
      documentType,
      generatedAt: new Date().toISOString(),
      contextUsed: {
        hasContext,
        hasExistingContent,
        isRegeneration
      },
      processingTime
    };

    // Store in history with session ID if available
    const sessionId = request.userInput.sessionId || 'unknown';
    this.generationHistory.set(sessionId, finalResult);

    console.log(chalk.green(`✅ Generation complete in ${Math.round(processingTime / 1000)}s`));
    console.log(chalk.gray(`   AI Generated: ${result.aiGenerated}, Fallback: ${result.fallbackGenerated}`));

    return finalResult;
  }

  private prepareUserInput(
    userInput: any, 
    context: { hasContext: boolean; hasExistingContent: boolean; isRegeneration: boolean; sections: string[] }
  ): any {
    const enhanced = { ...userInput };

    // Build comprehensive context if not provided
    if (!enhanced.context) {
      const contextParts = [];
      
      if (enhanced.title) {
        contextParts.push(`Document Title: ${enhanced.title}`);
      }
      
      if (enhanced.studentName) {
        contextParts.push(`Author: ${enhanced.studentName}`);
      }
      
      if (enhanced.collegeName) {
        contextParts.push(`Institution: ${enhanced.collegeName}`);
      }
      
      if (enhanced.technologies) {
        contextParts.push(`Technologies: ${enhanced.technologies}`);
      }
      
      if (enhanced.abstractPoints) {
        contextParts.push(`Abstract Points: ${enhanced.abstractPoints}`);
      }
      
      if (enhanced.objectives) {
        contextParts.push(`Objectives: ${enhanced.objectives}`);
      }
      
      if (enhanced.problemStatement) {
        contextParts.push(`Problem Statement: ${enhanced.problemStatement}`);
      }
      
      if (enhanced.methodology) {
        contextParts.push(`Methodology: ${enhanced.methodology}`);
      }

      // Add section context
      if (context.sections.length > 0) {
        contextParts.push(`Sections to generate: ${context.sections.join(', ')}`);
      }

      enhanced.context = contextParts.join('. ') || 'Generate a comprehensive document';
    }

    // Add regeneration context if applicable
    if (context.isRegeneration && enhanced.sectionToRegenerate) {
      enhanced.context += ` Regenerate the "${enhanced.sectionToRegenerate}" section with improved content.`;
      
      if (enhanced.existingContent && enhanced.existingContent[enhanced.sectionToRegenerate]) {
        enhanced.context += ` Current content: ${enhanced.existingContent[enhanced.sectionToRegenerate].content?.substring(0, 200)}...`;
      }
    }

    // Add existing content context
    if (context.hasExistingContent && !context.isRegeneration) {
      const existingSections = Object.keys(enhanced.existingContent || {});
      if (existingSections.length > 0) {
        enhanced.context += ` Existing sections: ${existingSections.join(', ')}. Maintain consistency with these sections.`;
      }
    }

    // Add document type context
    if (enhanced.documentType) {
      enhanced.context += ` Document type: ${enhanced.documentType}.`;
    }

    return enhanced;
  }

  async getAIAvailability(): Promise<{
    available: boolean;
    models: string[];
    currentModel?: string;
  }> {
    try {
      const models = await this.generator.getAvailableModels();
      const isReady = this.generator.isAIAvailable();
      const available = await this.generator.checkAIStatus();

      return {
        available: isReady || available,
        models: models.length > 0 ? models : ['llama3.2:3b', 'mistral', 'gemma2'],
        currentModel: isReady ? (models[0] || 'llama3.2:3b') : undefined
      };
    } catch (error) {
      console.error(chalk.red('❌ Failed to check AI availability:'), error);
      return {
        available: false,
        models: ['llama3.2:3b', 'mistral', 'gemma2'],
        currentModel: undefined
      };
    }
  }

  // Get generation history for a session
  getGenerationHistory(sessionId: string): AIGenerationResult | undefined {
    return this.generationHistory.get(sessionId);
  }

  // Clear generation history for a session
  clearGenerationHistory(sessionId: string): void {
    this.generationHistory.delete(sessionId);
    console.log(chalk.gray(`🗑️ Generation history cleared for session: ${sessionId}`));
  }

  // Get all generation history
  getAllHistory(): Map<string, AIGenerationResult> {
    return this.generationHistory;
  }

  // Generate a single section with specific context
  async generateSection(
    sectionType: string,
    userInput: any,
    options?: {
      useAI?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<any> {
    console.log(chalk.cyan(`📝 Generating section: ${sectionType}`));
    
    const result = await this.generateDocument({
      userInput: {
        ...userInput,
        context: userInput.context || `Generate the ${sectionType} section of a document.`,
        sectionToRegenerate: sectionType
      },
      sectionsToGenerate: [sectionType],
      options: {
        useAI: options?.useAI !== false,
        useFallback: true,
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 2048,
        regenerateMode: true
      }
    });

    return result.sections[sectionType];
  }

  // Validate and enhance prompts
  enhancePrompt(prompt: string, context: any): string {
    let enhanced = prompt;
    
    // Add context if available
    if (context) {
      if (context.title) {
        enhanced += `\nDocument Title: ${context.title}`;
      }
      if (context.documentType) {
        enhanced += `\nDocument Type: ${context.documentType}`;
      }
      if (context.technologies) {
        enhanced += `\nTechnologies: ${context.technologies}`;
      }
    }
    
    // Add section-specific instructions
    if (context.sectionType) {
      switch (context.sectionType) {
        case 'abstract':
          enhanced += '\nProvide a concise overview of the entire document.';
          break;
        case 'introduction':
          enhanced += '\nIntroduce the topic and provide background context.';
          break;
        case 'objectives':
          enhanced += '\nList clear, measurable objectives.';
          break;
        case 'methodology':
          enhanced += '\nDescribe the research approach and methods.';
          break;
        case 'conclusion':
          enhanced += '\nSummarize findings and provide recommendations.';
          break;
        default:
          enhanced += `\nGenerate the ${context.sectionType} section.`;
      }
    }
    
    return enhanced;
  }
}

export default new AIService();