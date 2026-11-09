import React from 'react';
import { VectorDocument } from '../../types/vector';
import { PreviewBackground } from '../../hooks/useConverterState';
import { Eye, Palette } from 'lucide-react';

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
  const { width, height, nodes, gradients } = doc;

  const gradientsCount = Object.keys(gradients).length;
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
    <div className="preview-card">
      {/* Header bar */}
      <div className="preview-card-header">
        <div className="preview-title-group">
          <Eye size={16} className="preview-icon-primary" />
          <span className="preview-title">Vector Preview</span>
          <span className="preview-dim-pill">
            {width} × {height} dp
          </span>
        </div>

        {/* Controls: Background switch only */}
        <div className="preview-actions">
          <div className="preview-bg-selector" title="Change preview background">
            <button
              type="button"
              className={`bg-opt-btn ${previewBg === 'checkerboard' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('checkerboard')}
              title="Checkerboard (Transparency)"
            >
              🏁
            </button>
            <button
              type="button"
              className={`bg-opt-btn ${previewBg === 'light' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('light')}
              title="Light Background"
            >
              ⚪
            </button>
            <button
              type="button"
              className={`bg-opt-btn ${previewBg === 'dark' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('dark')}
              title="Dark Background"
            >
              ⚫
            </button>
            <button
              type="button"
              className={`bg-opt-btn ${previewBg === 'grid' ? 'active' : ''}`}
              onClick={() => onSetPreviewBg('grid')}
              title="Grid Pattern"
            >
              ⊞
            </button>
          </div>
        </div>
      </div>

      {/* Main visual viewport */}
      <div className="preview-viewport" style={getBgStyle()}>
        <div
          className="preview-scaler"
          dangerouslySetInnerHTML={{ __html: rawSvg }}
        />
      </div>

      {/* Footer metadata info chips (Gradients & Fill Rules if present) */}
      {(gradientsCount > 0 || hasEvenOdd) && (
        <div className="preview-card-footer">
          {gradientsCount > 0 && (
            <div className="meta-chip gradient" title="Gradients parsed">
              <Palette size={13} />
              <span>
                {gradientsCount} {gradientsCount === 1 ? 'gradient' : 'gradients'}
              </span>
            </div>
          )}

          {hasEvenOdd && (
            <div className="meta-chip info" title="Path fill type">
              <span>EvenOdd Fill</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
