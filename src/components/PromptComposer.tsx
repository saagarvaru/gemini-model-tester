import { useState, useRef, useCallback, useEffect } from 'react';
import type { PromptComposerProps } from '../types/gemini';
import TemplateManager from './TemplateManager';

const PromptComposer: React.FC<PromptComposerProps> = ({
  isVisible,
  content,
  templates,
  width,
  isLoading,
  onToggleVisibility,
  onContentChange,
  onSendToMainInput,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onClear,
  onWidthChange,
}) => {
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  
  // Sync local content with prop
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  }, [onContentChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to execute analysis
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSendToMainInput();
    }
    
    // Ctrl/Cmd + S to save as template
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      setShowTemplateManager(true);
    }
  }, [onSendToMainInput]);

  const handleSendToMainInput = useCallback(() => {
    onSendToMainInput();
    // Optional: Show a brief confirmation
    if (textareaRef.current) {
      textareaRef.current.style.border = '2px solid #4CAF50';
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.border = '';
        }
      }, 500);
    }
  }, [onSendToMainInput]);

  const handleClear = useCallback(() => {
    if (localContent.trim() && !window.confirm('Are you sure you want to clear the composer?')) {
      return;
    }
    setLocalContent('');
    onClear();
  }, [localContent, onClear]);



  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !composerRef.current) return;
    
    const rect = composerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const minWidth = 300;
    const maxWidth = 600;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      onWidthChange(newWidth);
    }
  }, [isResizing, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const getCharacterCount = () => {
    return localContent.length;
  };

  const getWordCount = () => {
    return localContent.trim() === '' ? 0 : localContent.trim().split(/\s+/).length;
  };

  const getLineCount = () => {
    return localContent.split('\n').length;
  };

  const estimateTokens = () => {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(localContent.length / 4);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={composerRef}
      className="prompt-composer" 
      style={{ width: `${width}px` }}
    >
      <div 
        ref={resizeRef}
        className="resize-handle" 
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
      
      <div className="prompt-composer-header">
        <h3 className="prompt-composer-title">Prompt Composer</h3>
        <div className="prompt-composer-controls">
          <button
            type="button"
            onClick={() => setShowTemplateManager(!showTemplateManager)}
            className="composer-button composer-button-secondary"
            title="Manage Templates"
          >
            <svg viewBox="0 0 24 24" className="button-icon">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={onToggleVisibility}
            className="composer-button composer-button-secondary"
            title="Close Composer"
          >
            <svg viewBox="0 0 24 24" className="button-icon">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {showTemplateManager && (
        <TemplateManager
          templates={templates}
          onLoadTemplate={onLoadTemplate}
          onDeleteTemplate={onDeleteTemplate}
          onSaveTemplate={onSaveTemplate}
          currentContent={localContent}
        />
      )}

      <div className="prompt-composer-body">
        <div className="prompt-editor">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Compose your prompt here...

Tips:
• Use Ctrl/Cmd + Enter to execute analysis
• Use Ctrl/Cmd + S to save as template
• Paste large prompts and edit them freely
• Drag the right edge to resize"
            className="prompt-composer-textarea"
            spellCheck={false}
          />
        </div>

        <div className="prompt-composer-footer">
          <div className="prompt-stats">
            <span className="stat-item">
              <span className="stat-label">Characters:</span>
              <span className="stat-value">{getCharacterCount().toLocaleString()}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Words:</span>
              <span className="stat-value">{getWordCount().toLocaleString()}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Lines:</span>
              <span className="stat-value">{getLineCount().toLocaleString()}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Est. Tokens:</span>
              <span className="stat-value">{estimateTokens().toLocaleString()}</span>
            </span>
          </div>

          <div className="prompt-actions">
            <button
              type="button"
              onClick={handleClear}
              className="composer-button composer-button-secondary"
              title="Clear composer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSendToMainInput}
              className="composer-button composer-button-primary"
              disabled={!localContent.trim() || isLoading}
              title="Execute analysis across all models (Ctrl/Cmd + Enter)"
            >
              {isLoading ? 'Analyzing...' : 'Execute Analysis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptComposer; 