import React, { useRef } from 'react';
import { BackgroundSettings, AnimationSettings } from '../types/studio';
import { BACKGROUND_PRESETS, GRADIENT_PRESETS, SOLID_COLOR_PRESETS } from '../data/presets';
import { Sparkles, Palette, Image as ImageIcon, Sliders, Upload, Check, EyeOff } from 'lucide-react';

interface BackgroundPanelProps {
  bgSettings: BackgroundSettings;
  animSettings: AnimationSettings;
  onChangeBg: (newSettings: Partial<BackgroundSettings>) => void;
  onChangeAnim: (newSettings: Partial<AnimationSettings>) => void;
}

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  bgSettings,
  animSettings,
  onChangeBg,
  onChangeAnim
}) => {
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChangeBg({
            type: 'custom_image',
            customImageUrl: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Cambiar el Fondo de la Imagen</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Coloca a tu sujeto en un estudio minimalista, ciudad cyberpunk, atardecer o sube tu propio fondo personalizado.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
        <button
          onClick={() => onChangeBg({ type: 'preset' })}
          className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
            bgSettings.type === 'preset'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Escenarios
        </button>
        <button
          onClick={() => onChangeBg({ type: 'gradient' })}
          className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
            bgSettings.type === 'gradient'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Degradados
        </button>
        <button
          onClick={() => onChangeBg({ type: 'color' })}
          className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
            bgSettings.type === 'color'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Color Sólido
        </button>
        <button
          onClick={() => onChangeBg({ type: 'blur_original' })}
          className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
            bgSettings.type === 'blur_original'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Bokeh / Desenfoque
        </button>
        <button
          onClick={() => onChangeBg({ type: 'custom_image' })}
          className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
            bgSettings.type === 'custom_image'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Mi Imagen
        </button>
        <button
          onClick={() => onChangeBg({ type: 'transparent' })}
          className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
            bgSettings.type === 'transparent'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Transparente
        </button>
      </div>

      {/* Tab 1: Escenarios Predefinidos */}
      {bgSettings.type === 'preset' && (
        <div className="space-y-3">
          <span className="text-xs font-medium text-neutral-400 block">
            Escoge un ambiente ambiental con iluminación sincronizada:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {BACKGROUND_PRESETS.map((preset) => {
              const isSelected = bgSettings.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onChangeBg({ presetId: preset.id });
                    // Auto-sync lighting
                    onChangeAnim({
                      rimLightColor: preset.lightingHint.rimGlowColor,
                      dropShadowColor: preset.lightingHint.shadowColor
                    });
                  }}
                  className={`group relative text-left p-3 rounded-xl border transition-all overflow-hidden ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                  style={{ background: preset.previewStyle }}
                >
                  <div className="relative z-10 flex flex-col justify-end h-16">
                    <span className="text-xs font-bold text-white drop-shadow-md">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-white/80 drop-shadow">
                      {preset.category}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Gradients */}
      {bgSettings.type === 'gradient' && (
        <div className="space-y-3">
          <span className="text-xs font-medium text-neutral-400 block">
            Degradados modernos de alto impacto:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {GRADIENT_PRESETS.map((grad, idx) => {
              const isSelected = bgSettings.gradientIndex === idx;
              return (
                <button
                  key={grad.name}
                  onClick={() => onChangeBg({ gradientIndex: idx })}
                  className={`relative p-3 rounded-xl border h-16 flex items-end transition-all ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                  style={{ background: grad.css }}
                >
                  <span className="text-xs font-medium text-white drop-shadow">
                    {grad.name}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Solid Colors */}
      {bgSettings.type === 'color' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Paleta de colores:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-300 uppercase">
                {bgSettings.solidColor}
              </span>
              <input
                type="color"
                value={bgSettings.solidColor}
                onChange={(e) => onChangeBg({ solidColor: e.target.value })}
                className="w-7 h-7 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {SOLID_COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => onChangeBg({ solidColor: color })}
                className={`w-full aspect-square rounded-lg border transition-transform ${
                  bgSettings.solidColor.toLowerCase() === color.toLowerCase()
                    ? 'scale-110 border-amber-400 ring-2 ring-amber-400/40'
                    : 'border-neutral-800 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Blur Original Background */}
      {bgSettings.type === 'blur_original' && (
        <div className="space-y-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-200 font-medium">Desenfoque de Lente (Bokeh)</span>
              <span className="text-neutral-400 font-mono text-[11px]">
                {bgSettings.blurOriginalRadius}px
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="40"
              value={bgSettings.blurOriginalRadius}
              onChange={(e) => onChangeBg({ blurOriginalRadius: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[11px] text-neutral-400 mt-2">
              Mantiene el fondo original de tu foto pero le aplica un efecto de cámara réflex con apertura amplia para resaltar al sujeto.
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Custom Image */}
      {bgSettings.type === 'custom_image' && (
        <div className="space-y-4">
          <input
            ref={customBgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomBgUpload}
          />
          <div
            onClick={() => customBgInputRef.current?.click()}
            className="border border-dashed border-neutral-700 hover:border-amber-400 bg-neutral-900 p-6 rounded-xl cursor-pointer text-center space-y-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-neutral-200">
              {bgSettings.customImageUrl
                ? 'Cambiar imagen de fondo'
                : 'Sube cualquier imagen como nuevo fondo'}
            </p>
            <p className="text-[11px] text-neutral-400">JPG, PNG o WebP</p>
          </div>

          {bgSettings.customImageUrl && (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-neutral-800">
              <img
                src={bgSettings.customImageUrl}
                alt="Fondo personalizado"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Transparent */}
      {bgSettings.type === 'transparent' && (
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-center">
          <p className="text-xs font-medium text-neutral-200">Fondo Transparente PNG</p>
          <p className="text-[11px] text-neutral-400">
            Exporta tu recorte limpio con fondo transparente listo para stickers, montajes o diseño gráfico.
          </p>
        </div>
      )}

      {/* Lighting & Depth Integration Controls */}
      <div className="pt-4 border-t border-neutral-800 space-y-4">
        <span className="text-xs font-semibold text-neutral-300 block">
          Ajustes de Sombra y Luz de Sujeto
        </span>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400">Intensidad de Sombra Base</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              {Math.round(animSettings.dropShadowOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={animSettings.dropShadowOpacity}
            onChange={(e) => onChangeAnim({ dropShadowOpacity: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400">Resplandor de Borde (Rim Light)</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              {Math.round(animSettings.rimLightIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={animSettings.rimLightIntensity}
            onChange={(e) => onChangeAnim({ rimLightIntensity: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
