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
    [key: string]: any;
  };
  sectionsToGenerate: string[];
  options?: {
    useAI?: boolean;
    useFallback?: boolean;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AIGenerationResult extends HybridGenerationResult {
  documentTitle: string;
  documentType: string;
  generatedAt: string;
}

export class AIService {
  private generator: HybridGenerator;

  constructor() {
    this.generator = new HybridGenerator();
    console.log(chalk.blue('🤖 AI Service initialized'));
  }

  async generateDocument(request: AIGenerationRequest): Promise<AIGenerationResult> {
    console.log(chalk.cyan(`📝 Generating document with ${request.sectionsToGenerate.length} sections`));
    console.log(chalk.gray(`   AI Enabled: ${request.options?.useAI !== false}`));
    console.log(chalk.gray(`   Fallback: ${request.options?.useFallback !== false}`));

    const result = await this.generator.generateDocument(
      request.userInput,
      request.sectionsToGenerate,
      {
        useAI: request.options?.useAI !== false,
        useFallback: request.options?.useFallback !== false,
        temperature: request.options?.temperature,
        maxTokens: request.options?.maxTokens
      }
    );

    // Build final result
    const documentTitle = request.userInput.title || 'Generated Document';
    const documentType = request.userInput.documentType || 'Report';

    return {
      ...result,
      documentTitle,
      documentType,
      generatedAt: new Date().toISOString()
    };
  }

  async getAIAvailability(): Promise<{
    available: boolean;
    models: string[];
    currentModel?: string;
  }> {
    const available = await this.generator.checkAIStatus();
    const models = await this.generator.getAvailableModels();
    const isReady = this.generator.isAIAvailable();

    return {
      available: isReady,
      models: models,
      currentModel: isReady ? 'llama3.2:3b' : undefined
    };
  }
}

export default new AIService();