# Gemini Testing React Application - Project Plan

## Project Overview
A single-page React application for testing and comparing multiple Gemini AI models simultaneously. Users can input prompts and see responses from up to three different Gemini models side-by-side in real-time.

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │    Column 1     │ │    Column 2     │ │    Column 3     ││
│  │  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  ││
│  │  │Model Select│  │ │  │Model Select│  │ │  │Model Select│  ││
│  │  └───────────┘  │ │  └───────────┘  │ │  └───────────┘  ││
│  │  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  ││
│  │  │  Response │  │ │  │  Response │  │ │  │  Response │  ││
│  │  │   Area    │  │ │  │   Area    │  │ │  │   Area    │  ││
│  │  └───────────┘  │ │  └───────────┘  │ │  └───────────┘  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Prompt Input Area                        ││
│  │           [Text Area] [Submit Button]                   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              GeminiService Class                        ││
│  │  - API key management                                   ││
│  │  - Request formatting                                   ││
│  │  - Response handling                                    ││
│  │  - Error management                                     ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                 Environment Configuration                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    .env File                            ││
│  │  - REACT_APP_GEMINI_API_KEY                             ││
│  │  - REACT_APP_GEMINI_BASE_URL                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

### 1. Main App Component (`App.js`)
- **Purpose**: Root component that manages global state and layout
- **Responsibilities**:
  - Manage selected models for each column
  - Handle prompt submission
  - Coordinate API calls across all three models
  - Manage loading states
  - Error handling and display

### 2. Column Component (`Column.js`)
- **Purpose**: Individual column containing model selector and response area
- **Props**:
  - `columnId`: Unique identifier (1, 2, 3)
  - `selectedModel`: Currently selected Gemini model
  - `onModelChange`: Callback for model selection
  - `response`: API response data
  - `isLoading`: Loading state
  - `error`: Error state
- **Responsibilities**:
  - Render model dropdown
  - Display formatted response
  - Handle loading and error states

### 3. ModelSelector Component (`ModelSelector.js`)
- **Purpose**: Dropdown for selecting Gemini models
- **Props**:
  - `selectedModel`: Currently selected model
  - `onChange`: Callback for selection change
  - `disabled`: Disable during API calls
- **Responsibilities**:
  - Render dropdown with all available Gemini models
  - Handle model selection

### 4. PromptInput Component (`PromptInput.js`)
- **Purpose**: Input area for user prompts
- **Props**:
  - `onSubmit`: Callback for prompt submission
  - `isLoading`: Disable input during API calls
- **Responsibilities**:
  - Handle text input
  - Submit on Enter key press
  - Validate input

### 5. ResponseDisplay Component (`ResponseDisplay.js`)
- **Purpose**: Formatted display of API responses
- **Props**:
  - `response`: API response data
  - `isLoading`: Loading state
  - `error`: Error state
  - `modelName`: Name of the model for context
- **Responsibilities**:
  - Format and display response text
  - Handle loading animations
  - Display error messages
  - Support markdown formatting if needed

## Service Layer

### GeminiService Class (`services/GeminiService.js`)
- **Purpose**: Handle all Gemini API interactions
- **Methods**:
  - `generateContent(model, prompt)`: Send prompt to specific model
  - `generateContentBatch(models, prompt)`: Send prompt to multiple models
  - `getAvailableModels()`: Return list of supported models
  - `formatRequest(model, prompt)`: Format API request
  - `handleResponse(response)`: Process API response
  - `handleError(error)`: Process and format errors

## Gemini Models Configuration

