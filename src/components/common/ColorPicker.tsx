import React from 'react';

interface ColorPickerProps {
  color: string;
  alpha?: number;
  onChange: (color: string, alpha: number) => void;
  showAlpha?: boolean;
}

const MATERIAL_SWATCHES = [
  '#000000', '#FFFFFF', '#3489eb', '#E6F1FD', '#2196F3',
  '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B',
  '#FF9800', '#FF5722', '#E91E63', '#9C27B0',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  alpha = 1,
  onChange,
  showAlpha = true,
}) => {
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    onChange(val, alpha);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlpha = parseFloat(e.target.value);
    onChange(color, isNaN(newAlpha) ? 1 : newAlpha);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="color"
          value={color.startsWith('#') && color.length === 7 ? color : '#3489eb'}
          onChange={(e) => onChange(e.target.value, alpha)}
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            border: '1px solid var(--md-sys-color-outline-variant)',
            borderRadius: 'var(--md-sys-shape-corner-xs)',
            cursor: 'pointer',
          }}
        />
        <input
          type="text"
          value={color}
          onChange={handleHexChange}
          style={{ width: '88px', textTransform: 'uppercase' }}
          placeholder="#RRGGBB"
        />
        {showAlpha && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={alpha}
              onChange={handleAlphaChange}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>
              {Math.round(alpha * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="color-swatches-grid">
        {MATERIAL_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            className="color-swatch-btn"
            style={{ backgroundColor: swatch }}
            onClick={() => onChange(swatch, alpha)}
            title={swatch}
          />
        ))}
      </div>
    </div>
  );
};
