import React from 'react';
import { Upload, Sparkles, Sun, Moon, FileCode2 } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onOpenUpload: () => void;
  onOpenPaste: () => void;
  onOpenSamples: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onOpenUpload,
  onOpenPaste,
  onOpenSamples,
  onToggleTheme,
}) => {
  return (
    <header className="studio-header">
      <div className="header-left">
        <div className="app-branding">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="brand-title">SVG to ImageVector</span>
          <span className="app-badge">Jetpack Compose</span>
        </div>
      </div>

      <div className="header-right">
        {/* Upload SVG button */}
        <button
          type="button"
          className="action-pill-btn secondary"
          onClick={onOpenUpload}
          title="Upload .svg file"
        >
          <Upload size={14} />
          <span>Upload SVG</span>
        </button>

        {/* Paste SVG XML button */}
        <button
          type="button"
          className="action-pill-btn secondary"
          onClick={onOpenPaste}
          title="Paste raw SVG XML"
        >
          <FileCode2 size={14} />
          <span>Paste XML</span>
        </button>

        {/* Sample Gallery button */}
        <button
          type="button"
          className="action-pill-btn secondary"
          onClick={onOpenSamples}
          title="Browse ready-to-test sample vectors"
        >
          <Sparkles size={14} />
          <span>Samples</span>
        </button>

        <div className="header-divider" />

        {/* Dark/Light Theme Toggle */}
        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          data-tooltip={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{ padding: '6px' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
