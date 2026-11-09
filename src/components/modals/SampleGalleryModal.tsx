import React, { useEffect, useRef } from 'react';
import { SAMPLE_SVGS, SampleItem } from '../../assets/samples';
import { X, Sparkles } from 'lucide-react';

interface SampleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (svgText: string, name: string) => void;
}

export const SampleGalleryModal: React.FC<SampleGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management & Escape key handling (WCAG 2.1.2)
  useEffect(() => {
    if (!isOpen) return;

    firstButtonRef.current?.focus();

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

  const handleChooseSample = (sample: SampleItem) => {
    try {
      const targetName = sample.name.replace(/\s+/g, '');
      onSelectSample(sample.svg, targetName);
      onClose();
    } catch (err) {
      console.error('Error loading sample', err);
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
        aria-labelledby="gallery-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--md-sys-color-primary)" aria-hidden="true" />
            <h2 id="gallery-modal-title" className="modal-title">Sample Vector Gallery</h2>
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
          <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Choose a rich sample vector to test editing, path curves, gradients, and Jetpack Compose ImageVector generation.
          </p>

          <div
            className="samples-grid"
            role="group"
            aria-label="Sample vector options"
          >
            {SAMPLE_SVGS.map((item, index) => (
              <button
                type="button"
                key={item.id}
                ref={index === 0 ? firstButtonRef : undefined}
                className="sample-card"
                onClick={() => handleChooseSample(item)}
                aria-label={`Select sample ${item.name}: ${item.description}`}
              >
                <div
                  className="sample-preview"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: item.svg }}
                />
                <span className="sample-name">{item.name}</span>
                <span className="sample-desc">{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="action-pill-btn secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