### Available Gemini Models
```javascript
const GEMINI_MODELS = {
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
    id: 'gemini-2.5-flash-lite-preview',
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

// Helper function to get models by category
const getModelsByCategory = (category) => {
  return Object.values(GEMINI_MODELS).filter(model => model.category === category);
};

// Helper function to get models by generation
const getModelsByGeneration = (generation) => {
  return Object.values(GEMINI_MODELS).filter(model => model.generation === generation);
};

// Helper function to get models with specific features
const getModelsByFeature = (feature) => {
  return Object.values(GEMINI_MODELS).filter(model => 
    model.features && model.features.includes(feature)
  );
};

// Model categories for easy filtering
const MODEL_CATEGORIES = {
  FLAGSHIP: 'flagship',      // Most advanced models
  BALANCED: 'balanced',      // Good balance of speed and capability
  FAST: 'fast',             // Speed-optimized models
  LITE: 'lite',             // Cost-effective models
  PRO: 'pro',               // Professional/advanced models
  SPECIALIZED: 'specialized', // Task-specific models
  LIVE: 'live',             // Real-time interaction models
  EXPERIMENTAL: 'experimental', // Experimental/preview models
  LEGACY: 'legacy'          // Older models for compatibility
};

// Default model selections for each column
const DEFAULT_MODEL_SELECTION = {
  column1: 'gemini-2.5-pro',
  column2: 'gemini-2.5-flash',
  column3: 'gemini-2.0-flash'
};
```

## State Management

### App State Structure
```javascript
const [appState, setAppState] = useState({
  selectedModels: {
    column1: 'gemini-2.5-pro',        // Most advanced thinking model
    column2: 'gemini-2.5-flash',      // Best price-performance
    column3: 'gemini-2.0-flash'       // Fast and reliable
  },
  responses: {
    column1: null,
    column2: null,
    column3: null
  },
  loading: {
    column1: false,
    column2: false,
    column3: false
  },
  errors: {
    column1: null,
    column2: null,
    column3: null
  },
  currentPrompt: '',
  modelCategories: MODEL_CATEGORIES,
  availableModels: GEMINI_MODELS
});
```

## API Integration

### Request Flow
1. User enters prompt and presses Enter
2. App validates input and sets loading states
3. GeminiService creates requests for each selected model
4. Parallel API calls are made to Gemini API
5. Responses are processed and formatted
6. Results are displayed in respective columns
7. Loading states are cleared

### Error Handling
- Network errors
- API rate limiting
- Invalid API keys
- Model-specific errors
- Timeout handling

## File Structure
```
src/
├── components/
│   ├── App.js
│   ├── Column.js
│   ├── ModelSelector.js
│   ├── PromptInput.js
│   └── ResponseDisplay.js
├── services/
│   └── GeminiService.js
├── config/
│   └── geminiModels.js
├── styles/
│   ├── App.css
│   ├── Column.css
│   └── components.css
├── utils/
│   └── formatters.js
└── hooks/
    └── useGeminiAPI.js
```

## Environment Configuration

### .env File
```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

### Environment Variables Usage
- API key authentication
- Base URL configuration
- Development vs production settings

## UI/UX Considerations

### Layout
- Three equal-width columns
- Responsive design for different screen sizes
- Fixed bottom prompt input area
- Scrollable response areas

### User Experience
- Real-time loading indicators
- Error messages with retry options
- Clear model identification
- Keyboard shortcuts (Enter to submit)
- Auto-scroll to new responses

### Styling
- Clean, modern interface
- Consistent color scheme
- Loading animations
- Responsive typography
- Accessibility considerations

## Development Phases

### Phase 1: Basic Structure
- Set up React app
- Create component structure
- Implement basic layout
- Add model selection dropdowns

### Phase 2: API Integration
- Implement GeminiService
- Add environment configuration
- Create API request/response handling
- Add error handling

### Phase 3: UI Polish
- Add styling and animations
- Implement responsive design
- Add loading states
- Improve error displays

### Phase 4: Testing & Optimization
- Add unit tests
- Performance optimization
- Error handling improvements
- User experience enhancements

## Technical Considerations

### Performance
- Debounced API calls
- Response caching (optional)
- Lazy loading for large responses
- Memory management

### Security
- API key protection
- Input sanitization
- Rate limiting awareness
- CORS handling

### Scalability
- Modular component design
- Easy model addition
- Configurable column count
- Extensible service layer

## Dependencies

### Core Dependencies
- React 18+
- React Hooks
- CSS Modules or Styled Components

### Development Dependencies
- Create React App or Vite
- ESLint
- Prettier
- Testing utilities

## Future Enhancements

### Potential Features
- Response comparison tools
- Export functionality
- Response history
- Model performance metrics
- Custom model parameters
- Batch prompt testing

This architecture provides a solid foundation for building a comprehensive Gemini testing application that can be easily extended and maintained. 