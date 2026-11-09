import React, { useState, useRef } from 'react';
import { parseSvgDocument } from '../../core/parser/svgParser';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';

interface SvgUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSvg: (svgText: string, name: string) => void;
}

export const SvgUploadModal: React.FC<SvgUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSvg,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedSvg, setPastedSvg] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessSvg = (svgText: string, name = 'ImportedVector') => {
    try {
      setErrorMessage(null);
      parseSvgDocument(svgText, name);
      onImportSvg(svgText, name);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse SVG. Please verify file content.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      handleProcessSvg(content, fileNameWithoutExt);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/svg+xml' || file.name.endsWith('.svg'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        handleProcessSvg(content, fileNameWithoutExt);
      };
      reader.readAsText(file);
    } else {
      setErrorMessage('Please drop a valid .svg file');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Upload & Import SVG</span>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Selector */}
          <div className="type-selector-tabs">
            <button
              type="button"
              className={`type-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload .svg File
            </button>
            <button
              type="button"
              className={`type-tab ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveTab('paste')}
            >
              Paste SVG Code
            </button>
          </div>

          {errorMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-error)', fontSize: '12px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div
              className={`dropzone ${isDragOver ? 'active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="dropzone-icon" />
              <div className="dropzone-text">
                <strong>Click to browse</strong> or drag & drop your SVG file here
              </div>
              <div className="dropzone-subtext">Supports paths, shapes, transforms, and gradients</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                rows={10}
                value={pastedSvg}
                onChange={(e) => setPastedSvg(e.target.value)}
                placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>&#10;  <path d='...' fill='#6750A4' />&#10;</svg>"
                style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', resize: 'vertical' }}
              />
              <button
                type="button"
                className="action-pill-btn"
                style={{ alignSelf: 'flex-end' }}
                disabled={!pastedSvg.trim()}
                onClick={() => handleProcessSvg(pastedSvg, 'PastedVector')}
              >
                <FileText size={14} />
                <span>Parse & Load</span>
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="action-pill-btn secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
