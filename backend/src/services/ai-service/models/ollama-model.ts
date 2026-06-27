import axios from 'axios';
import { AIModel, AIGenerateOptions, AIGenerateResponse } from './ai-model.interface.js';
import chalk from 'chalk';
import { Readable } from 'stream';

export class OllamaModel implements AIModel {
  name: string;
  provider: string = 'ollama';
  isAvailable: boolean = false;
  private baseUrl: string;
  private timeout: number;
  private streamingEnabled: boolean;

  constructor(
    modelName: string, 
    baseUrl: string = 'http://localhost:11434', 
    timeout: number = 60000,
    streamingEnabled: boolean = true
  ) {
    this.name = modelName;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.streamingEnabled = streamingEnabled;
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        const models = response.data.models || [];
        const modelNames = models.map((m: any) => m.name || m.model || '');
        
        // Check if the model exists exactly or as a prefix
        const modelExists = modelNames.some((name: string) => 
          name === this.name || 
          name.startsWith(this.name) || 
          this.name.startsWith(name)
        );
        
        if (modelExists) {
          // Find the exact model name to use
          const exactModel = modelNames.find((name: string) => 
            name === this.name || 
            name.startsWith(this.name) || 
            this.name.startsWith(name)
          );
          if (exactModel && exactModel !== this.name) {
            console.log(chalk.yellow(`ℹ️ Using model "${exactModel}" instead of "${this.name}"`));
            this.name = exactModel;
          }
          this.isAvailable = true;
          console.log(chalk.green(`✅ Ollama model "${this.name}" is available`));
        } else {
          console.log(chalk.yellow(`⚠️ Ollama model "${this.name}" not found. Available: ${modelNames.join(', ')}`));
          this.isAvailable = false;
        }
        return this.isAvailable;
      }
      
      this.isAvailable = false;
      return false;
    } catch (error) {
      console.log(chalk.red(`❌ Ollama not available at ${this.baseUrl}`));
      this.isAvailable = false;
      return false;
    }
  }

  async generate(prompt: string, options?: AIGenerateOptions): Promise<AIGenerateResponse> {
    const startTime = Date.now();
    
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        return {
          text: '',
          model: this.name,
          success: false,
          error: `Ollama model "${this.name}" is not available`
        };
      }
    }

    try {
      console.log(chalk.gray(`🤖 Generating with ${this.name}...`));
      
      // Reduce prompt length for tinyllama
      let shortPrompt = prompt;
      if (prompt.length > 800) {
        shortPrompt = prompt.slice(0, 800) + '\n\n[Generate concise content]';
      }

      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.name,
          prompt: shortPrompt,
          stream: false, // Use non-streaming for tiny models
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.maxTokens || 300, // Reduced for faster response
            num_ctx: 2048,
            repeat_penalty: 1.1,
            top_k: 40,
            top_p: 0.9,
          }
        },
        {
          timeout: options?.timeout || this.timeout
        }
      );

      const processingTime = Date.now() - startTime;
      
      if (response.data && response.data.response) {
        const text = response.data.response.trim();
        if (text && text.length > 10) {
          console.log(chalk.green(`✅ Generated ${text.length} chars in ${processingTime}ms`));
          return {
            text: text,
            model: this.name,
            tokensUsed: response.data.eval_count || 0,
            processingTime: processingTime,
            success: true
          };
        } else {
          return {
            text: '',
            model: this.name,
            success: false,
            error: 'Response too short or empty'
          };
        }
      } else {
        return {
          text: '',
          model: this.name,
          success: false,
          error: 'No response from Ollama'
        };
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Ollama generation error:`), error.message);
      
      // Try with even shorter prompt if timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(chalk.yellow(`⏰ Generation timed out. Trying with shorter prompt...`));
        
        try {
          const veryShortPrompt = prompt.slice(0, 300) + '\n\n[Brief response]';
          const shortResponse = await axios.post(
            `${this.baseUrl}/api/generate`,
            {
              model: this.name,
              prompt: veryShortPrompt,
              stream: false,
              options: {
                temperature: 0.7,
                num_predict: 200,
              }
            },
            {
              timeout: 20000
            }
          );
          
          if (shortResponse.data && shortResponse.data.response) {
            const text = shortResponse.data.response.trim();
            if (text && text.length > 10) {
              console.log(chalk.green(`✅ Generated ${text.length} chars (short version)`));
              return {
                text: text,
                model: this.name,
                processingTime: Date.now() - startTime,
                success: true
              };
            }
          }
        } catch (shortError) {
          console.log(chalk.yellow(`⚠️ Short prompt also failed`));
        }
      }
      
      return {
        text: '',
        model: this.name,
        success: false,
        error: error.message || 'Generation failed'
      };
    }
  }

  async pullModel(): Promise<boolean> {
    try {
      console.log(chalk.yellow(`📥 Pulling model "${this.name}"...`));
      const response = await axios.post(
        `${this.baseUrl}/api/pull`,
        { name: this.name },
        { timeout: 600000 }
      );
      
      if (response.status === 200) {
        console.log(chalk.green(`✅ Model "${this.name}" pulled successfully`));
        this.isAvailable = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error(chalk.red(`❌ Failed to pull model:`), error);
      return false;
    }
  }
}

export default OllamaModel;