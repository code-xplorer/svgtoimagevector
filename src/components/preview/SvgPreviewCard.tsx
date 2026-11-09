import React from 'react';
import { VectorDocument } from '../../types/vector';
import { PreviewBackground } from '../../hooks/useConverterState';

interface SvgPreviewCardProps {
  document: VectorDocument;
  rawSvg: string;
  previewBg: PreviewBackground;
  onSetPreviewBg: (bg: PreviewBackground) => void;
}

export const SvgPreviewCard: React.FC<SvgPreviewCardProps> = ({
  document: doc,
  rawSvg,
  previewBg,
  onSetPreviewBg,
}) => {
  const { width, height, nodes } = doc;

  const hasEvenOdd = nodes.some((n) => n.fillRule === 'evenodd');

  // Background styling classes / styles
  const getBgStyle = (): React.CSSProperties => {
    switch (previewBg) {
      case 'checkerboard':
        return {
          backgroundColor: '#FFFFFF',
          backgroundImage:
            'linear-gradient(45deg, #E0E0E0 25%, transparent 25%), linear-gradient(-45deg, #E0E0E0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E0E0E0 75%), linear-gradient(-45deg, transparent 75%, #E0E0E0 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        };
      case 'dark':
        return {
          backgroundColor: '#1E1E24',
          backgroundImage: 'none',
        };
      case 'light':
        return {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        };
      case 'grid':
        return {
          backgroundColor: '#F5F5F7',
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        };
    }
  };

  return (
    <section className="preview-card" aria-label="Vector Preview">
      {/* Header bar */}
      <div className="preview-card-header">
        <div className="preview-title-group">
          <h2 className="preview-title">Vector Preview</h2>
          <span
            className="preview-dim-pill"
            aria-label={`Vector dimensions: ${width} by ${height} dp`}
          >
            {width} × {height} dp
          </span>
        </div>

        {/* Controls: Accessible Background switch */}
        <div className="preview-actions">
          <div
            className="preview-bg-selector"
            role="radiogroup"
            aria-label="Preview background style"
          >
            <button
              type="button"
              role="radio"
              aria-checked={previewBg === 'checkerboard'}
              className={`bg-opt-btn ${previewBg === 'checkerboard' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('checkerboard')}
              aria-label="Checkerboard transparent background"
              title="Checkerboard (Transparency)"
            >
              <span aria-hidden="true">🏁</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={previewBg === 'light'}
              className={`bg-opt-btn ${previewBg === 'light' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('light')}
              aria-label="Light solid background"
              title="Light Background"
            >
              <span aria-hidden="true">⚪</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={previewBg === 'dark'}
              className={`bg-opt-btn ${previewBg === 'dark' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('dark')}
              aria-label="Dark solid background"
              title="Dark Background"
            >
              <span aria-hidden="true">⚫</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={previewBg === 'grid'}
              className={`bg-opt-btn ${previewBg === 'grid' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('grid')}
              aria-label="Dot grid pattern background"
              title="Grid Pattern"
            >
              <span aria-hidden="true">⊞</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main visual viewport */}
      <div
        className="preview-viewport"
        style={getBgStyle()}
        role="region"
        aria-label="SVG graphic display viewport"
      >
        <div
          className="preview-scaler"
          role="img"
          aria-label={`Rendered vector graphic for ${doc.name || 'imported vector'}`}
          dangerouslySetInnerHTML={{ __html: rawSvg }}
        />
      </div>

      {/* Footer metadata info chips (Fill Rules if present) */}
      {hasEvenOdd && (
        <div className="preview-card-footer" role="status">
          <div className="meta-chip info" title="Path fill type">
            <span>EvenOdd Fill</span>
          </div>
        </div>
      )}
    </section>
  );
};
