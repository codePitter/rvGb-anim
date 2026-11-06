import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ImageAsset,
  CutoutSettings,
  BackgroundSettings,
  AnimationSettings,
  AspectRatio
} from './types/studio';
import { SAMPLE_IMAGES, BACKGROUND_PRESETS } from './data/presets';
import { processImageCutout } from './utils/segmentation';
import { TopBar } from './components/TopBar';
import { SamplePicker } from './components/SamplePicker';
import { CutoutTools } from './components/CutoutTools';
import { BackgroundPanel } from './components/BackgroundPanel';
import { AnimationPanel } from './components/AnimationPanel';
import { StudioViewport } from './components/StudioViewport';
import { ManualMaskEditor } from './components/ManualMaskEditor';
import { ExportModal } from './components/ExportModal';
import { Sparkles, Layers, Sliders, Film, Wand2, ShieldCheck, Download } from 'lucide-react';

export default function App() {
  // Current loaded asset & images
  const [selectedAsset, setSelectedAsset] = useState<ImageAsset | null>(SAMPLE_IMAGES[0]);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessingCutout, setIsProcessingCutout] = useState<boolean>(false);

  // Active control panel tab
  const [activeTab, setActiveTab] = useState<'gallery' | 'cutout' | 'background' | 'animation'>('animation');

  // Aspect ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');

  // Animation playback
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Modals
  const [isManualEditorOpen, setIsManualEditorOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Active canvas ref from viewport
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);

  // Studio Settings
  const [cutoutSettings, setCutoutSettings] = useState<CutoutSettings>({
    autoCutout: true,
    sensitivity: 48,
    edgeFeather: 2,
    contrastBoost: 15,
    invertMask: false
  });

  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    type: 'preset',
    presetId: 'studio-softbox',
    solidColor: '#0f172a',
    gradientIndex: 0,
    customImageUrl: null,
    blurOriginalRadius: 18
  });

  const [animSettings, setAnimSettings] = useState<AnimationSettings>({
    subjectMotion: 'float',
    backgroundMotion: 'ken_burns',
    particleEffect: 'golden_sparkles',
    speed: 1.0,
    intensity: 1.0,
    parallaxStrength: 0.9,
    depthSeparation: 30,
    dropShadowBlur: 25,
    dropShadowOpacity: 0.75,
    dropShadowColor: 'rgba(0, 0, 0, 0.85)',
    rimLightIntensity: 0.35,
    rimLightColor: 'rgba(230, 230, 255, 0.4)'
  });

  // Load image when selectedAsset changes
  useEffect(() => {
    if (!selectedAsset) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedAsset.url;
    img.onload = () => {
      setOriginalImage(img);
      runCutout(img, cutoutSettings);
    };
  }, [selectedAsset]);

  // Execute cutout process
  const runCutout = useCallback(
    async (img: HTMLImageElement, settings: CutoutSettings) => {
      setIsProcessingCutout(true);
      try {
        const result = await processImageCutout(img, settings);
        setCutoutCanvas(result.cutoutCanvas);
      } catch (err) {
        console.error('Error recortando sujeto:', err);
      } finally {
        setIsProcessingCutout(false);
      }
    },
    []
  );

  // Handler for custom user uploads
  const handleCustomUpload = (dataUrl: string, name: string) => {
    const customAsset: ImageAsset = {
      id: `custom-${Date.now()}`,
      name: name || 'Mi Imagen',
      url: dataUrl,
      thumbnail: dataUrl,
      category: 'Personal',
      description: 'Imagen subida por el usuario'
    };
    setSelectedAsset(customAsset);
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                handleCustomUpload(event.target.result as string, 'Imagen Pegada');
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportModalOpen(true)}
        hasCutout={!!cutoutCanvas}
      />

      {/* Main Studio Work Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
        {/* Quick Context & Status Kicker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-900">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Estudio de Fondo y Animación 2.5D</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Recorta el sujeto automáticamente, cámbiale el fondo por escenarios o degradados, y dale vida con movimiento interactivo.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {cutoutCanvas ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sujeto aislado listo
              </span>
            ) : isProcessingCutout ? (
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-lg animate-pulse">
                <Wand2 className="w-3.5 h-3.5 animate-spin" />
                Analizando sujeto...
              </span>
            ) : null}

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 px-3 py-1 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Studio 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Viewport (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            <StudioViewport
              originalImage={originalImage}
              cutoutCanvas={cutoutCanvas}
              bgSettings={bgSettings}
              animSettings={animSettings}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onCanvasReady={(canvas) => setActiveCanvas(canvas)}
            />

            {/* Quick Actions Strip below viewport */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => {
                  setActiveTab('cutout');
                  if (originalImage) runCutout(originalImage, cutoutSettings);
                }}
                className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-neutral-300 group-hover:text-amber-400 text-xs font-semibold">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Re-detectar Sujeto</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Ajusta la sensibilidad del recorte
                </p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('background');
                  setBgSettings((prev) => ({
                    ...prev,
                    type: 'preset',
                    presetId: 'cyber-neon'
                  }));
                }}
                className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-neutral-300 group-hover:text-amber-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fondo Neón Cyber</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Iluminación ambiental viva
                </p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('animation');
                  setAnimSettings((prev) => ({
                    ...prev,
                    subjectMotion: 'float',
                    particleEffect: 'golden_sparkles'
                  }));
                }}
                className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-neutral-300 group-hover:text-amber-400 text-xs font-semibold">
                  <Film className="w-3.5 h-3.5" />
                  <span>Flotación + Chispas</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Efecto hipnótico 2.5D
                </p>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="p-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Video</span>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  Bucle MP4 / WebM en 60 FPS
                </p>
              </button>
            </div>
          </div>

          {/* Right Column: Studio Control Hub (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-5">
            {/* Panel Tab Buttons */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[11px] truncate">1. Fotos</span>
              </button>

              <button
                onClick={() => setActiveTab('cutout')}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'cutout'
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-[11px] truncate">2. Sujeto</span>
              </button>

              <button
                onClick={() => setActiveTab('background')}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'background'
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] truncate">3. Fondo</span>
              </button>

              <button
                onClick={() => setActiveTab('animation')}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'animation'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span className="text-[11px] truncate">4. Animar</span>
              </button>
            </div>

            {/* Active Panel View */}
            <div className="min-h-[420px]">
              {activeTab === 'gallery' && (
                <SamplePicker
                  selectedAsset={selectedAsset}
                  onSelectAsset={(asset) => setSelectedAsset(asset)}
                  onCustomImageUpload={handleCustomUpload}
                />
              )}

              {activeTab === 'cutout' && (
                <CutoutTools
                  settings={cutoutSettings}
                  onChangeSettings={(newSettings) => {
                    const updated = { ...cutoutSettings, ...newSettings };
                    setCutoutSettings(updated);
                    if (originalImage) {
                      runCutout(originalImage, updated);
                    }
                  }}
                  onReprocessCutout={() => {
                    if (originalImage) runCutout(originalImage, cutoutSettings);
                  }}
                  isProcessing={isProcessingCutout}
                  hasCutout={!!cutoutCanvas}
                  onOpenManualEditor={() => setIsManualEditorOpen(true)}
                />
              )}

              {activeTab === 'background' && (
                <BackgroundPanel
                  bgSettings={bgSettings}
                  animSettings={animSettings}
                  onChangeBg={(newBg) => setBgSettings((prev) => ({ ...prev, ...newBg }))}
                  onChangeAnim={(newAnim) => setAnimSettings((prev) => ({ ...prev, ...newAnim }))}
                />
              )}

              {activeTab === 'animation' && (
                <AnimationPanel
                  settings={animSettings}
                  onChangeSettings={(newAnim) => setAnimSettings((prev) => ({ ...prev, ...newAnim }))}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                />
              )}
            </div>

            {/* Footer Step Helper */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
              <span>Paso actual: {activeTab === 'gallery' ? 'Selección' : activeTab === 'cutout' ? 'Recorte Alfa' : activeTab === 'background' ? 'Nuevo Fondo' : 'Animación 2.5D'}</span>
              <button
                onClick={() => {
                  if (activeTab === 'gallery') setActiveTab('cutout');
                  else if (activeTab === 'cutout') setActiveTab('background');
                  else if (activeTab === 'background') setActiveTab('animation');
                  else setIsExportModalOpen(true);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                {activeTab === 'animation' ? 'Exportar Video →' : 'Siguiente Paso →'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Manual Retouch Brush Modal */}
      {isManualEditorOpen && originalImage && cutoutCanvas && (
        <ManualMaskEditor
          originalImage={originalImage}
          currentCutoutCanvas={cutoutCanvas}
          isOpen={isManualEditorOpen}
          onClose={() => setIsManualEditorOpen(false)}
          onSaveCutout={(updatedCanvas) => {
            setCutoutCanvas(updatedCanvas);
          }}
        />
      )}

      {/* Video & Image Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeCanvas={activeCanvas}
        cutoutCanvas={cutoutCanvas}
      />
    </div>
  );
}
