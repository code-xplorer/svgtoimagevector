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
    <div className="codegen-panel">
      {/* Top Header with Tabs & Copy/Download Actions */}
      <div className="codegen-header">
        <div className="codegen-tabs">
          <button
            type="button"
            className={`codegen-tab-btn ${activeTab === 'imagevector' ? 'active' : ''}`}
            onClick={() => onTabChange('imagevector')}
          >
            <span>Compose ImageVector (.kt)</span>
          </button>
          <button
            type="button"
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
            title="Toggle generator configuration"
          >
            <Settings2 size={15} />
            <span>Options</span>
            {showConfigOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            type="button"
            className="action-pill-btn secondary"
            onClick={handleDownload}
            title={activeTab === 'imagevector' ? 'Download Kotlin source file' : 'Download SVG file'}
          >
            <Download size={14} />
            <span>Download</span>
          </button>

          <button
            type="button"
            className={`action-pill-btn primary ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Configuration Toolbar */}
      {showConfigOptions && activeTab === 'imagevector' && (
        <div className="codegen-config-bar">
          <div className="config-field">
            <label className="config-label">Icon Identifier</label>
            <input
              type="text"
              className="config-input"
              value={config.name}
              onChange={(e) => onUpdateConfig({ name: e.target.value })}
              placeholder="IconName"
            />
          </div>

          <div className="config-field">
            <label className="config-label">Package Name</label>
            <input
              type="text"
              className="config-input"
              value={config.packageName}
              onChange={(e) => onUpdateConfig({ packageName: e.target.value })}
              placeholder="com.example.ui.icons"
            />
          </div>

          <div className="config-checkbox-group">
            <label className="config-checkbox-label">
              <input
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
      <div className="codegen-body">
        <KotlinHighlighter
          code={currentCode}
          language={activeTab === 'imagevector' ? 'kotlin' : 'xml'}
        />
      </div>
    </div>
  );
};
