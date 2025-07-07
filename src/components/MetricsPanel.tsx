import React, { useState } from 'react';
import type { PerformanceMetrics, QualityMetrics, TechnicalMetadata } from '../types/gemini';

interface MetricsPanelProps {
  performanceMetrics: PerformanceMetrics;
  qualityMetrics: QualityMetrics;
  technicalMetadata: TechnicalMetadata;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({
  performanceMetrics,
  qualityMetrics,
  technicalMetadata
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    performance: false,
    quality: false,
    technical: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatTime = (ms: number): string => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };



  return (
    <div className="metrics-panel">
      {/* Performance Metrics */}
      <div className="metrics-section">
        <button 
          className="metrics-section-header"
          onClick={() => toggleSection('performance')}
        >
          Performance {expandedSections.performance ? '−' : '+'}
        </button>
        {expandedSections.performance && (
          <div className="metrics-content">
            <div className="metric-line">Response Time: {formatTime(performanceMetrics.responseTime)}</div>
            <div className="metric-line">Tokens: {performanceMetrics.tokenUsage.input}→{performanceMetrics.tokenUsage.output} ({performanceMetrics.tokenUsage.total})</div>
            <div className="metric-line">Throughput: {performanceMetrics.throughput.toFixed(1)} tok/sec</div>
          </div>
        )}
      </div>

      {/* Quality Metrics */}
      <div className="metrics-section">
        <button 
          className="metrics-section-header"
          onClick={() => toggleSection('quality')}
        >
          Quality {expandedSections.quality ? '−' : '+'}
        </button>
        {expandedSections.quality && (
          <div className="metrics-content">
            <div className="metric-line">Length: {qualityMetrics.responseLength.characters} chars, {qualityMetrics.responseLength.words} words</div>
            <div className="metric-line">Reading Level: {qualityMetrics.estimatedReadingLevel}</div>
            <div className="metric-line">Safety: {qualityMetrics.safetyScore}</div>
            <div className="metric-line">Categories: {qualityMetrics.contentCategories.join(', ')}</div>
            <div className="metric-line">Language: {qualityMetrics.languageDetected}</div>
          </div>
        )}
      </div>

      {/* Technical Metadata */}
      <div className="metrics-section">
        <button 
          className="metrics-section-header"
          onClick={() => toggleSection('technical')}
        >
          Technical {expandedSections.technical ? '−' : '+'}
        </button>
        {expandedSections.technical && (
          <div className="metrics-content">
            <div className="metric-line">Model: {technicalMetadata.modelVersion}</div>
            <div className="metric-line">Config: T={technicalMetadata.requestConfig.temperature}, K={technicalMetadata.requestConfig.topK}, P={technicalMetadata.requestConfig.topP}</div>
            <div className="metric-line">Max Tokens: {technicalMetadata.requestConfig.maxOutputTokens}</div>
            <div className="metric-line">Finish: {qualityMetrics.finishReason}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsPanel; 