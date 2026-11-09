import React, { useState } from 'react';
import { ImageVectorConfig } from '../../types/imagevector';
import { KotlinHighlighter } from './KotlinHighlighter';
import { Copy, Check, Download, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

interface ImageVectorPanelProps {
  config: ImageVectorConfig;
  activeTab: 'imagevector' | 'svg';
  currentCode: string;
  onUpdateConfig: (updates: Partial<ImageVectorConfig>) => void;
  onTabChange: (tab: 'imagevector' | 'svg') => void;
}

export const ImageVectorPanel: React.FC<ImageVectorPanelProps> = ({
  config,
  activeTab,
  currentCode,
  onUpdateConfig,
  onTabChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfigOptions, setShowConfigOptions] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownload = () => {
    const filename = activeTab === 'imagevector'
      ? `${config.name || 'ImageVector'}.kt`
      : `${config.name || 'vector'}.svg`;

    const mime = activeTab === 'imagevector' ? 'text/plain' : 'image/svg+xml';
    const blob = new Blob([currentCode], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="codegen-panel" aria-label="Jetpack Compose Code Generator">
      {/* Top Header with Tabs & Copy/Download Actions */}
      <div className="codegen-header">
        <div
          className="codegen-tabs"
          role="tablist"
          aria-label="Output code format"
        >
          <button
            type="button"
            role="tab"
            id="tab-imagevector"
            aria-selected={activeTab === 'imagevector'}
            aria-controls="panel-code-output"
            className={`codegen-tab-btn ${activeTab === 'imagevector' ? 'active' : ''}`}
            onClick={() => onTabChange('imagevector')}
          >
            <span>Compose ImageVector (.kt)</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-svg"
            aria-selected={activeTab === 'svg'}
            aria-controls="panel-code-output"
            className={`codegen-tab-btn ${activeTab === 'svg' ? 'active' : ''}`}
            onClick={() => onTabChange('svg')}
          >
            <span>Clean SVG (.svg)</span>
          </button>
        </div>

        <div className="codegen-actions">
          <button
            type="button"
            className="config-toggle-btn"
            onClick={() => setShowConfigOptions((prev) => !prev)}
            aria-expanded={showConfigOptions}
            aria-controls="codegen-config-toolbar"
            aria-label={showConfigOptions ? 'Collapse generator options' : 'Expand generator options'}
            title={showConfigOptions ? 'Collapse generator options' : 'Expand generator options'}
          >
            <Settings2 size={15} aria-hidden="true" />
            <span>Options</span>
            {showConfigOptions ? (
              <ChevronUp size={14} aria-hidden="true" />
            ) : (
              <ChevronDown size={14} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="action-pill-btn secondary"
            onClick={handleDownload}
            aria-label={activeTab === 'imagevector' ? 'Download Kotlin source file (.kt)' : 'Download SVG file (.svg)'}
            title={activeTab === 'imagevector' ? 'Download Kotlin source file' : 'Download SVG file'}
          >
            <Download size={14} aria-hidden="true" />
            <span>Download</span>
          </button>

          <button
            type="button"
            className={`action-pill-btn primary ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
            title={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
          >
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>

          {/* Screen reader live notification */}
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? 'Code successfully copied to clipboard' : ''}
          </span>
        </div>
      </div>

      {/* Expandable Configuration Toolbar */}
      {showConfigOptions && activeTab === 'imagevector' && (
        <div
          id="codegen-config-toolbar"
          className="codegen-config-bar"
          role="region"
          aria-label="Code generator settings"
        >
          <div className="config-field">
            <label htmlFor="config-icon-name" className="config-label">
              Icon Identifier
            </label>
            <input
              id="config-icon-name"
              type="text"
              className="config-input"
              value={config.name}
              onChange={(e) => onUpdateConfig({ name: e.target.value })}
              placeholder="IconName"
            />
          </div>

          <div className="config-field">
            <label htmlFor="config-package-name" className="config-label">
              Package Name
            </label>
            <input
              id="config-package-name"
              type="text"
              className="config-input"
              value={config.packageName}
              onChange={(e) => onUpdateConfig({ packageName: e.target.value })}
              placeholder="com.example.ui.icons"
            />
          </div>

          <div className="config-checkbox-group">
            <label htmlFor="config-generate-imports" className="config-checkbox-label">
              <input
                id="config-generate-imports"
                type="checkbox"
                checked={config.generateImports}
                onChange={(e) => onUpdateConfig({ generateImports: e.target.checked })}
              />
              <span>Generate Package & Imports</span>
            </label>
          </div>
        </div>
      )}

      {/* Code Display Area with Syntax Highlighting */}
      <div
        id="panel-code-output"
        className="codegen-body"
        role="tabpanel"
        aria-labelledby={activeTab === 'imagevector' ? 'tab-imagevector' : 'tab-svg'}
      >
        <KotlinHighlighter
          code={currentCode}
          language={activeTab === 'imagevector' ? 'kotlin' : 'xml'}
        />
      </div>
    </section>
  );
};
