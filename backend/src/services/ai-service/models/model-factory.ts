import { AIModel } from './ai-model.interface.js';
import { OllamaModel } from './ollama-model.js';
import chalk from 'chalk';

export class ModelFactory {
  private static instance: ModelFactory;
  private models: Map<string, AIModel> = new Map();
  private defaultModel: string;
  private timeout: number;

  private constructor() {
    this.defaultModel = process.env.AI_MODEL || 'tinyllama:latest';
    this.timeout = parseInt(process.env.AI_TIMEOUT || '60000');
  }

  static getInstance(): ModelFactory {
    if (!ModelFactory.instance) {
      ModelFactory.instance = new ModelFactory();
    }
    return ModelFactory.instance;
  }

  getModel(name?: string): AIModel {
    const modelName = name || this.defaultModel;
    
    if (this.models.has(modelName)) {
      return this.models.get(modelName)!;
    }

    const baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
    const streamingEnabled = process.env.AI_STREAMING_ENABLED !== 'false';
    const model = new OllamaModel(
      modelName, 
      baseUrl, 
      this.timeout,
      streamingEnabled
    );
    this.models.set(modelName, model);
    
    // Check availability in background
    model.checkAvailability().catch(() => {});
    
    return model;
  }

  async getAvailableModel(): Promise<AIModel | null> {
    // Check all models
    for (const [name, model] of this.models) {
      const available = await model.checkAvailability();
      if (available) {
        return model;
      }
    }

    // Try to find any available model from Ollama
    try {
      const baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        const modelNames = models.map((m: any) => m.name || m.model);
        
        // Find the smallest available model
        const preferred = ['tinyllama:latest', 'llama2:latest', 'llama3.2:3b', 'phi'];
        for (const preferredModel of preferred) {
          const found = modelNames.find((name: string) => 
            name === preferredModel || name.startsWith(preferredModel)
          );
          if (found) {
            console.log(chalk.green(`✅ Found available model: ${found}`));
            const model = this.getModel(found);
            await model.checkAvailability();
            return model;
          }
        }
        
        // Use any available model
        if (modelNames.length > 0) {
          console.log(chalk.green(`✅ Using available model: ${modelNames[0]}`));
          const model = this.getModel(modelNames[0]);
          await model.checkAvailability();
          return model;
        }
      }
    } catch (error) {
      console.log(chalk.red('❌ Failed to get available models:'), error);
    }

    console.log(chalk.red('❌ No AI models available'));
    return null;
  }

  async listAvailableModels(): Promise<string[]> {
    try {
      const baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const data = await response.json();
        return data.models.map((m: any) => m.name || m.model);
      }
      return [];
    } catch (error) {
      return [];
    }
  }
}

export default ModelFactory.getInstance();