import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Brush, RotateCcw, Check, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ManualMaskEditorProps {
  originalImage: HTMLImageElement;
  currentCutoutCanvas: HTMLCanvasElement;
  isOpen: boolean;
  onClose: () => void;
  onSaveCutout: (updatedCanvas: HTMLCanvasElement) => void;
}

export const ManualMaskEditor: React.FC<ManualMaskEditorProps> = ({
  originalImage,
  currentCutoutCanvas,
  isOpen,
  onClose,
  onSaveCutout
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'eraser' | 'restore'>('eraser');
  const [brushSize, setBrushSize] = useState(25);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const historyRef = useRef<ImageData[]>([]);

  // Setup editor canvas when opened
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = currentCutoutCanvas.width;
    canvas.height = currentCutoutCanvas.height;

    // Draw current cutout state
    ctx.drawImage(currentCutoutCanvas, 0, 0);

    // Save initial state to history
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  }, [isOpen, currentCutoutCanvas]);

  const drawStroke = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Restore from original image
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    ctx.restore();
  }, [tool, brushSize, originalImage]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    drawStroke(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    drawStroke(x, y);
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Push state to history
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (historyRef.current.length > 10) {
        historyRef.current.shift();
      }
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length > 1) {
      historyRef.current.pop(); // Remove current state
      const prevState = historyRef.current[historyRef.current.length - 1];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(prevState, 0, 0);
    }
  };

  const handleApply = () => {
    if (canvasRef.current) {
      onSaveCutout(canvasRef.current);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Brush className="w-4 h-4 text-amber-400" />
              <span>Pincel de Retoque Manual</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Borra detalles residuales del fondo o restaura partes del sujeto que se hayan recortado por error.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                tool === 'eraser'
                  ? 'bg-amber-400 text-neutral-950 font-semibold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Borrador (Quitar Fondo)</span>
            </button>

            <button
              onClick={() => setTool('restore')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                tool === 'restore'
                  ? 'bg-amber-400 text-neutral-950 font-semibold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Brush className="w-3.5 h-3.5" />
              <span>Restaurador (Recuperar Sujeto)</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={historyRef.current.length <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Deshacer</span>
            </button>
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center gap-3">
            <span className="text-neutral-400">Tamaño Pincel:</span>
            <input
              type="range"
              min="5"
              max="80"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-28 accent-amber-400 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-[11px] text-neutral-300 w-8">{brushSize}px</span>
          </div>
        </div>

        {/* Canvas viewport */}
        <div className="flex-1 bg-transparency-grid overflow-auto p-6 flex items-center justify-center min-h-[400px]">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="max-h-[550px] max-w-full rounded-lg shadow-xl cursor-crosshair border border-neutral-700/80"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-900 border-t border-neutral-800">
          <span className="text-xs text-neutral-400">
            Pasa el cursor sobre la imagen para pintar o borrar con precisión.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Aplicar Cambios al Estudio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
