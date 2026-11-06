import React from 'react';
import { Film, Sparkles, Layers, Sliders, Download } from 'lucide-react';

interface TopBarProps {
  activeTab: 'cutout' | 'background' | 'animation' | 'gallery';
  setActiveTab: (tab: 'cutout' | 'background' | 'animation' | 'gallery') => void;
  onOpenExport: () => void;
  hasCutout: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  hasCutout
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-neutral-950 font-black shadow-sm shadow-amber-400/20">
          <Film className="w-4 h-4 stroke-[2.5]" />
        </div>
        <a href="/" className="text-lg font-bold tracking-tight text-neutral-100 whitespace-nowrap">
          AnimFondo Studio
        </a>
      </div>

      {/* Zone 2: 4 clean single-line navigation controls */}
      <nav className="hidden md:flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800/80 rounded-xl">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'gallery'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. Fotos & Muestras</span>
        </button>

        <button
          onClick={() => setActiveTab('cutout')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'cutout'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>2. Recorte Sujeto</span>
        </button>

        <button
          onClick={() => setActiveTab('background')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'background'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>3. Cambiar Fondo</span>
        </button>

        <button
          onClick={() => setActiveTab('animation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'animation'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>4. Animar 2.5D</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary CTA action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 shadow-sm shadow-amber-400/20"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Exportar Video / PNG</span>
        </button>
      </div>
    </header>
  );
};
