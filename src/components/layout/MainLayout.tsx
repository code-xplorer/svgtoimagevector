import React, { useState, useEffect } from 'react';
import { useConverterState } from '../../hooks/useConverterState';
import { Header } from './Header';
import { SvgUploadCard } from '../upload/SvgUploadCard';
import { SvgPreviewCard } from '../preview/SvgPreviewCard';
import { ImageVectorPanel } from '../codegen/ImageVectorPanel';
import { PasteSvgModal } from '../modals/PasteSvgModal';
import { SampleGalleryModal } from '../modals/SampleGalleryModal';

export const MainLayout: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState(false);

  const {
    document,
    rawSvg,
    config,
    activeTab,
    previewBg,
    currentCode,
    loadSvg,
    updateConfig,
    setActiveTab,
    setPreviewBg,
  } = useConverterState();

  // Apply theme attribute to document element
  useEffect(() => {
    window.document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLoadSvg = (svgText: string, name?: string) => {
    loadSvg(svgText, name);
  };

  return (
    <div className="studio-container">
      {/* Skip to Main Content Link for Keyboard Navigation (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Studio Workspace: 2-Column Responsive Layout */}
      <main id="main-content" className="studio-workspace" tabIndex={-1}>
        {/* Left Column: Upload & Visual Preview */}
        <div className="studio-column left-column">
          <SvgUploadCard
            onLoadSvg={handleLoadSvg}
            onOpenPasteModal={() => setIsPasteOpen(true)}
            onOpenSampleModal={() => setIsSamplesOpen(true)}
          />

          <SvgPreviewCard
            document={document}
            rawSvg={rawSvg}
            previewBg={previewBg}
            onSetPreviewBg={setPreviewBg}
          />
        </div>

        {/* Right Column: Jetpack Compose ImageVector Generator */}
        <div className="studio-column right-column">
          <ImageVectorPanel
            config={config}
            activeTab={activeTab}
            currentCode={currentCode}
            onUpdateConfig={updateConfig}
            onTabChange={setActiveTab}
          />
        </div>
      </main>

      {/* Modals */}
      <PasteSvgModal
        isOpen={isPasteOpen}
        onClose={() => setIsPasteOpen(false)}
        onLoadSvg={handleLoadSvg}
      />

      <SampleGalleryModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectSample={handleLoadSvg}
      />
    </div>
  );
};
