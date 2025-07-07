import type { 
  GeminiServiceConfig, 
  GenerateContentOptions, 
  GenerateContentResult, 
  BatchGenerateResult,
  GeminiApiRequest,
  GeminiApiResponse,
  ColumnId,
  PerformanceMetrics,
  QualityMetrics,
  TechnicalMetadata
} from '../types/gemini';
import { GeminiApiError, NetworkError, ValidationError } from '../types/gemini';

export class GeminiService {
  private config: GeminiServiceConfig;
  
  // Gemini API pricing per 1K tokens (approximate as of 2024)
  private readonly PRICING = {
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    'gemini-2.0-flash': { input: 0.000075, output: 0.0003 },
    'gemini-1.5-pro-002': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash-002': { input: 0.000075, output: 0.0003 },
    'gemini-1.5-flash-8b': { input: 0.0000375, output: 0.00015 },
    'gemini-1.0-pro': { input: 0.0005, output: 0.0015 },
    'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
    'default': { input: 0.001, output: 0.003 }
  };

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

      const requestSize = new Blob([JSON.stringify(requestBody)]).size;
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
      const responseSize = new Blob([JSON.stringify(data)]).size;
      
      return this.handleResponse(data, modelId, startTime, endTime, requestSize, responseSize, prompt, requestBody);

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
   * Process and format the API response with comprehensive metrics
   */
  private handleResponse(
    response: GeminiApiResponse, 
    modelId: string, 
    startTime: number, 
    endTime: number, 
    requestSize: number, 
    responseSize: number,
    prompt: string,
    requestBody: GeminiApiRequest
  ): GenerateContentResult {
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

    const responseTime = endTime - startTime;
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = this.estimateTokens(text);
    const totalTokens = inputTokens + outputTokens;
    
    // Calculate performance metrics
    const performanceMetrics: PerformanceMetrics = {
      responseTime,
      startTime,
      endTime,
      tokenUsage: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens
      },
      estimatedCost: this.calculateCost(modelId, inputTokens, outputTokens),
      throughput: totalTokens / (responseTime / 1000), // tokens per second
      requestSize,
      responseSize
    };

    // Calculate quality metrics
    const qualityMetrics: QualityMetrics = {
      responseLength: this.analyzeTextLength(text),
      estimatedReadingLevel: this.estimateReadingLevel(text),
      safetyScore: this.analyzeSafetyScore(candidate.safetyRatings),
      finishReason: candidate.finishReason,
      contentCategories: this.categorizeContent(text),
      languageDetected: this.detectLanguage(text)
    };

    // Collect technical metadata
    const technicalMetadata: TechnicalMetadata = {
      modelVersion: modelId,
      modelName: modelId,
      apiVersion: 'v1beta',
      requestConfig: {
        temperature: requestBody.generationConfig?.temperature ?? 0.7,
        topK: requestBody.generationConfig?.topK ?? 40,
        topP: requestBody.generationConfig?.topP ?? 0.95,
        maxOutputTokens: requestBody.generationConfig?.maxOutputTokens ?? 2048,
        stopSequences: requestBody.generationConfig?.stopSequences
      },
      safetySettings: requestBody.safetySettings || [],
      safetyRatings: candidate.safetyRatings || [],
      promptFeedback: response.promptFeedback,
      candidateCount: response.candidates.length
    };

    return {
      text,
      modelId,
      timestamp: endTime,
      startTime,
      endTime,
      responseTime,
      performanceMetrics,
      qualityMetrics,
      technicalMetadata
    };
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate estimated cost based on token usage
   */
  private calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const pricing = this.PRICING[modelId as keyof typeof this.PRICING] || this.PRICING.default;
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Analyze text length metrics
   */
  private analyzeTextLength(text: string): QualityMetrics['responseLength'] {
    const characters = text.length;
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
    const estimatedTokens = this.estimateTokens(text);

    return {
      characters,
      words,
      sentences,
      paragraphs,
      estimatedTokens
    };
  }

  /**
   * Estimate reading level (simplified)
   */
  private estimateReadingLevel(text: string): string {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length === 0) return 'N/A';
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((acc, word) => acc + this.countSyllables(word), 0) / words.length;
    
    // Simplified Flesch Reading Ease
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  /**
   * Count syllables in a word (simplified)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  /**
   * Analyze safety score from ratings
   */
  private analyzeSafetyScore(safetyRatings: Array<{ category: string; probability: string }>): string {
    if (!safetyRatings || safetyRatings.length === 0) return 'Not Available';
    
    const hasHighRisk = safetyRatings.some(rating => 
      rating.probability === 'HIGH' || rating.probability === 'MEDIUM'
    );
    
    if (hasHighRisk) return 'Caution Required';
    return 'Safe';
  }

  /**
   * Categorize content type
   */
  private categorizeContent(text: string): string[] {
    const categories: string[] = [];
    
    // Simple content categorization
    if (text.includes('```') || text.includes('function') || text.includes('class')) {
      categories.push('Code');
    }
    if (text.includes('?') && text.split('?').length > 2) {
      categories.push('Q&A');
    }
    if (text.includes('Step') || text.includes('1.') || text.includes('2.')) {
      categories.push('Instructions');
    }
    if (text.length > 500) {
      categories.push('Long-form');
    }
    
    return categories.length > 0 ? categories : ['General'];
  }

  /**
   * Detect primary language (simplified)
   */
  private detectLanguage(text: string): string {
    // Very simplified language detection
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
    const lowerText = text.toLowerCase();
    const englishMatches = englishWords.filter(word => lowerText.includes(word)).length;
    
    return englishMatches > 3 ? 'English' : 'Other/Mixed';
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