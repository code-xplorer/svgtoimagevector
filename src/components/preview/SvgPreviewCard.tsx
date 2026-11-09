import React from 'react';
import { VectorDocument } from '../../types/vector';
import { PreviewBackground } from '../../hooks/useConverterState';
import { ZoomIn, ZoomOut, Maximize2, Eye, Palette, CheckCircle2, Layers } from 'lucide-react';

interface SvgPreviewCardProps {
  document: VectorDocument;
  rawSvg: string;
  previewBg: PreviewBackground;
  previewZoom: number;
  onSetPreviewBg: (bg: PreviewBackground) => void;
  onSetPreviewZoom: (zoom: number | ((prev: number) => number)) => void;
}

export const SvgPreviewCard: React.FC<SvgPreviewCardProps> = ({
  document: doc,
  rawSvg,
  previewBg,
  previewZoom,
  onSetPreviewBg,
  onSetPreviewZoom,
}) => {
  const { viewBox, width, height, nodes, gradients } = doc;

  const countShapes = (nodeList: typeof nodes): number => {
    let count = 0;
    for (const n of nodeList) {
      if (n.type !== 'group') count++;
      if (n.children) count += countShapes(n.children);
    }
    return count;
  };

  const totalShapes = countShapes(nodes);
  const gradientsCount = Object.keys(gradients).length;
  const hasEvenOdd = nodes.some((n) => n.fillRule === 'evenodd');

  const handleZoomIn = () => {
    onSetPreviewZoom((prev) => Math.min(24, Math.round(prev * 1.5 * 10) / 10));
  };

  const handleZoomOut = () => {
    onSetPreviewZoom((prev) => Math.max(0.5, Math.round((prev / 1.5) * 10) / 10));
  };

  const handleZoomReset = () => {
    onSetPreviewZoom(1);
  };

  const handleZoomFit = () => {
    const maxDim = Math.max(width || 24, viewBox.width || 24);
    if (maxDim <= 32) onSetPreviewZoom(8);
    else if (maxDim <= 64) onSetPreviewZoom(4);
    else if (maxDim <= 128) onSetPreviewZoom(2);
    else onSetPreviewZoom(1);
  };

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

        {/* Controls: Background switch & Zoom */}
        <div className="preview-actions">
          {/* Background switcher */}
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

          <div className="preview-divider" />

          {/* Zoom controls */}
          <div className="preview-zoom-group">
            <button
              type="button"
              className="icon-button"
              onClick={handleZoomOut}
              title="Zoom out"
              style={{ padding: '4px' }}
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              className="zoom-percent-btn"
              onClick={handleZoomReset}
              title="Click to reset to 100%"
            >
              {Math.round(previewZoom * 100)}%
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={handleZoomIn}
              title="Zoom in"
              style={{ padding: '4px' }}
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={handleZoomFit}
              title="Fit to frame"
              style={{ padding: '4px' }}
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main interactive visual viewport */}
      <div className="preview-viewport" style={getBgStyle()}>
        <div
          className="preview-scaler"
          style={{
            transform: `scale(${previewZoom})`,
            transformOrigin: 'center center',
          }}
          dangerouslySetInnerHTML={{ __html: rawSvg }}
        />
      </div>

      {/* Footer metadata info chips */}
      <div className="preview-card-footer">
        <div className="meta-chip" title="ViewBox coordinates">
          <Layers size={13} />
          <span>
            viewBox: {viewBox.minX} {viewBox.minY} {viewBox.width} {viewBox.height}
          </span>
        </div>

        <div className="meta-chip" title="Total vector paths and shapes">
          <CheckCircle2 size={13} />
          <span>
            {totalShapes} {totalShapes === 1 ? 'shape' : 'shapes'}
          </span>
        </div>

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
    </div>
  );
};
