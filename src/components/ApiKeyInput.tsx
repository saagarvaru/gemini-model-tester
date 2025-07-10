import { useState, useCallback } from 'react';
import { saveApiKey } from '../utils/promptStorage';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateApiKey = (key: string): boolean => {
    // Basic validation for Gemini API key format
    // Gemini API keys typically start with "AIza" and are around 39 characters
    return key.startsWith('AIza') && key.length >= 35;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    if (!validateApiKey(apiKey.trim())) {
      setError('Invalid API key format. Gemini API keys should start with "AIza" and be at least 35 characters long.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Save to localStorage
      saveApiKey(apiKey.trim());
      
      // Call parent handler
      onApiKeySubmit(apiKey.trim());
      
      // Clear the input
      setApiKey('');
    } catch (error) {
      setError('Failed to save API key. Please try again.');
      console.error('Error saving API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [apiKey, onApiKeySubmit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    if (error) {
      setError(null);
    }
  }, [error]);

  return (
    <div className="api-key-input">
      <div className="api-key-input-header">
        <h3>🔑 Enter Your Gemini API Key</h3>
        <p>
          To use the Gemini model testing interface, you'll need to provide your Google AI Studio API key.
          Your key will be saved locally in your browser for future visits.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="api-key-form">
        <div className="api-key-input-group">
          <input
            type="password"
            value={apiKey}
            onChange={handleInputChange}
            placeholder="AIza..."
            className={`api-key-input-field ${error ? 'error' : ''}`}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !apiKey.trim()}
            className="api-key-submit-button"
          >
            {isSubmitting ? 'Saving...' : 'Save API Key'}
          </button>
        </div>
        
        {error && (
          <div className="api-key-error">
            {error}
          </div>
        )}
      </form>
      
      <div className="api-key-help">
        <h4>How to get your API key:</h4>
        <ol>
          <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
          <li>Sign in with your Google account</li>
          <li>Click "Create API Key"</li>
          <li>Copy the key and paste it above</li>
        </ol>
        
        <div className="api-key-security-note">
          <strong>Security Note:</strong> Your API key is stored locally in your browser and is not shared with anyone. 
          You can clear it at any time by refreshing the page and not entering it again.
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput; 