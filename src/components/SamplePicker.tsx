import React, { useRef } from 'react';
import { SAMPLE_IMAGES } from '../data/presets';
import { ImageAsset } from '../types/studio';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

interface SamplePickerProps {
  selectedAsset: ImageAsset | null;
  onSelectAsset: (asset: ImageAsset) => void;
  onCustomImageUpload: (dataUrl: string, name: string) => void;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  selectedAsset,
  onSelectAsset,
  onCustomImageUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCustomImageUpload(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCustomImageUpload(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>Elige una foto para transformar</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Usa una de nuestras fotos de prueba de alta resolución o sube tu propia imagen para cambiarle el fondo y animarla.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group border border-dashed border-neutral-700 hover:border-amber-400/70 bg-neutral-900/60 hover:bg-neutral-900 p-5 rounded-xl cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-2.5"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-amber-400/10 flex items-center justify-center text-neutral-400 group-hover:text-amber-400 transition-colors">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-200">
            Haz clic o arrastra tu propia foto aquí
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            PNG, JPG, WebP hasta 20 MB · O pega con Ctrl+V
          </p>
        </div>
      </div>

      {/* Sample presets grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-neutral-400">
            Galería de prueba lista para recortar y animar
          </span>
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            4 sujetos optimizados
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = selectedAsset?.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectAsset(sample)}
                className={`group relative text-left overflow-hidden rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-2.5 bg-neutral-900/90 backdrop-blur-sm border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200 truncate">
                      {sample.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {sample.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                    {sample.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
