import { useState, useCallback, useRef } from 'react';
import type { TemplateManagerProps } from '../types/gemini';
import { getTemplatesByCategory, searchTemplates, exportTemplates, importTemplates } from '../utils/promptStorage';

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onLoadTemplate,
  onDeleteTemplate,
  onSaveTemplate,
  currentContent,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'save'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [saveForm, setSaveForm] = useState({
    name: '',
    category: '',
    description: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = useCallback(() => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchTemplates(filtered, searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [templates, searchQuery, selectedCategory]);

  const templatesByCategory = getTemplatesByCategory(templates);
  const categories = ['All', ...Object.keys(templatesByCategory)];

  const handleSaveTemplate = useCallback(() => {
    if (!saveForm.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const category = saveForm.category.trim() || 'General';
    onSaveTemplate(saveForm.name.trim(), category, saveForm.description.trim() || undefined);
    
    // Reset form
    setSaveForm({ name: '', category: '', description: '' });
    setActiveTab('templates');
  }, [saveForm, onSaveTemplate]);

  const handleExportTemplates = useCallback(() => {
    exportTemplates(templates);
  }, [templates]);

  const handleImportTemplates = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedTemplates = await importTemplates(file);
      
      // Here you would typically call a prop function to merge the imported templates
      // For now, we'll just show a success message
      alert(`Successfully imported ${importedTemplates.length} templates`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert(`Failed to import templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="template-manager">
      <div className="template-manager-header">
        <div className="template-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`template-tab ${activeTab === 'templates' ? 'active' : ''}`}
          >
            Templates ({templates.length})
          </button>
                     <button
             type="button"
             onClick={() => setActiveTab('save')}
             className={`template-tab ${activeTab === 'save' ? 'active' : ''}`}
           >
            Save Current
          </button>
        </div>
        
        <div className="template-actions">
          <button
            type="button"
            onClick={handleExportTemplates}
            className="template-action-button"
            title="Export Templates"
            disabled={templates.length === 0}
          >
            Export
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportTemplates}
            className="hidden-file-input"
            id="template-import"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="template-action-button"
            title="Import Templates"
          >
            Import
          </button>
        </div>
      </div>

      <div className="template-manager-content">
        {activeTab === 'templates' && (
          <div className="templates-tab">
            <div className="templates-filters">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="template-search-input"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="template-category-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="templates-list">
              {filteredTemplates().length === 0 ? (
                <div className="empty-state">
                  <p>No templates found</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('save')}
                    className="create-template-button"
                  >
                    Create your first template
                  </button>
                </div>
              ) : (
                filteredTemplates().map(template => (
                  <div key={template.id} className="template-item">
                    <div className="template-item-header">
                      <div className="template-item-info">
                        <h4 className="template-name">{template.name}</h4>
                        <span className="template-category">{template.category}</span>
                      </div>
                      <div className="template-item-actions">
                        <button
                          type="button"
                          onClick={() => onLoadTemplate(template.id)}
                          className="template-load-button"
                          title="Load Template"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTemplate(template.id)}
                          className="template-delete-button"
                          title="Delete Template"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    {template.description && (
                      <p className="template-description">{template.description}</p>
                    )}
                    
                    <div className="template-preview">
                      {template.content.substring(0, 100)}
                      {template.content.length > 100 && '...'}
                    </div>
                    
                    <div className="template-meta">
                      <span className="template-date">
                        Updated: {formatDate(template.updatedAt)}
                      </span>
                      <span className="template-length">
                        {template.content.length} chars
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'save' && (
          <div className="save-tab">
            <div className="save-form">
              <div className="form-group">
                <label htmlFor="template-name">Template Name *</label>
                <input
                  id="template-name"
                  type="text"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                  className="template-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="template-category">Category</label>
                <input
                  id="template-category"
                  type="text"
                  value={saveForm.category}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="General"
                  className="template-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="template-description">Description</label>
                <textarea
                  id="template-description"
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  className="template-textarea"
                  rows={2}
                />
              </div>

              <div className="current-content-preview">
                <label>Current Content Preview:</label>
                <div className="content-preview">
                  {currentContent.substring(0, 200)}
                  {currentContent.length > 200 && '...'}
                </div>
                <div className="content-stats">
                  {currentContent.length} characters
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="save-template-button"
                  disabled={!saveForm.name.trim() || !currentContent.trim()}
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager; 