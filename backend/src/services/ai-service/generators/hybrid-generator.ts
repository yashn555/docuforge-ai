import { SectionGenerator, SectionGenerationResult } from './section-generator.js';
import { PromptBuilder, PromptData } from './prompt-builder.js';
import chalk from 'chalk';

export interface HybridGenerationOptions {
  useAI: boolean;
  useFallback: boolean;
  temperature?: number;
  maxTokens?: number;
  regenerateOnly?: string[];
}

export interface HybridGenerationResult {
  sections: Record<string, SectionGenerationResult>;
  totalSections: number;
  aiGenerated: number;
  fallbackGenerated: number;
  totalTime: number;
  success: boolean;
  errors: string[];
}

export class HybridGenerator {
  private sectionGenerator: SectionGenerator;

  constructor() {
    this.sectionGenerator = new SectionGenerator();
  }

  async generateDocument(
    userInput: any,
    sectionsToGenerate: string[],
    options?: HybridGenerationOptions
  ): Promise<HybridGenerationResult> {
    const startTime = Date.now();
    const results: Record<string, SectionGenerationResult> = {};
    const errors: string[] = [];
    let aiGenerated = 0;
    let fallbackGenerated = 0;

    console.log(chalk.blue(`📝 Generating ${sectionsToGenerate.length} sections...`));

    // Build prompt data
    const promptData = PromptBuilder.buildPromptData(userInput);

    // Generate each section
    for (const sectionType of sectionsToGenerate) {
      try {
        console.log(chalk.gray(`   Generating ${sectionType}...`));
        
        const result = await this.sectionGenerator.generateSection(
          sectionType,
          promptData,
          {
            useAI: options?.useAI !== false,
            useFallback: options?.useFallback !== false,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens
          }
        );

        results[sectionType] = result;

        if (result.generatedBy === 'ai') {
          aiGenerated++;
        } else if (result.generatedBy === 'fallback') {
          fallbackGenerated++;
        }

        if (!result.success && result.error) {
          errors.push(`[${sectionType}] ${result.error}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`[${sectionType}] ${errorMsg}`);
        
        // Use fallback content
        const fallbackResult = await this.sectionGenerator.generateSection(
          sectionType,
          promptData,
          { useAI: false, useFallback: true }
        );
        results[sectionType] = fallbackResult;
        fallbackGenerated++;
      }
    }

    const totalTime = Date.now() - startTime;
    
    console.log(chalk.green(`✅ Generation complete!`));
    console.log(chalk.gray(`   AI: ${aiGenerated}, Fallback: ${fallbackGenerated}, Time: ${totalTime}ms`));

    return {
      sections: results,
      totalSections: sectionsToGenerate.length,
      aiGenerated,
      fallbackGenerated,
      totalTime,
      success: errors.length === 0,
      errors
    };
  }

  async checkAIStatus(): Promise<boolean> {
    return await this.sectionGenerator.checkModelAvailability();
  }

  async getAvailableModels(): Promise<string[]> {
    return await this.sectionGenerator.getAvailableModels();
  }

  isAIAvailable(): boolean {
    return this.sectionGenerator.isModelReady();
  }
}

export default HybridGenerator;