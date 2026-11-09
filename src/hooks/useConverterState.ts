import { useState, useCallback, useMemo } from 'react';
import { VectorDocument } from '../types/vector';
import { ImageVectorConfig, DEFAULT_IMAGE_VECTOR_CONFIG } from '../types/imagevector';
import { SAMPLE_SVGS } from '../assets/samples';
import { parseSvgDocument } from '../core/parser/svgParser';
import { generateImageVectorCode, sanitizeKotlinName } from '../core/generator/imageVectorGenerator';
import { exportSvgString } from '../core/generator/svgGenerator';

export type PreviewBackground = 'checkerboard' | 'dark' | 'light' | 'grid';

// Initialize with the first sample (Gradient Star Badge)
const initialSample = SAMPLE_SVGS[0];
const initialDocument: VectorDocument = parseSvgDocument(initialSample.svg, 'GradientStar');

export function useConverterState() {
  const [document, setDocument] = useState<VectorDocument>(initialDocument);
  const [rawSvg, setRawSvg] = useState<string>(initialSample.svg);
  const [activeTab, setActiveTab] = useState<'imagevector' | 'svg'>('imagevector');
  const [previewBg, setPreviewBg] = useState<PreviewBackground>('checkerboard');
  const [previewZoom, setPreviewZoom] = useState<number>(4);

  const [config, setConfig] = useState<ImageVectorConfig>({
    ...DEFAULT_IMAGE_VECTOR_CONFIG,
    name: sanitizeKotlinName(initialDocument.name || 'GradientStar'),
    defaultWidthDp: initialDocument.width,
    defaultHeightDp: initialDocument.height,
  });

  // Load and parse an SVG string (from upload, drop, paste, or sample)
  const loadSvg = useCallback((svgText: string, customName?: string) => {
    try {
      const iconName = sanitizeKotlinName(customName || 'MyIcon');
      const parsedDoc = parseSvgDocument(svgText, iconName);
      setDocument(parsedDoc);
      setRawSvg(svgText);
      setConfig((prev) => ({
        ...prev,
        name: iconName,
        defaultWidthDp: parsedDoc.width,
        defaultHeightDp: parsedDoc.height,
      }));
      // Auto-adjust preview zoom based on viewBox size (e.g. 24x24 -> 8x, 128x128 -> 2x)
      const maxDim = Math.max(parsedDoc.width || 24, parsedDoc.viewBox.width || 24);
      if (maxDim <= 32) setPreviewZoom(8);
      else if (maxDim <= 64) setPreviewZoom(4);
      else if (maxDim <= 128) setPreviewZoom(2);
      else setPreviewZoom(1);

      return { success: true, doc: parsedDoc };
    } catch (err: any) {
      console.error('Failed to parse SVG:', err);
      return { success: false, error: err.message || 'Invalid SVG format' };
    }
  }, []);

  // Update Kotlin generation configuration
  const updateConfig = useCallback((updates: Partial<ImageVectorConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update Icon/Document Name
  const updateDocumentName = useCallback((name: string) => {
    const sanitized = sanitizeKotlinName(name);
    setDocument((prev) => ({ ...prev, name: sanitized }));
    setConfig((prev) => ({ ...prev, name: sanitized }));
  }, []);

  // Generate ImageVector Kotlin code
  const imageVectorCode = useMemo(() => {
    return generateImageVectorCode(document, config);
  }, [document, config]);

  // Generate clean SVG markup
  const cleanSvgCode = useMemo(() => {
    return exportSvgString(document);
  }, [document]);

  const currentCode = activeTab === 'imagevector' ? imageVectorCode : cleanSvgCode;

  return {
    document,
    rawSvg,
    config,
    activeTab,
    previewBg,
    previewZoom,
    imageVectorCode,
    cleanSvgCode,
    currentCode,
    loadSvg,
    updateConfig,
    updateDocumentName,
    setActiveTab,
    setPreviewBg,
    setPreviewZoom,
  };
}
