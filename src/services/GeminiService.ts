import type { 
  GeminiServiceConfig, 
  GenerateContentOptions, 
  GenerateContentResult, 
  BatchGenerateResult,
  GeminiApiRequest,
  GeminiApiResponse,
  ColumnId
} from '../types/gemini';
import { GeminiApiError, NetworkError, ValidationError } from '../types/gemini';

export class GeminiService {
  private config: GeminiServiceConfig;

  constructor(config: GeminiServiceConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new ValidationError('API key is required');
    }
    if (!this.config.baseUrl) {
      throw new ValidationError('Base URL is required');
    }
  }

  /**
   * Generate content using a specific Gemini model
   */
  async generateContent(
    modelId: string, 
    prompt: string, 
    options: GenerateContentOptions = {}
  ): Promise<GenerateContentResult> {
    const startTime = Date.now();
    
    try {
      const url = `${this.config.baseUrl}/models/${modelId}:generateContent?key=${this.config.apiKey}`;
      
      const requestBody: GeminiApiRequest = {
        contents: [{
          parts: [{ text: prompt }],
          role: 'user'
        }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          topK: options.topK ?? 40,
          topP: options.topP ?? 0.95,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
          stopSequences: options.stopSequences
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new GeminiApiError(
          `API request failed: ${response.status} ${response.statusText}. ${errorText}`,
          response.status,
          modelId
        );
      }

      const data: GeminiApiResponse = await response.json();
      const endTime = Date.now();
      return this.handleResponse(data, modelId, startTime, endTime);

    } catch (error) {
      if (error instanceof GeminiApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(`Network error while calling ${modelId}`, modelId);
      }
      throw new GeminiApiError(
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        modelId
      );
    }
  }

  /**
   * Generate content using multiple models in parallel
   */
  async generateContentBatch(
    models: Record<ColumnId, string>, 
    prompt: string, 
    options: GenerateContentOptions = {}
  ): Promise<BatchGenerateResult> {
    const promises = Object.entries(models).map(async ([columnId, modelId]) => {
      try {
        const result = await this.generateContent(modelId, prompt, options);
        return { columnId: columnId as ColumnId, result, error: null };
      } catch (error) {
        return { 
          columnId: columnId as ColumnId, 
          result: null, 
          error: error instanceof Error ? error : new Error('Unknown error') 
        };
      }
    });

    const results = await Promise.allSettled(promises);
    
    const batchResult: BatchGenerateResult = {
      results: {} as Record<ColumnId, GenerateContentResult>,
      errors: {} as Record<ColumnId, Error>
    };

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { columnId, result: contentResult, error } = result.value;
        if (contentResult) {
          batchResult.results[columnId] = contentResult;
        }
        if (error) {
          batchResult.errors[columnId] = error;
        }
      } else {
        // This shouldn't happen since we catch errors above, but just in case
        console.error('Unexpected batch result failure:', result.reason);
      }
    });

    return batchResult;
  }

  /**
   * Process and format the API response
   */
  private handleResponse(response: GeminiApiResponse, modelId: string, startTime: number, endTime: number): GenerateContentResult {
    if (!response.candidates || response.candidates.length === 0) {
      throw new GeminiApiError('No candidates returned from API', undefined, modelId);
    }

    const candidate = response.candidates[0];
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new GeminiApiError('No content in API response', undefined, modelId);
    }

    const text = candidate.content.parts
      .map(part => part.text)
      .join('')
      .trim();

    if (!text) {
      throw new GeminiApiError('Empty response from API', undefined, modelId);
    }

    return {
      text,
      modelId,
      timestamp: endTime,
      startTime,
      endTime,
      responseTime: endTime - startTime
    };
  }

  /**
   * Validate a prompt before sending to API
   */
  validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new ValidationError('Prompt cannot be empty');
    }
    
    if (prompt.length > 30000) { // Conservative limit
      throw new ValidationError('Prompt is too long (max 30,000 characters)');
    }
  }

  /**
   * Get available models (returns the model IDs that this service can use)
   */
  getAvailableModels(): string[] {
    // In a real implementation, this might call the API to get available models
    // For now, we'll return a static list of commonly available models
    return [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.0-pro'
    ];
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateContent('gemini-1.5-flash', 'Hello', { maxOutputTokens: 10 });
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  /**
   * Update the API configuration
   */
  updateConfig(newConfig: Partial<GeminiServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();
  }
} 