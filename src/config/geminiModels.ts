import type { GeminiModels, ModelCategory, ModelFeature } from '../types/gemini';

export const GEMINI_MODELS: GeminiModels = {
  // Gemini 2.5 Series (Latest Generation - 2025)
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Most intelligent thinking model with enhanced reasoning and coding capabilities',
    contextWindow: '1M tokens',
    generation: '2.5',
    category: 'flagship',
    features: ['thinking', 'reasoning', 'coding', 'multimodal', 'audio', 'video', 'pdf']
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Best price-performance model with adaptive thinking capabilities',
    contextWindow: '1M tokens',
    generation: '2.5',
    category: 'balanced',
    features: ['thinking', 'fast', 'cost-effective', 'multimodal', 'audio', 'video']
  },
  'gemini-2.5-flash-lite-preview': {
    id: 'gemini-2.5-flash-lite-preview-06-17',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Most cost-efficient model optimized for high throughput',
    contextWindow: '1M tokens',
    generation: '2.5',
    category: 'lite',
    features: ['cost-effective', 'high-throughput', 'multimodal']
  },
  'gemini-2.5-flash-preview-tts': {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 2.5 Flash TTS',
    description: 'Text-to-speech model for audio generation',
    contextWindow: '8K tokens',
    generation: '2.5',
    category: 'specialized',
    features: ['text-to-speech', 'audio-generation']
  },
  'gemini-2.5-pro-preview-tts': {
    id: 'gemini-2.5-pro-preview-tts',
    name: 'Gemini 2.5 Pro TTS',
    description: 'Advanced text-to-speech with premium quality',
    contextWindow: '8K tokens',
    generation: '2.5',
    category: 'specialized',
    features: ['text-to-speech', 'premium-audio']
  },

  // Gemini 2.0 Series (Current Generation - 2024/2025)
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Next-gen features with improved speed and native tool use',
    contextWindow: '1M tokens',
    generation: '2.0',
    category: 'fast',
    features: ['fast', 'tool-use', 'multimodal', 'realtime-streaming']
  },
  'gemini-2.0-flash-thinking': {
    id: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking',
    description: 'Experimental model that exposes reasoning process',
    contextWindow: '1M tokens',
    generation: '2.0',
    category: 'experimental',
    features: ['thinking', 'reasoning-visibility', 'experimental']
  },
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    description: 'Cost-efficient version optimized for low latency',
    contextWindow: '1M tokens',
    generation: '2.0',
    category: 'lite',
    features: ['cost-effective', 'low-latency', 'multimodal']
  },
  'gemini-2.0-pro': {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    description: 'Advanced capabilities with enhanced performance',
    contextWindow: '1M tokens',
    generation: '2.0',
    category: 'pro',
    features: ['advanced', 'multimodal', 'enhanced-performance']
  },
  'gemini-2.0-flash-preview-image-generation': {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash Image Gen',
    description: 'Conversational image generation and editing',
    contextWindow: '32K tokens',
    generation: '2.0',
    category: 'specialized',
    features: ['image-generation', 'conversational', 'image-editing']
  },

  // Gemini 1.5 Series (Stable Generation - 2024)
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Mid-size multimodal model optimized for complex reasoning',
    contextWindow: '2M tokens',
    generation: '1.5',
    category: 'pro',
    features: ['complex-reasoning', 'multimodal', 'long-context']
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and versatile performance across diverse tasks',
    contextWindow: '1M tokens',
    generation: '1.5',
    category: 'balanced',
    features: ['versatile', 'fast', 'multimodal']
  },
  'gemini-1.5-flash-8b': {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    description: 'Smaller model for high volume and lower intelligence tasks',
    contextWindow: '1M tokens',
    generation: '1.5',
    category: 'lite',
    features: ['high-volume', 'cost-effective', 'multimodal']
  },

  // Gemini 1.0 Series (Legacy - 2023)
  'gemini-1.0-pro': {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    description: 'Legacy model maintained for compatibility',
    contextWindow: '32K tokens',
    generation: '1.0',
    category: 'legacy',
    features: ['legacy', 'compatibility']
  },
  'gemini-1.0-ultra': {
    id: 'gemini-1.0-ultra',
    name: 'Gemini 1.0 Ultra',
    description: 'Legacy ultra model for complex tasks',
    contextWindow: '32K tokens',
    generation: '1.0',
    category: 'legacy',
    features: ['legacy', 'complex-tasks']
  },

  // Live API Models (Real-time Audio/Video)
  'gemini-2.5-flash-live': {
    id: 'gemini-2.5-flash-live',
    name: 'Gemini 2.5 Flash Live',
    description: 'Low-latency bidirectional voice and video interactions',
    contextWindow: '1M tokens',
    generation: '2.5',
    category: 'live',
    features: ['live-api', 'voice', 'video', 'real-time']
  },
  'gemini-2.0-flash-live': {
    id: 'gemini-2.0-flash-live',
    name: 'Gemini 2.0 Flash Live',
    description: 'Real-time audio and video processing',
    contextWindow: '1M tokens',
    generation: '2.0',
    category: 'live',
    features: ['live-api', 'audio', 'video', 'real-time']
  },

  // Specialized Models
  'gemini-embedding': {
    id: 'gemini-embedding',
    name: 'Gemini Embedding',
    description: 'State-of-the-art text embeddings for semantic understanding',
    contextWindow: '8K tokens',
    generation: 'embedding',
    category: 'specialized',
    features: ['embeddings', 'semantic-search', 'retrieval']
  },
  'text-embedding-004': {
    id: 'text-embedding-004',
    name: 'Text Embedding 004',
    description: 'High-performance text embeddings with 768 dimensions',
    contextWindow: '2K tokens',
    generation: 'embedding',
    category: 'specialized',
    features: ['embeddings', 'text-only', 'retrieval']
  }
};

// Helper functions to get models by category
export const getModelsByCategory = (category: ModelCategory) => {
  return Object.values(GEMINI_MODELS).filter(model => model.category === category);
};

// Helper function to get models by generation
export const getModelsByGeneration = (generation: string) => {
  return Object.values(GEMINI_MODELS).filter(model => model.generation === generation);
};

// Helper function to get models with specific features
export const getModelsByFeature = (feature: ModelFeature) => {
  return Object.values(GEMINI_MODELS).filter(model => 
    model.features && model.features.includes(feature)
  );
};

// Default model selections for each column
export const DEFAULT_MODEL_SELECTION = {
  column1: 'gemini-2.5-pro',
  column2: 'gemini-2.5-flash',
  column3: 'gemini-2.0-flash'
} as const; 