import React, { useState } from 'react';
import type { ResponseDisplayProps } from '../types/gemini';
import MetricsPanel from './MetricsPanel';
import MarkdownRenderer from './MarkdownRenderer';

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  isLoading,
  error,
  modelName,
}) => {
  const [showMetrics, setShowMetrics] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatResponseTime = (responseTime: number) => {
    if (responseTime < 1000) {
      return `${responseTime}ms`;
    } else {
      return `${(responseTime / 1000).toFixed(1)}s`;
    }
  };

  if (isLoading) {
    return (
      <div className="response-display loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Generating response from {modelName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="response-display error">
        <div className="error-content">
          <h3>Error</h3>
          <p className="error-message">{error.message}</p>
          <div className="error-details">
            <span>Model: {modelName}</span>
            <span>Time: {formatTimestamp(error.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-display empty">
        <div className="empty-state">
          <p>Enter a prompt below to see the response from {modelName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="response-display success">
      <div className="response-content">
        <MarkdownRenderer content={response.text} />
        
        <div className="response-metadata">
          <div className="response-stats-inline">
            <span>{response.text.length} chars • {response.text.split(/\s+/).filter(word => word.length > 0).length} words • {formatResponseTime(response.responseTime)} • {formatTimestamp(response.timestamp)}</span>
            <button 
              className="metrics-toggle-inline"
              onClick={() => setShowMetrics(!showMetrics)}
              title="Toggle detailed metrics"
            >
              {showMetrics ? '− metrics' : '+ metrics'}
            </button>
          </div>
        </div>
      </div>

      {showMetrics && response.performanceMetrics && response.qualityMetrics && response.technicalMetadata && (
        <div className="metrics-container">
          <MetricsPanel
            performanceMetrics={response.performanceMetrics}
            qualityMetrics={response.qualityMetrics}
            technicalMetadata={response.technicalMetadata}
          />
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay; 