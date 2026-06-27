export interface AIModel {
  name: string;
  provider: string;
  isAvailable: boolean;
  
  generate(prompt: string, options?: AIGenerateOptions): Promise<AIGenerateResponse>;
  checkAvailability(): Promise<boolean>;
}

export interface AIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  systemPrompt?: string;
}

export interface AIGenerateResponse {
  text: string;
  model: string;
  tokensUsed?: number;
  processingTime?: number;
  success: boolean;
  error?: string;
}