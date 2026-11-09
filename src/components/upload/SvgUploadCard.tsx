import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode2, Sparkles, AlertCircle } from 'lucide-react';

interface SvgUploadCardProps {
  onLoadSvg: (svgText: string, name?: string) => void;
  onOpenPasteModal: () => void;
  onOpenSampleModal: () => void;
}

export const SvgUploadCard: React.FC<SvgUploadCardProps> = ({
  onLoadSvg,
  onOpenPasteModal,
  onOpenSampleModal,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      setErrorMessage('Please select a valid .svg vector file.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      onLoadSvg(content, fileNameWithoutExt);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
    };
    reader.readAsText(file);

    // Reset input so re-uploading the same file still triggers onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg'))) {
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        onLoadSvg(content, fileNameWithoutExt);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read dropped file.');
      };
      reader.readAsText(file);
    } else {
      setErrorMessage('Please drop an SVG file (.svg)');
    }
  };

  return (
    <section className="upload-card" aria-label="Upload SVG Section">
      <h2 className="sr-only">Upload SVG</h2>

      <input
        ref={fileInputRef}
        type="file"
        id="svg-file-upload-input"
        accept=".svg,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Upload SVG file from your computer"
      />

      {/* Accessible Keyboard & Drag Drop zone area */}
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload SVG: click to choose file or drag and drop SVG here"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="drop-zone-icon-circle" aria-hidden="true">
          <UploadCloud size={24} color="var(--md-sys-color-primary)" />
        </div>

        <div className="drop-zone-text">
          <span className="drop-title">
            <strong>Click to browse</strong> or drag & drop SVG file
          </span>
          <span className="drop-subtitle">Supports paths, shapes, linear & radial gradients</span>
        </div>
      </div>

      {errorMessage && (
        <div className="upload-error-banner" role="alert" aria-live="assertive">
          <AlertCircle size={15} aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="upload-quick-bar" role="toolbar" aria-label="Upload options">
        <button
          type="button"
          className="quick-action-btn"
          onClick={onOpenPasteModal}
          aria-label="Paste SVG XML markup from clipboard"
          title="Paste raw SVG XML markup"
        >
          <FileCode2 size={14} aria-hidden="true" />
          <span>Paste SVG XML</span>
        </button>

        <button
          type="button"
          className="quick-action-btn"
          onClick={onOpenSampleModal}
          aria-label="Browse and select from sample vectors"
          title="Open full sample gallery"
        >
          <Sparkles size={14} aria-hidden="true" />
          <span>Sample Gallery</span>
        </button>
      </div>
    </section>
  );
};
