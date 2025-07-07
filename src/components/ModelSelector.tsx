import type { ModelSelectorProps } from '../types/gemini';

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onChange,
  disabled,
  availableModels,
  columnId,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  // Group models by generation for better organization
  const modelsByGeneration = Object.values(availableModels).reduce((acc, model) => {
    if (!acc[model.generation]) {
      acc[model.generation] = [];
    }
    acc[model.generation].push(model);
    return acc;
  }, {} as Record<string, typeof availableModels[string][]>);

  // Sort generations (newest first)
  const sortedGenerations = Object.keys(modelsByGeneration).sort((a, b) => {
    if (a === 'embedding') return 1;
    if (b === 'embedding') return -1;
    return parseFloat(b) - parseFloat(a);
  });

  return (
    <div className="model-selector">
      <select
        id={`model-select-${columnId}`}
        value={selectedModel}
        onChange={handleChange}
        disabled={disabled}
        className="model-selector-dropdown"
      >
        {sortedGenerations.map((generation) => (
          <optgroup key={generation} label={`Gemini ${generation}`}>
            {modelsByGeneration[generation]
              .sort((a, b) => {
                // Sort by category priority: flagship > pro > balanced > fast > lite > specialized > experimental > legacy
                const categoryOrder = {
                  flagship: 1,
                  pro: 2,
                  balanced: 3,
                  fast: 4,
                  lite: 5,
                  specialized: 6,
                  live: 7,
                  experimental: 8,
                  legacy: 9,
                };
                return (categoryOrder[a.category] || 10) - (categoryOrder[b.category] || 10);
              })
              .map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.category !== 'balanced' && `(${model.category})`}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector; 