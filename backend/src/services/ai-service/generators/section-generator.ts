import { AIModel } from '../models/ai-model.interface.js';
import ModelFactory from '../models/model-factory.js';
import { SectionTemplates } from '../templates/section-templates.js';
import chalk from 'chalk';

export interface SectionGenerationResult {
  sectionType: string;
  content: string;
  generatedBy: 'ai' | 'fallback' | 'hybrid';
  modelUsed?: string;
  processingTime?: number;
  tokensUsed?: number;
  success: boolean;
  error?: string;
}

export interface SectionGenerationOptions {
  useAI?: boolean;
  useFallback?: boolean;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export class SectionGenerator {
  private model: AIModel | null = null;
  private modelReady: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 2;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      this.model = await ModelFactory.getAvailableModel();
      if (this.model) {
        this.modelReady = true;
        console.log(chalk.green(`✅ Section generator initialized with model: ${this.model.name}`));
      } else {
        console.log(chalk.yellow('⚠️ No AI model available, using fallback only'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize AI model:'), error);
    }
  }

  async generateSection(
    sectionType: string,
    data: any,
    options?: SectionGenerationOptions
  ): Promise<SectionGenerationResult> {
    const startTime = Date.now();
    
    // Check if we have a template for this section type
    const template = SectionTemplates[sectionType];
    if (!template) {
      return {
        sectionType,
        content: `[Content for ${sectionType} section]`,
        generatedBy: 'fallback',
        success: true
      };
    }

    // Build the prompt - keep it concise
    let prompt = '';
    try {
      prompt = template.promptGenerator(data);
      // Truncate if too long
      if (prompt.length > 2000) {
        prompt = prompt.slice(0, 2000) + '\n\n[Provide a concise response for this section]';
      }
    } catch (error) {
      console.warn(`Failed to generate prompt for ${sectionType}:`, error);
      prompt = `Generate a concise ${sectionType} section for a ${data.documentType || 'document'}.`;
    }

    // Try AI generation with retries
    let useAI = options?.useAI !== false && this.modelReady && this.model;
    let result: SectionGenerationResult | null = null;
    let attempts = 0;

    while (useAI && attempts <= this.maxRetries && !result) {
      attempts++;
      try {
        console.log(chalk.cyan(`🤖 Generating ${sectionType} with AI (attempt ${attempts})...`));
        
        const aiResponse = await this.model!.generate(prompt, {
          temperature: options?.temperature || 0.7,
          maxTokens: options?.maxTokens || 500, // Reduced for faster response
          timeout: options?.timeout || 60000
        });

        if (aiResponse.success && aiResponse.text && aiResponse.text.length > 20) {
          const processingTime = Date.now() - startTime;
          result = {
            sectionType,
            content: aiResponse.text,
            generatedBy: 'ai',
            modelUsed: this.model!.name,
            processingTime: processingTime,
            tokensUsed: aiResponse.tokensUsed,
            success: true
          };
          console.log(chalk.green(`✅ AI generated ${sectionType} (${processingTime}ms, ${aiResponse.text.length} chars)`));
          break;
        } else if (aiResponse.error) {
          console.warn(chalk.yellow(`⚠️ AI generation attempt ${attempts} failed: ${aiResponse.error}`));
          // Wait before retry
          if (attempts <= this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ AI generation attempt ${attempts} error: ${error}`));
        if (attempts <= this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }

    // Use fallback if AI failed or was disabled
    if (!result) {
      console.log(chalk.gray(`📝 Using fallback for ${sectionType}`));
      let fallbackContent = template.fallbackContent(data);
      
      // Make fallback more meaningful
      if (fallbackContent.includes('data.')) {
        fallbackContent = this.generateMeaningfulFallback(sectionType, data);
      }
      
      const processingTime = Date.now() - startTime;
      
      result = {
        sectionType,
        content: fallbackContent,
        generatedBy: 'fallback',
        processingTime: processingTime,
        success: true
      };
    }

    return result;
  }

  private generateMeaningfulFallback(sectionType: string, data: any): string {
    const title = data.title || 'this topic';
    const author = data.author || 'the author';
    const institution = data.institution || 'the institution';
    
    const fallbacks: Record<string, string> = {
      abstract: `This document presents a comprehensive study on ${title}. The research explores key aspects and provides valuable insights. The findings contribute to the understanding of the subject and offer practical recommendations.`,
      
      introduction: `This report provides a detailed examination of ${title}. The introduction establishes the context and significance of the study. The research addresses important questions and aims to contribute to the field.`,
      
      conclusion: `In conclusion, this study on ${title} has achieved its objectives. The findings demonstrate important insights and suggest directions for future research. The work contributes to the body of knowledge in this area.`,
      
      objectives: `• To analyze the current state of ${title}\n• To identify key challenges and opportunities\n• To develop effective solutions\n• To evaluate the results and provide recommendations`,
      
      methodology: `The methodology employed in this study follows a systematic approach. Research methods were selected based on the objectives. Data collection and analysis were conducted using established procedures to ensure reliability.`,
      
      certificate: `This is to certify that ${data.recipientName || 'the recipient'} has successfully completed the ${data.eventTitle || 'program'}. The achievement is recognized and appreciated.`
    };

    return fallbacks[sectionType] || `Content for the ${sectionType} section of this document.`;
  }

  async checkModelAvailability(): Promise<boolean> {
    if (this.model) {
      return await this.model.checkAvailability();
    }
    return false;
  }

  async getAvailableModels(): Promise<string[]> {
    return await ModelFactory.listAvailableModels();
  }

  isModelReady(): boolean {
    return this.modelReady;
  }
}

export default SectionGenerator;