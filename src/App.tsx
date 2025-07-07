import { useState, useCallback, useEffect } from 'react';
import type { AppState, ColumnId } from './types/gemini';
import { GEMINI_MODELS, DEFAULT_MODEL_SELECTION } from './config/geminiModels';
import { MODEL_CATEGORIES } from './types/gemini';
import { GeminiService } from './services/GeminiService';
import Column from './components/Column';
import PromptInput from './components/PromptInput';
import './App.css';

function App() {
  const [appState, setAppState] = useState<AppState>({
    selectedModels: {
      column1: DEFAULT_MODEL_SELECTION.column1,
      column2: DEFAULT_MODEL_SELECTION.column2,
      column3: DEFAULT_MODEL_SELECTION.column3,
    },
    responses: {
      column1: null,
      column2: null,
      column3: null,
    },
    loading: {
      column1: false,
      column2: false,
      column3: false,
    },
    errors: {
      column1: null,
      column2: null,
      column3: null,
    },
    currentPrompt: '',
    modelCategories: MODEL_CATEGORIES,
    availableModels: GEMINI_MODELS,
  });

  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);

  // Initialize Gemini service
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const baseUrl = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

    if (apiKey) {
      const service = new GeminiService({ apiKey, baseUrl });
      setGeminiService(service);
    } else {
      console.warn('VITE_GEMINI_API_KEY not found in environment variables');
    }
  }, []);

  const handleModelChange = useCallback((columnId: ColumnId, modelId: string) => {
    setAppState(prev => ({
      ...prev,
      selectedModels: {
        ...prev.selectedModels,
        [columnId]: modelId,
      },
      errors: {
        ...prev.errors,
        [columnId]: null, // Clear any previous errors
      },
    }));
  }, []);

  const handlePromptChange = useCallback((prompt: string) => {
    setAppState(prev => ({
      ...prev,
      currentPrompt: prompt,
    }));
  }, []);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    if (!geminiService) {
      console.error('Gemini service not initialized');
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    // Set loading states
    setAppState(prev => ({
      ...prev,
      loading: {
        column1: true,
        column2: true,
        column3: true,
      },
      errors: {
        column1: null,
        column2: null,
        column3: null,
      },
    }));

    try {
      const batchResult = await geminiService.generateContentBatch(
        appState.selectedModels,
        prompt
      );

      setAppState(prev => ({
        ...prev,
        loading: {
          column1: false,
          column2: false,
          column3: false,
        },
        responses: {
          column1: batchResult.results.column1 ? {
            text: batchResult.results.column1.text,
            timestamp: batchResult.results.column1.timestamp,
            modelId: batchResult.results.column1.modelId,
            modelName: GEMINI_MODELS[batchResult.results.column1.modelId]?.name || batchResult.results.column1.modelId,
          } : null,
          column2: batchResult.results.column2 ? {
            text: batchResult.results.column2.text,
            timestamp: batchResult.results.column2.timestamp,
            modelId: batchResult.results.column2.modelId,
            modelName: GEMINI_MODELS[batchResult.results.column2.modelId]?.name || batchResult.results.column2.modelId,
          } : null,
          column3: batchResult.results.column3 ? {
            text: batchResult.results.column3.text,
            timestamp: batchResult.results.column3.timestamp,
            modelId: batchResult.results.column3.modelId,
            modelName: GEMINI_MODELS[batchResult.results.column3.modelId]?.name || batchResult.results.column3.modelId,
          } : null,
        },
        errors: {
          column1: batchResult.errors.column1 ? {
            message: batchResult.errors.column1.message,
            timestamp: Date.now(),
            modelId: appState.selectedModels.column1,
          } : null,
          column2: batchResult.errors.column2 ? {
            message: batchResult.errors.column2.message,
            timestamp: Date.now(),
            modelId: appState.selectedModels.column2,
          } : null,
          column3: batchResult.errors.column3 ? {
            message: batchResult.errors.column3.message,
            timestamp: Date.now(),
            modelId: appState.selectedModels.column3,
          } : null,
        },
      }));
    } catch (error) {
      console.error('Batch generation failed:', error);
      
      // Set error for all columns
      setAppState(prev => ({
        ...prev,
        loading: {
          column1: false,
          column2: false,
          column3: false,
        },
        errors: {
          column1: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: Date.now(),
            modelId: prev.selectedModels.column1,
          },
          column2: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: Date.now(),
            modelId: prev.selectedModels.column2,
          },
          column3: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: Date.now(),
            modelId: prev.selectedModels.column3,
          },
        },
      }));
    }
  }, [geminiService, appState.selectedModels]);

  const isAnyLoading = appState.loading.column1 || appState.loading.column2 || appState.loading.column3;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gemini Model Testing</h1>
        <p>Compare responses from multiple Gemini models side-by-side</p>
      </header>

      <main className="app-main">
        <div className="columns-container">
          <Column
            columnId="column1"
            selectedModel={appState.selectedModels.column1}
            onModelChange={handleModelChange}
            response={appState.responses.column1}
            isLoading={appState.loading.column1}
            error={appState.errors.column1}
            availableModels={appState.availableModels}
          />
          <Column
            columnId="column2"
            selectedModel={appState.selectedModels.column2}
            onModelChange={handleModelChange}
            response={appState.responses.column2}
            isLoading={appState.loading.column2}
            error={appState.errors.column2}
            availableModels={appState.availableModels}
          />
          <Column
            columnId="column3"
            selectedModel={appState.selectedModels.column3}
            onModelChange={handleModelChange}
            response={appState.responses.column3}
            isLoading={appState.loading.column3}
            error={appState.errors.column3}
            availableModels={appState.availableModels}
          />
        </div>

        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isAnyLoading}
          currentPrompt={appState.currentPrompt}
          onPromptChange={handlePromptChange}
        />
      </main>

      {!geminiService && (
        <div className="api-warning">
          ⚠️ Please set your VITE_GEMINI_API_KEY in the .env file to start testing models.
        </div>
      )}
    </div>
  );
}

export default App;
