import React, { useState, useEffect, useRef } from 'react';
import { X, FileCode2, AlertCircle, ArrowRight } from 'lucide-react';
import { parseSvgDocument } from '../../core/parser/svgParser';

interface PasteSvgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSvg: (svgText: string, name?: string) => void;
}

export const PasteSvgModal: React.FC<PasteSvgModalProps> = ({
  isOpen,
  onClose,
  onLoadSvg,
}) => {
  const [svgContent, setSvgContent] = useState('');
  const [iconName, setIconName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management & Escape key handling (WCAG 2.1.2)
  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus first input on modal open
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConvert = () => {
    const trimmed = svgContent.trim();
    if (!trimmed) {
      setErrorMessage('Please paste SVG code before converting.');
      return;
    }

    try {
      setErrorMessage(null);
      const targetName = iconName.trim() || 'CustomVector';
      // Validate by parsing
      parseSvgDocument(trimmed, targetName);
      onLoadSvg(trimmed, targetName);
      onClose();
      setSvgContent('');
      setIconName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid SVG XML structure. Please check markup.');
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paste-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode2 size={18} color="var(--md-sys-color-primary)" aria-hidden="true" />
            <h2 id="paste-modal-title" className="modal-title">Paste SVG Code</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '12px' }}>
            Paste raw SVG XML markup below to instantly convert it into Jetpack Compose ImageVector Kotlin code.
          </p>

          <div style={{ marginBottom: '12px' }}>
            <label
              htmlFor="paste-icon-name-input"
              style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
            >
              Icon Identifier (optional)
            </label>
            <input
              ref={inputRef}
              id="paste-icon-name-input"
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="e.g. ShoppingCart, CheckBadge"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label
              htmlFor="paste-svg-content-textarea"
              style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
            >
              SVG XML Code
            </label>
            <textarea
              id="paste-svg-content-textarea"
              rows={8}
              value={svgContent}
              onChange={(e) => setSvgContent(e.target.value)}
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ...>\n  <path d="..." />\n</svg>'}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'var(--font-family-mono)',
                borderRadius: '6px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                color: 'var(--md-sys-color-on-surface)',
                resize: 'vertical',
              }}
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-error)', fontSize: '12px', marginTop: '8px' }}
            >
              <AlertCircle size={15} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="action-pill-btn secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="action-pill-btn primary"
            onClick={handleConvert}
          >
            <span>Convert to ImageVector</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
