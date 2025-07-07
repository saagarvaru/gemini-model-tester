import { useState, useRef, useCallback, useEffect } from 'react';
import type { PromptInputProps } from '../types/gemini';

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  currentPrompt,
  onPromptChange,
}) => {
  const [localPrompt, setLocalPrompt] = useState(currentPrompt || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local state with currentPrompt prop
  useEffect(() => {
    if (currentPrompt !== localPrompt) {
      setLocalPrompt(currentPrompt || '');
      
      // Auto-resize textarea when content changes
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }
  }, [currentPrompt, localPrompt]);

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
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [onPromptChange]);

  return (
    <div className="prompt-input">
      <div className="prompt-container">
        <div className="prompt-input-wrapper">
          <textarea
            ref={textareaRef}
            value={localPrompt}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter a prompt for Gemini"
            className="prompt-textarea"
            disabled={isLoading}
            rows={1}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !localPrompt.trim()}
            className="send-button"
            title="Send message"
          >
            {isLoading ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <svg viewBox="0 0 24 24" className="send-icon">
                <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        
        {localPrompt.length > 0 && (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptInput; 