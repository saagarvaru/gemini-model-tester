import { useState, useRef, useCallback } from 'react';
import type { PromptInputProps } from '../types/gemini';

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  currentPrompt,
  onPromptChange,
}) => {
  const [localPrompt, setLocalPrompt] = useState(currentPrompt || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (localPrompt.trim() && !isLoading) {
      onSubmit(localPrompt.trim());
    }
  }, [localPrompt, isLoading, onSubmit]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setLocalPrompt(value);
    onPromptChange(value);
  }, [onPromptChange]);

  const handleClear = useCallback(() => {
    setLocalPrompt('');
    onPromptChange('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [onPromptChange]);

  // Auto-resize textarea
  const handleTextareaResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  return (
    <div className="prompt-input">
      <div className="prompt-container">
        <div className="prompt-header">
          <h3>Enter your prompt</h3>
          <div className="prompt-actions">
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading || !localPrompt.trim()}
              className="clear-button"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="prompt-input-area">
          <textarea
            ref={textareaRef}
            value={localPrompt}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaResize}
            placeholder="Enter your prompt here... (Press Enter to submit, Shift+Enter for new line)"
            className="prompt-textarea"
            disabled={isLoading}
            rows={3}
          />
          
          <div className="prompt-footer">
            <div className="prompt-stats">
              <span className="char-count">
                {localPrompt.length} characters
              </span>
              {localPrompt.length > 25000 && (
                <span className="warning">
                  ⚠️ Very long prompt (may be truncated)
                </span>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !localPrompt.trim()}
              className="submit-button"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Generating...
                </>
              ) : (
                'Submit to All Models'
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="prompt-instructions">
        <p>
          <strong>💡 Tips:</strong> 
          Enter your prompt and press Enter (or click Submit) to send it to all three selected models simultaneously.
          Use Shift+Enter to add new lines. Compare the responses to see how different models handle your query.
        </p>
      </div>
    </div>
  );
};

export default PromptInput; 