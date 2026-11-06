import React, { useState } from 'react';
import { recordCanvasVideo, triggerFileDownload } from '../utils/videoExporter';
import { Download, Film, Image as ImageIcon, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCanvas: HTMLCanvasElement | null;
  cutoutCanvas: HTMLCanvasElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeCanvas,
  cutoutCanvas
}) => {
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [completedUrl, setCompletedUrl] = useState<string | null>(null);
  const [completedType, setCompletedType] = useState<'video' | 'image' | null>(null);

  if (!isOpen) return null;

  const handleExportVideo = async () => {
    if (!activeCanvas) return;
    setIsExporting(true);
    setExportProgress(0);
    setCompletedUrl(null);

    try {
      const blob = await recordCanvasVideo(activeCanvas, videoDuration, (progress) => {
        setExportProgress(progress);
      });

      const url = URL.createObjectURL(blob);
      setCompletedUrl(url);
      setCompletedType('video');
      setIsExporting(false);

      // Trigger download
      const filename = `animfondo_animacion_${Date.now()}.webm`;
      triggerFileDownload(blob, filename);
    } catch (err) {
      console.error('Error al exportar video:', err);
      setIsExporting(false);
    }
  };

  const handleExportImage = (transparent = false) => {
    const canvasToExport = transparent ? cutoutCanvas : activeCanvas;
    if (!canvasToExport) return;

    const dataUrl = canvasToExport.toDataURL('image/png');
    const filename = transparent
      ? `sujeto_recortado_${Date.now()}.png`
      : `foto_fondo_cambiado_${Date.now()}.png`;

    triggerFileDownload(dataUrl, filename);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">Exportar Creación</h3>
              <p className="text-xs text-neutral-400">Descarga tu animación en video o tu imagen editada</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Animated Video Export */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-neutral-200">
                  Video Animado en Bucle (WebM / MP4)
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium">60 FPS Suave</span>
            </div>

            <p className="text-[12px] text-neutral-400">
              Graba la animación fluida del sujeto, el fondo y las partículas en alta calidad, listo para redes sociales (TikTok, Reels, Instagram).
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-300">Duración del Bucle:</span>
              <div className="flex gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                {[3, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setVideoDuration(sec)}
                    disabled={isExporting}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      videoDuration === sec
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {isExporting ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    Grabando video en tiempo real ({videoDuration}s)...
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{exportProgress}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            ) : completedUrl && completedType === 'video' ? (
              <div className="pt-2 flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Video grabado y descargado con éxito!
                </span>
                <button
                  onClick={() => handleExportVideo()}
                  className="underline hover:text-emerald-300 text-[11px]"
                >
                  Descargar de nuevo
                </button>
              </div>
            ) : (
              <button
                onClick={handleExportVideo}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors shadow-sm"
              >
                <Film className="w-4 h-4" />
                <span>Generar y Descargar Video ({videoDuration}s)</span>
              </button>
            )}
          </div>

          {/* Section 2: Still Image Export */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-neutral-300 block">
              Descargar Imágenes Estáticas (PNG de Alta Resolución)
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleExportImage(false)}
                className="flex flex-col items-start gap-1 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-neutral-200">
                    Con Nuevo Fondo
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Imagen compuesta con iluminación y fondo completo.
                </p>
              </button>

              <button
                onClick={() => handleExportImage(true)}
                disabled={!cutoutCanvas}
                className="flex flex-col items-start gap-1 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 disabled:pointer-events-none transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-200">
                    Sujeto Transparente
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  PNG aislado sin fondo para stickers y montajes.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900/80 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
