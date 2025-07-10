import { useState, useCallback, useEffect } from 'react';
import type { AppState, ColumnId, EnhancedColumnResponse } from './types/gemini';
import { GEMINI_MODELS, DEFAULT_MODEL_SELECTION } from './config/geminiModels';
import { MODEL_CATEGORIES } from './types/gemini';
import { GeminiService } from './services/GeminiService';
import Column from './components/Column';
import PromptComposer from './components/PromptComposer';
import ApiKeyInput from './components/ApiKeyInput';
import { 
  loadTemplates, 
  addTemplate, 
  deleteTemplate, 
  loadHistory, 
  addToHistory, 
  loadComposerState, 
  saveComposerState,
  loadApiKey,
  saveApiKey,
  clearApiKey
} from './utils/promptStorage';
import './App.css';
import './styles/markdown.css';

function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    const composerState = loadComposerState();
    return {
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
      promptComposer: {
        content: composerState.content,
        isVisible: composerState.isVisible,
        width: composerState.width,
        templates: loadTemplates(),
        history: loadHistory(),
        selectedTemplateId: null,
      },
    };
  });

  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);

  // Initialize Gemini service
  useEffect(() => {
    const initializeGeminiService = () => {
      // Check localStorage first, then fall back to environment variables
      const storedApiKey = loadApiKey();
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Check for valid (non-empty) API keys
      const validStoredKey = storedApiKey && storedApiKey.trim() !== '';
      const validEnvKey = envApiKey && envApiKey.trim() !== '';
      
      const apiKey = validStoredKey ? storedApiKey : (validEnvKey ? envApiKey : null);
      const baseUrl = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

      if (apiKey) {
        try {
          const service = new GeminiService({ apiKey, baseUrl });
          setGeminiService(service);
          console.log('Gemini service initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Gemini service:', error);
          setGeminiService(null);
        }
      } else {
        console.warn('No valid API key found in localStorage or environment variables');
        setGeminiService(null);
      }
    };

    initializeGeminiService();
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



  const isAnyLoading = appState.loading.column1 || appState.loading.column2 || appState.loading.column3;

  // Prompt Composer handlers
  const handleComposerToggle = useCallback(() => {
    setAppState(prev => {
      const newState = {
        ...prev,
        promptComposer: {
          ...prev.promptComposer,
          isVisible: !prev.promptComposer.isVisible,
        },
      };
      
      saveComposerState({
        content: newState.promptComposer.content,
        isVisible: newState.promptComposer.isVisible,
        width: newState.promptComposer.width,
      });
      
      return newState;
    });
  }, []);

  const handleComposerContentChange = useCallback((content: string) => {
    setAppState(prev => {
      const newState = {
        ...prev,
        promptComposer: {
          ...prev.promptComposer,
          content,
        },
      };
      
      saveComposerState({
        content: newState.promptComposer.content,
        isVisible: newState.promptComposer.isVisible,
        width: newState.promptComposer.width,
      });
      
      return newState;
    });
  }, []);

  const handleComposerSendToMainInput = useCallback(async () => {
    const prompt = appState.promptComposer.content;
    
    if (!geminiService) {
      console.error('Gemini service not initialized');
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    // Add to history
    addToHistory(prompt);

    // Set current prompt and loading states
    setAppState(prev => ({
      ...prev,
      currentPrompt: prompt,
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
      responses: {
        column1: null,
        column2: null,
        column3: null,
      },
    }));

    // Process each model individually and update UI as results come in
    const columnIds: ColumnId[] = ['column1', 'column2', 'column3'];
    
    columnIds.forEach(async (columnId) => {
      const modelId = appState.selectedModels[columnId];
      
      try {
        const result = await geminiService.generateContent(modelId, prompt);
        
        // Update state immediately when this model completes
        setAppState(prev => ({
          ...prev,
          loading: {
            ...prev.loading,
            [columnId]: false,
          },
          responses: {
            ...prev.responses,
            [columnId]: {
              text: result.text,
              timestamp: result.timestamp,
              modelId: result.modelId,
              modelName: GEMINI_MODELS[result.modelId]?.name || result.modelId,
              startTime: result.startTime,
              endTime: result.endTime,
              responseTime: result.responseTime,
              performanceMetrics: result.performanceMetrics,
              qualityMetrics: result.qualityMetrics,
              technicalMetadata: result.technicalMetadata,
            },
          },
        }));
      } catch (error) {
        console.error(`Error generating content for ${columnId}:`, error);
        
        // Update state with error for this specific column
        setAppState(prev => ({
          ...prev,
          loading: {
            ...prev.loading,
            [columnId]: false,
          },
          errors: {
            ...prev.errors,
            [columnId]: {
              message: error instanceof Error ? error.message : 'Unknown error occurred',
              timestamp: Date.now(),
              modelId,
            },
          },
        }));
      }
    });
  }, [geminiService, appState.selectedModels, appState.promptComposer.content]);

  const handleComposerSaveTemplate = useCallback((name: string, category: string, description?: string) => {
    const newTemplate = addTemplate({
      name,
      category,
      content: appState.promptComposer.content,
      description,
    });
    
    setAppState(prev => ({
      ...prev,
      promptComposer: {
        ...prev.promptComposer,
        templates: [...prev.promptComposer.templates, newTemplate],
      },
    }));
  }, [appState.promptComposer.content]);

  const handleComposerLoadTemplate = useCallback((templateId: string) => {
    const template = appState.promptComposer.templates.find(t => t.id === templateId);
    if (template) {
      setAppState(prev => ({
        ...prev,
        promptComposer: {
          ...prev.promptComposer,
          content: template.content,
          selectedTemplateId: templateId,
        },
      }));
    }
  }, [appState.promptComposer.templates]);

  const handleComposerDeleteTemplate = useCallback((templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
      setAppState(prev => ({
        ...prev,
        promptComposer: {
          ...prev.promptComposer,
          templates: prev.promptComposer.templates.filter(t => t.id !== templateId),
          selectedTemplateId: prev.promptComposer.selectedTemplateId === templateId ? null : prev.promptComposer.selectedTemplateId,
        },
      }));
    }
  }, []);

  const handleComposerClear = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      promptComposer: {
        ...prev.promptComposer,
        content: '',
        selectedTemplateId: null,
      },
    }));
  }, []);

  const handleComposerWidthChange = useCallback((width: number) => {
    setAppState(prev => {
      const newState = {
        ...prev,
        promptComposer: {
          ...prev.promptComposer,
          width,
        },
      };
      
      // Persist the width
      saveComposerState({
        content: newState.promptComposer.content,
        isVisible: newState.promptComposer.isVisible,
        width: newState.promptComposer.width,
      });
      
      return newState;
    });
  }, []);

  const handleApiKeySubmit = useCallback((apiKey: string) => {
    try {
      // Save to localStorage
      saveApiKey(apiKey);
      
      // Initialize Gemini service with the new API key
      const baseUrl = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
      const service = new GeminiService({ apiKey, baseUrl });
      setGeminiService(service);
      
      console.log('API key saved and Gemini service initialized');
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      alert('Failed to initialize Gemini service. Please check your API key.');
    }
  }, []);

  const handleClearApiKey = useCallback(() => {
    if (confirm('Are you sure you want to clear your saved API key? You will need to enter it again.')) {
      clearApiKey();
      setGeminiService(null);
      console.log('API key cleared');
    }
  }, []);

  const handleExport = useCallback(() => {
    // Check if we have any responses to export
    const hasResponses = appState.responses.column1 || appState.responses.column2 || appState.responses.column3;
    
    if (!hasResponses || !appState.currentPrompt.trim()) {
      alert('Please submit a prompt and get responses before exporting.');
      return;
    }

    // Calculate summary statistics
    const responses = Object.values(appState.responses).filter(r => r !== null) as EnhancedColumnResponse[];
    const totalCost = responses.reduce((sum, r) => sum + r.performanceMetrics.estimatedCost, 0);
    const averageResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    
    // Find comparison metrics
    const sortedBySpeed = responses.sort((a, b) => a.responseTime - b.responseTime);
    const sortedByCost = responses.sort((a, b) => a.performanceMetrics.estimatedCost - b.performanceMetrics.estimatedCost);
    const sortedByLength = responses.sort((a, b) => b.qualityMetrics.responseLength.characters - a.qualityMetrics.responseLength.characters);
    const safestResponses = responses.filter(r => r.qualityMetrics.safetyScore === 'Safe');

    const exportData = {
      session: {
        timestamp: new Date().toISOString(),
        prompt: appState.currentPrompt,
        models_tested: Object.values(appState.selectedModels),
        total_responses: responses.length,
        total_cost: totalCost,
        average_response_time: averageResponseTime,
      },
      responses: {
        column1: appState.responses.column1 ? {
          response: appState.responses.column1.text,
          performance_metrics: appState.responses.column1.performanceMetrics,
          quality_metrics: appState.responses.column1.qualityMetrics,
          technical_metadata: appState.responses.column1.technicalMetadata,
        } : null,
        column2: appState.responses.column2 ? {
          response: appState.responses.column2.text,
          performance_metrics: appState.responses.column2.performanceMetrics,
          quality_metrics: appState.responses.column2.qualityMetrics,
          technical_metadata: appState.responses.column2.technicalMetadata,
        } : null,
        column3: appState.responses.column3 ? {
          response: appState.responses.column3.text,
          performance_metrics: appState.responses.column3.performanceMetrics,
          quality_metrics: appState.responses.column3.qualityMetrics,
          technical_metadata: appState.responses.column3.technicalMetadata,
        } : null,
      },
      comparison: {
        fastest_model: sortedBySpeed[0]?.modelName || 'N/A',
        slowest_model: sortedBySpeed[sortedBySpeed.length - 1]?.modelName || 'N/A',
        most_cost_effective: sortedByCost[0]?.modelName || 'N/A',
        longest_response: sortedByLength[0]?.modelName || 'N/A',
        best_safety_score: safestResponses[0]?.modelName || 'N/A',
      },
    };

    // Create and download the file
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-comparison-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [appState.responses, appState.currentPrompt, appState.selectedModels]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Gemini Model Testing</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`composer-toggle-button ${appState.promptComposer.isVisible ? 'active' : ''}`}
            onClick={handleComposerToggle}
          >
            <svg viewBox="0 0 24 24" className="button-icon">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5zM12 14h-1v6h1v-6zM12 10h-1v2h1v-2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {appState.promptComposer.isVisible ? 'Hide Composer' : 'Show Composer'}
          </button>
          <button 
            className="export-button nav-style"
            onClick={handleExport}
            disabled={isAnyLoading || !appState.currentPrompt.trim() || !(appState.responses.column1 || appState.responses.column2 || appState.responses.column3)}
          >
            Export Results
          </button>
          {geminiService && (
            <button 
              className="export-button nav-style"
              onClick={handleClearApiKey}
              style={{ background: '#dc3545' }}
            >
              Clear API Key
            </button>
          )}
        </div>
      </header>
      
      <div className="app-container">
        <PromptComposer
          isVisible={appState.promptComposer.isVisible}
          content={appState.promptComposer.content}
          templates={appState.promptComposer.templates}
          width={appState.promptComposer.width}
          isLoading={isAnyLoading}
          onToggleVisibility={handleComposerToggle}
          onContentChange={handleComposerContentChange}
          onSendToMainInput={handleComposerSendToMainInput}
          onSaveTemplate={handleComposerSaveTemplate}
          onLoadTemplate={handleComposerLoadTemplate}
          onDeleteTemplate={handleComposerDeleteTemplate}
          onClear={handleComposerClear}
          onWidthChange={handleComposerWidthChange}
        />

        <main className="app-main-with-composer">
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
        </main>
      </div>

      {!geminiService && (
        <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
      )}
    </div>
  );
}

export default App;
