// Core Gemini model types
export type ModelGeneration = '1.0' | '1.5' | '2.0' | '2.5' | 'embedding';

export type ModelCategory = 
  | 'flagship' 
  | 'balanced' 
  | 'fast' 
  | 'lite' 
  | 'pro' 
  | 'specialized' 
  | 'live' 
  | 'experimental' 
  | 'legacy';

export type ModelFeature = 
  | 'thinking' 
  | 'reasoning' 
  | 'coding' 
  | 'multimodal' 
  | 'audio' 
  | 'video' 
  | 'pdf'
  | 'fast'
  | 'cost-effective'
  | 'text-to-speech'
  | 'audio-generation'
  | 'premium-audio'
  | 'tool-use'
  | 'realtime-streaming'
  | 'reasoning-visibility'
  | 'experimental'
  | 'high-throughput'
  | 'low-latency'
  | 'advanced'
  | 'enhanced-performance'
  | 'image-generation'
  | 'conversational'
  | 'image-editing'
  | 'complex-reasoning'
  | 'long-context'
  | 'versatile'
  | 'high-volume'
  | 'legacy'
  | 'compatibility'
  | 'complex-tasks'
  | 'live-api'
  | 'voice'
  | 'real-time'
  | 'embeddings'
  | 'semantic-search'
  | 'retrieval'
  | 'text-only';

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  generation: ModelGeneration;
  category: ModelCategory;
  features: ModelFeature[];
}

export interface GeminiModels {
  [key: string]: GeminiModel;
}

// API Response types
export interface GeminiApiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export interface GeminiApiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
    role: string;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

// Application state types
export type ColumnId = 'column1' | 'column2' | 'column3';

export interface ColumnResponse {
  text: string;
  timestamp: number;
  modelId: string;
  modelName: string;
  startTime: number;
  endTime: number;
  responseTime: number;
  isStreaming?: boolean;
}

export interface ColumnError {
  message: string;
  timestamp: number;
  modelId: string;
}

// Enhanced metrics types
export interface PerformanceMetrics {
  responseTime: number;
  startTime: number;
  endTime: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCost: number;
  throughput: number; // tokens per second
  requestSize: number; // bytes
  responseSize: number; // bytes
}

export interface QualityMetrics {
  responseLength: {
    characters: number;
    words: number;
    sentences: number;
    paragraphs: number;
    estimatedTokens: number;
  };
  estimatedReadingLevel: string;
  safetyScore: string;
  finishReason: string;
  contentCategories: string[];
  languageDetected: string;
}

export interface TechnicalMetadata {
  modelVersion: string;
  modelName: string;
  apiVersion: string;
  requestConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
    stopSequences?: string[];
  };
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
  safetyRatings: Array<{
    category: string;
    probability: string;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
  apiResponseHeaders?: Record<string, string>;
  candidateCount: number;
}

export interface EnhancedColumnResponse extends ColumnResponse {
  performanceMetrics: PerformanceMetrics;
  qualityMetrics: QualityMetrics;
  technicalMetadata: TechnicalMetadata;
}

export interface AppState {
  selectedModels: Record<ColumnId, string>;
  responses: Record<ColumnId, EnhancedColumnResponse | null>;
  loading: Record<ColumnId, boolean>;
  errors: Record<ColumnId, ColumnError | null>;
  currentPrompt: string;
  modelCategories: Record<string, ModelCategory>;
  availableModels: GeminiModels;
}

// Component prop types
export interface ColumnProps {
  columnId: ColumnId;
  selectedModel: string;
  onModelChange: (columnId: ColumnId, modelId: string) => void;
  response: EnhancedColumnResponse | null;
  isLoading: boolean;
  error: ColumnError | null;
  availableModels: GeminiModels;
}

export interface ModelSelectorProps {
  selectedModel: string;
  onChange: (modelId: string) => void;
  disabled: boolean;
  availableModels: GeminiModels;
  columnId: ColumnId;
}

export interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  currentPrompt: string;
  onPromptChange: (prompt: string) => void;
}

export interface ResponseDisplayProps {
  response: EnhancedColumnResponse | null;
  isLoading: boolean;
  error: ColumnError | null;
  modelName: string;
}

// Service types
export interface GeminiServiceConfig {
  apiKey: string;
  baseUrl: string;
}

export interface GenerateContentOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

export interface GenerateContentResult {
  text: string;
  modelId: string;
  timestamp: number;
  startTime: number;
  endTime: number;
  responseTime: number;
  performanceMetrics: PerformanceMetrics;
  qualityMetrics: QualityMetrics;
  technicalMetadata: TechnicalMetadata;
}

export interface BatchGenerateResult {
  results: Record<ColumnId, GenerateContentResult>;
  errors: Record<ColumnId, Error>;
}

// Utility types
export type ModelCategoryKey = keyof typeof MODEL_CATEGORIES;

export const MODEL_CATEGORIES = {
  FLAGSHIP: 'flagship' as const,
  BALANCED: 'balanced' as const,
  FAST: 'fast' as const,
  LITE: 'lite' as const,
  PRO: 'pro' as const,
  SPECIALIZED: 'specialized' as const,
  LIVE: 'live' as const,
  EXPERIMENTAL: 'experimental' as const,
  LEGACY: 'legacy' as const,
} as const;

// Error types
export class GeminiApiError extends Error {
  public status?: number;
  public modelId?: string;

  constructor(message: string, status?: number, modelId?: string) {
    super(message);
    this.name = 'GeminiApiError';
    this.status = status;
    this.modelId = modelId;
  }
}

export class NetworkError extends Error {
  public modelId?: string;

  constructor(message: string, modelId?: string) {
    super(message);
    this.name = 'NetworkError';
    this.modelId = modelId;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Export structure for JSON
export interface SessionExport {
  session: {
    timestamp: string;
    prompt: string;
    models_tested: string[];
    total_responses: number;
    total_cost: number;
    average_response_time: number;
  };
  responses: Record<ColumnId, {
    response: string;
    performance_metrics: PerformanceMetrics;
    quality_metrics: QualityMetrics;
    technical_metadata: TechnicalMetadata;
  } | null>;
  comparison: {
    fastest_model: string;
    slowest_model: string;
    most_cost_effective: string;
    longest_response: string;
    best_safety_score: string;
  };
} 