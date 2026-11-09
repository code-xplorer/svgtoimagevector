import React, { useState, useEffect } from 'react';
import { useConverterState } from '../../hooks/useConverterState';
import { Header } from './Header';
import { SvgUploadCard } from '../upload/SvgUploadCard';
import { SvgPreviewCard } from '../preview/SvgPreviewCard';
import { ImageVectorPanel } from '../codegen/ImageVectorPanel';
import { SvgUploadModal } from '../modals/SvgUploadModal';
import { PasteSvgModal } from '../modals/PasteSvgModal';
import { SampleGalleryModal } from '../modals/SampleGalleryModal';

export const MainLayout: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState(false);

  const {
    document,
    rawSvg,
    config,
    activeTab,
    previewBg,
    previewZoom,
    currentCode,
    loadSvg,
    updateConfig,
    setActiveTab,
    setPreviewBg,
    setPreviewZoom,
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
      {/* Top Header */}
      <Header
        theme={theme}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenPaste={() => setIsPasteOpen(true)}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Studio Workspace: 2-Column Responsive Layout */}
      <main className="studio-workspace">
        {/* Left Column: Upload & Visual Preview */}
        <section className="studio-column left-column">
          <SvgUploadCard
            onLoadSvg={handleLoadSvg}
            onOpenPasteModal={() => setIsPasteOpen(true)}
            onOpenSampleModal={() => setIsSamplesOpen(true)}
          />

          <SvgPreviewCard
            document={document}
            rawSvg={rawSvg}
            previewBg={previewBg}
            previewZoom={previewZoom}
            onSetPreviewBg={setPreviewBg}
            onSetPreviewZoom={setPreviewZoom}
          />
        </section>

        {/* Right Column: Jetpack Compose ImageVector Generator */}
        <section className="studio-column right-column">
          <ImageVectorPanel
            config={config}
            activeTab={activeTab}
            currentCode={currentCode}
            onUpdateConfig={updateConfig}
            onTabChange={setActiveTab}
          />
        </section>
      </main>

      {/* Modals */}
      <SvgUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportSvg={handleLoadSvg}
      />

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
