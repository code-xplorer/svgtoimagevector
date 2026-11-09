import React from 'react';
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--md-sys-color-primary)" />
            <span className="modal-title">Sample Vector Gallery</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Choose a rich sample vector to test editing, path curves, gradients, and Jetpack Compose ImageVector generation.
          </p>

          <div className="samples-grid">
            {SAMPLE_SVGS.map((item) => (
              <div
                key={item.id}
                className="sample-card"
                onClick={() => handleChooseSample(item)}
              >
                <div
                  className="sample-preview"
                  dangerouslySetInnerHTML={{ __html: item.svg }}
                />
                <span className="sample-name">{item.name}</span>
                <span className="sample-desc">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="action-pill-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
