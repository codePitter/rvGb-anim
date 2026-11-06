import React from 'react';
import { CutoutSettings } from '../types/studio';
import { Wand2, Scissors, Eye, RotateCcw, Brush, ShieldCheck } from 'lucide-react';

interface CutoutToolsProps {
  settings: CutoutSettings;
  onChangeSettings: (newSettings: Partial<CutoutSettings>) => void;
  onReprocessCutout: () => void;
  isProcessing: boolean;
  hasCutout: boolean;
  onOpenManualEditor: () => void;
}

export const CutoutTools: React.FC<CutoutToolsProps> = ({
  settings,
  onChangeSettings,
  onReprocessCutout,
  isProcessing,
  hasCutout,
  onOpenManualEditor
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-amber-400" />
          <span>Recorte y Detección de Sujeto</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Aísla automáticamente la persona, mascota u objeto para poder colocar cualquier fondo y animar sus capas.
        </p>
      </div>

      {/* Main Action: Auto Cutout */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-neutral-200">
              Recorte Automático Inteligente
            </span>
          </div>
          {hasCutout && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sujeto Recortado
            </span>
          )}
        </div>

        <p className="text-[12px] text-neutral-400">
          Detecta automáticamente los bordes del fondo y separa el elemento principal con transparencia alfa.
        </p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onReprocessCutout}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Procesando Recorte...' : 'Recortar Fondo Ahora'}</span>
          </button>

          <button
            onClick={onOpenManualEditor}
            disabled={!hasCutout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors border border-neutral-700"
            title="Pincel y Borrador Manual"
          >
            <Brush className="w-3.5 h-3.5" />
            <span>Pincel Manual</span>
          </button>
        </div>
      </div>

      {/* Precision Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="sensitivity-range" className="text-neutral-300 font-medium">Sensibilidad de Detección</label>
            <span className="text-neutral-400 font-mono text-[11px]">{settings.sensitivity}%</span>
          </div>
          <input
            id="sensitivity-range"
            type="range"
            min="15"
            max="85"
            value={settings.sensitivity}
            onChange={(e) => onChangeSettings({ sensitivity: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>Conservador (más sujeto)</span>
            <span>Agresivo (más fondo eliminado)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="feather-range" className="text-neutral-300 font-medium">Suavizado de Bordes (Feather)</label>
            <span className="text-neutral-400 font-mono text-[11px]">{settings.edgeFeather}px</span>
          </div>
          <input
            id="feather-range"
            type="range"
            min="0"
            max="6"
            step="0.5"
            value={settings.edgeFeather}
            onChange={(e) => onChangeSettings({ edgeFeather: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Difumina los píxeles perimetrales para evitar bordes dentados.
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="contrast-range" className="text-neutral-300 font-medium">Nitidez del Borde Alfa</label>
            <span className="text-neutral-400 font-mono text-[11px]">{settings.contrastBoost}%</span>
          </div>
          <input
            id="contrast-range"
            type="range"
            min="0"
            max="40"
            value={settings.contrastBoost}
            onChange={(e) => onChangeSettings({ contrastBoost: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
          <span className="text-xs text-neutral-300">Invertir Máscara</span>
          <button
            onClick={() => onChangeSettings({ invertMask: !settings.invertMask })}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors border ${
              settings.invertMask
                ? 'bg-amber-400 text-neutral-950 border-amber-400'
                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
          >
            {settings.invertMask ? 'Invertido' : 'Normal'}
          </button>
        </div>
      </div>
    </div>
  );
};
