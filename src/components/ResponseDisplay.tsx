import type { ResponseDisplayProps } from '../types/gemini';

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  isLoading,
  error,
  modelName,
}) => {
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
        <div className="response-text">
          {response.text.split('\n').map((line, index) => (
            <p key={index}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>

      <div className="response-footer">
        <div className="response-stats">
          <span>Characters: {response.text.length}</span>
          <span>Words: {response.text.split(/\s+/).filter(word => word.length > 0).length}</span>
          <span>Response time: {formatResponseTime(response.responseTime)}</span>
          <span>Completed: {formatTimestamp(response.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default ResponseDisplay; 