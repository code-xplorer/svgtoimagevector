import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
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
