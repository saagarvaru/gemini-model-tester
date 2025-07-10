import type { PromptTemplate } from '../types/gemini';

const STORAGE_KEYS = {
  TEMPLATES: 'gemini-prompt-templates',
  HISTORY: 'gemini-prompt-history',
  COMPOSER_STATE: 'gemini-composer-state',
  API_KEY: 'gemini-api-key',
};

// API Key Management
export const saveApiKey = (apiKey: string): void => {
  try {
    // Only save if the API key is not empty
    if (apiKey && apiKey.trim() !== '') {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
    } else {
      console.warn('Cannot save empty API key');
    }
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
};

export const loadApiKey = (): string | null => {
  try {
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    // Return null if the key is empty or only whitespace
    return apiKey && apiKey.trim() !== '' ? apiKey : null;
  } catch (error) {
    console.error('Failed to load API key:', error);
    return null;
  }
};

export const clearApiKey = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  } catch (error) {
    console.error('Failed to clear API key:', error);
  }
};

// Template Management
export const saveTemplates = (templates: PromptTemplate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save templates:', error);
  }
};

export const loadTemplates = (): PromptTemplate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load templates:', error);
    return [];
  }
};

export const addTemplate = (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate => {
  const newTemplate: PromptTemplate = {
    ...template,
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const templates = loadTemplates();
  templates.push(newTemplate);
  saveTemplates(templates);
  
  return newTemplate;
};

export const updateTemplate = (templateId: string, updates: Partial<PromptTemplate>): void => {
  const templates = loadTemplates();
  const index = templates.findIndex(t => t.id === templateId);
  
  if (index !== -1) {
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: Date.now(),
    };
    saveTemplates(templates);
  }
};

export const deleteTemplate = (templateId: string): void => {
  const templates = loadTemplates();
  const filtered = templates.filter(t => t.id !== templateId);
  saveTemplates(filtered);
};

// History Management
export const saveHistory = (history: string[]): void => {
  try {
    // Keep only last 50 entries
    const limitedHistory = history.slice(-50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

export const loadHistory = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export const addToHistory = (prompt: string): void => {
  if (!prompt.trim()) return;
  
  const history = loadHistory();
  
  // Remove if already exists to avoid duplicates
  const filtered = history.filter(p => p !== prompt);
  
  // Add to beginning
  filtered.unshift(prompt);
  
  saveHistory(filtered);
};

// Composer State Management
export const saveComposerState = (state: { content: string; isVisible: boolean; width: number }): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPOSER_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save composer state:', error);
  }
};

export const loadComposerState = (): { content: string; isVisible: boolean; width: number } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPOSER_STATE);
    return stored ? JSON.parse(stored) : { content: '', isVisible: false, width: 350 };
  } catch (error) {
    console.error('Failed to load composer state:', error);
    return { content: '', isVisible: false, width: 350 };
  }
};

// Utility functions
export const getTemplatesByCategory = (templates: PromptTemplate[]): Record<string, PromptTemplate[]> => {
  return templates.reduce((acc, template) => {
    const category = template.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, PromptTemplate[]>);
};

export const searchTemplates = (templates: PromptTemplate[], query: string): PromptTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return templates.filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.content.toLowerCase().includes(lowerQuery) ||
    template.description?.toLowerCase().includes(lowerQuery) ||
    template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const exportTemplates = (templates: PromptTemplate[]): void => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    templates,
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gemini-prompt-templates-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importTemplates = (file: File): Promise<PromptTemplate[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.templates && Array.isArray(data.templates)) {
          resolve(data.templates);
        } else {
          reject(new Error('Invalid template file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}; 