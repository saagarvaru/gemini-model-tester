import type { ColumnProps } from '../types/gemini';
import ModelSelector from './ModelSelector';
import ResponseDisplay from './ResponseDisplay';

const Column: React.FC<ColumnProps> = ({
  columnId,
  selectedModel,
  onModelChange,
  response,
  isLoading,
  error,
  availableModels
}) => {
  const handleModelChange = (modelId: string) => {
    onModelChange(columnId, modelId);
  };

  const modelName = availableModels[selectedModel]?.name || selectedModel;

  return (
    <div className="column">
      <div className="column-header">
        <ModelSelector
          selectedModel={selectedModel}
          onChange={handleModelChange}
          disabled={isLoading}
          availableModels={availableModels}
          columnId={columnId}
        />
      </div>
      
      <div className="column-content">
        <ResponseDisplay
          response={response}
          isLoading={isLoading}
          error={error}
          modelName={modelName}
        />
      </div>
    </div>
  );
};

export default Column; 