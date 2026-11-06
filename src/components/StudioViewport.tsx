import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AnimationSettings,
  BackgroundSettings,
  CutoutSettings,
  AspectRatio
} from '../types/studio';
import { BACKGROUND_PRESETS, GRADIENT_PRESETS } from '../data/presets';
import { ParticleSystem } from '../utils/particleEngine';
import { Play, Pause, RotateCcw, Columns, Maximize2, Compass } from 'lucide-react';

interface StudioViewportProps {
  originalImage: HTMLImageElement | null;
  cutoutCanvas: HTMLCanvasElement | null;
  bgSettings: BackgroundSettings;
  animSettings: AnimationSettings;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const StudioViewport: React.FC<StudioViewportProps> = ({
  originalImage,
  cutoutCanvas,
  bgSettings,
  animSettings,
  aspectRatio,
  setAspectRatio,
  isPlaying,
  onTogglePlay,
  onCanvasReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [splitRatio, setSplitRatio] = useState<number | null>(null); // null = full view, 0-1 = split slider
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Custom background image cache
  const customBgImgRef = useRef<HTMLImageElement | null>(null);

  // Particle engine instance
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  // Custom image loading
  useEffect(() => {
    if (bgSettings.type === 'custom_image' && bgSettings.customImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgSettings.customImageUrl;
      img.onload = () => {
        customBgImgRef.current = img;
      };
    } else {
      customBgImgRef.current = null;
    }
  }, [bgSettings.type, bgSettings.customImageUrl]);

  // Mouse move handler for Parallax 3D
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    setMousePos({ x, y });

    if (isDraggingSplit) {
      const relativeX = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
      setSplitRatio(relativeX);
    }
  }, [isDraggingSplit]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });

    if (isDraggingSplit) {
      const relativeX = Math.max(0.05, Math.min(0.95, (touch.clientX - rect.left) / rect.width));
      setSplitRatio(relativeX);
    }
  }, [isDraggingSplit]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    // Determine logical resolution based on aspect ratio
    let baseWidth = 800;
    let baseHeight = 600;

    if (originalImage) {
      baseWidth = originalImage.naturalWidth || 800;
      baseHeight = originalImage.naturalHeight || 600;
    }

    // Apply aspect ratio clipping/target
    let targetWidth = baseWidth;
    let targetHeight = baseHeight;

    if (aspectRatio === '1:1') {
      const size = Math.min(baseWidth, baseHeight);
      targetWidth = size;
      targetHeight = size;
    } else if (aspectRatio === '9:16') {
      targetWidth = Math.round(baseHeight * (9 / 16));
      targetHeight = baseHeight;
    } else if (aspectRatio === '16:9') {
      targetWidth = baseWidth;
      targetHeight = Math.round(baseWidth * (9 / 16));
    } else if (aspectRatio === '4:5') {
      targetWidth = Math.round(baseHeight * (4 / 5));
      targetHeight = baseHeight;
    }

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    // Initialize or resize particle system
    if (!particleSystemRef.current) {
      particleSystemRef.current = new ParticleSystem(
        targetWidth,
        targetHeight,
        animSettings.particleEffect
      );
    } else {
      particleSystemRef.current.resize(targetWidth, targetHeight);
      particleSystemRef.current.setType(animSettings.particleEffect);
    }

    let animationFrameId: number;
    let startTime = performance.now();

    const render = (currentTime: number) => {
      const elapsed = isPlaying ? (currentTime - startTime) / 1000 : 0;
      const speed = animSettings.speed;
      const intensity = animSettings.intensity;
      const t = elapsed * speed;

      // Parallax calculations
      // If user isn't hovering, create gentle automatic floating orbit
      const autoOrbitX = Math.sin(t * 0.8) * 0.4;
      const autoOrbitY = Math.cos(t * 0.6) * 0.3;
      const currentMouseX = isHovered ? mousePos.x : autoOrbitX;
      const currentMouseY = isHovered ? mousePos.y : autoOrbitY;

      const parallaxSubjectX = currentMouseX * 18 * animSettings.parallaxStrength;
      const parallaxSubjectY = currentMouseY * 18 * animSettings.parallaxStrength;
      const parallaxBgX = -currentMouseX * 12 * animSettings.parallaxStrength;
      const parallaxBgY = -currentMouseY * 12 * animSettings.parallaxStrength;

      ctx.clearRect(0, 0, targetWidth, targetHeight);

      // Function to draw full animated composite
      const drawComposite = (drawLeftCutoff = targetWidth) => {
        ctx.save();
        if (drawLeftCutoff < targetWidth) {
          ctx.beginPath();
          ctx.rect(0, 0, drawLeftCutoff, targetHeight);
          ctx.clip();
        }

        // ==========================================
        // 1. LAYER 1: BACKGROUND
        // ==========================================
        ctx.save();

        // Background Motion (Ken Burns, Rotation, Pulse)
        let bgScale = 1;
        let bgOffsetX = parallaxBgX;
        let bgOffsetY = parallaxBgY;
        let bgRotate = 0;

        if (animSettings.backgroundMotion === 'ken_burns') {
          bgScale = 1.06 + Math.sin(t * 0.4) * 0.04 * intensity;
          bgOffsetX += Math.cos(t * 0.3) * 14 * intensity;
          bgOffsetY += Math.sin(t * 0.25) * 10 * intensity;
        } else if (animSettings.backgroundMotion === 'slow_rotate') {
          bgRotate = (t * 0.05 * intensity) % (Math.PI * 2);
          bgScale = 1.15;
        } else if (animSettings.backgroundMotion === 'ambient_pulse') {
          bgScale = 1.02 + Math.sin(t * 1.5) * 0.025 * intensity;
        }

        ctx.translate(targetWidth / 2 + bgOffsetX, targetHeight / 2 + bgOffsetY);
        ctx.rotate(bgRotate);
        ctx.scale(bgScale, bgScale);
        ctx.translate(-targetWidth / 2, -targetHeight / 2);

        // Draw background according to mode
        if (bgSettings.type === 'transparent') {
          // Checkerboard pattern
          const sq = 24;
          for (let cy = -50; cy < targetHeight + 50; cy += sq) {
            for (let cx = -50; cx < targetWidth + 50; cx += sq) {
              ctx.fillStyle = ((cx / sq + cy / sq) % 2 === 0) ? '#262626' : '#1a1a1a';
              ctx.fillRect(cx, cy, sq, sq);
            }
          }
        } else if (bgSettings.type === 'color') {
          ctx.fillStyle = bgSettings.solidColor;
          ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
        } else if (bgSettings.type === 'gradient') {
          const gradDef = GRADIENT_PRESETS[bgSettings.gradientIndex] || GRADIENT_PRESETS[0];
          const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
          if (bgSettings.gradientIndex === 0) {
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(0.5, '#1e1b4b');
            grad.addColorStop(1, '#312e81');
          } else if (bgSettings.gradientIndex === 1) {
            grad.addColorStop(0, '#4c0519');
            grad.addColorStop(0.5, '#831843');
            grad.addColorStop(1, '#be123c');
          } else if (bgSettings.gradientIndex === 2) {
            grad.addColorStop(0, '#064e3b');
            grad.addColorStop(0.5, '#047857');
            grad.addColorStop(1, '#10b981');
          } else if (bgSettings.gradientIndex === 3) {
            grad.addColorStop(0, '#18181b');
            grad.addColorStop(0.5, '#27272a');
            grad.addColorStop(1, '#3f3f46');
          } else {
            grad.addColorStop(0, '#2e1065');
            grad.addColorStop(0.5, '#581c87');
            grad.addColorStop(1, '#7e22ce');
          }
          ctx.fillStyle = grad;
          ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
        } else if (bgSettings.type === 'blur_original' && originalImage) {
          ctx.save();
          ctx.filter = `blur(${bgSettings.blurOriginalRadius}px) brightness(0.9)`;
          // Draw scaled original image
          ctx.drawImage(originalImage, -20, -20, targetWidth + 40, targetHeight + 40);
          ctx.restore();
        } else if (bgSettings.type === 'custom_image' && customBgImgRef.current) {
          ctx.drawImage(customBgImgRef.current, -20, -20, targetWidth + 40, targetHeight + 40);
        } else {
          // Presets (Studio, Cyberpunk, Sunset, Deep Space, etc.)
          const preset = BACKGROUND_PRESETS.find((p) => p.id === bgSettings.presetId) || BACKGROUND_PRESETS[0];
          if (preset.id === 'studio-softbox') {
            const rad = ctx.createRadialGradient(
              targetWidth * 0.5, targetHeight * 0.35, 20,
              targetWidth * 0.5, targetHeight * 0.5, targetWidth * 0.7
            );
            rad.addColorStop(0, '#3a3a42');
            rad.addColorStop(0.7, '#151518');
            rad.addColorStop(1, '#08080a');
            ctx.fillStyle = rad;
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
          } else if (preset.id === 'cyber-neon') {
            const rad1 = ctx.createRadialGradient(targetWidth * 0.8, targetHeight * 0.2, 10, targetWidth * 0.8, targetHeight * 0.2, targetWidth * 0.5);
            rad1.addColorStop(0, 'rgba(255, 0, 128, 0.5)');
            rad1.addColorStop(1, 'rgba(10, 5, 25, 0)');

            const rad2 = ctx.createRadialGradient(targetWidth * 0.2, targetHeight * 0.8, 10, targetWidth * 0.2, targetHeight * 0.8, targetWidth * 0.5);
            rad2.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
            rad2.addColorStop(1, 'rgba(10, 5, 25, 0)');

            ctx.fillStyle = '#070514';
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
            ctx.fillStyle = rad1;
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
            ctx.fillStyle = rad2;
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
          } else if (preset.id === 'golden-sunset') {
            const sunGrad = ctx.createRadialGradient(
              targetWidth * 0.5, targetHeight * 0.7, 10,
              targetWidth * 0.5, targetHeight * 0.7, targetWidth * 0.8
            );
            sunGrad.addColorStop(0, '#ffdf7a');
            sunGrad.addColorStop(0.35, '#ff7b39');
            sunGrad.addColorStop(0.75, '#801d52');
            sunGrad.addColorStop(1, '#1f0b2a');
            ctx.fillStyle = sunGrad;
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
          } else if (preset.id === 'deep-space') {
            const cosmic = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
            cosmic.addColorStop(0, '#03000a');
            cosmic.addColorStop(0.5, '#0e0224');
            cosmic.addColorStop(1, '#010005');
            ctx.fillStyle = cosmic;
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);

            const nebula = ctx.createRadialGradient(targetWidth * 0.7, targetHeight * 0.3, 20, targetWidth * 0.7, targetHeight * 0.3, targetWidth * 0.5);
            nebula.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
            nebula.addColorStop(1, 'transparent');
            ctx.fillStyle = nebula;
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
          } else {
            // Default rich dark studio
            ctx.fillStyle = '#121216';
            ctx.fillRect(-50, -50, targetWidth + 100, targetHeight + 100);
          }
        }
        ctx.restore();

        // ==========================================
        // 2. LAYER 2: SUBJECT MOTION & TRANSFORMS
        // ==========================================
        const subjectSource = cutoutCanvas || originalImage;
        if (subjectSource) {
          ctx.save();

          // Calculate Subject Motion Transforms
          let subX = targetWidth / 2 + parallaxSubjectX;
          let subY = targetHeight / 2 + parallaxSubjectY;
          let subScale = 1;
          let subRotate = 0;

          if (animSettings.subjectMotion === 'float') {
            const floatOffset = Math.sin(t * 1.8) * 14 * intensity;
            subY += floatOffset;
            subRotate = Math.cos(t * 1.2) * 0.02 * intensity;
          } else if (animSettings.subjectMotion === 'breathe') {
            subScale = 1 + Math.sin(t * 2.2) * 0.03 * intensity;
          } else if (animSettings.subjectMotion === 'wiggle') {
            subRotate = Math.sin(t * 3.5) * 0.045 * intensity;
            subX += Math.cos(t * 2.5) * 8 * intensity;
          } else if (animSettings.subjectMotion === 'zoom_punch') {
            const cycle = (t * 0.8) % (Math.PI * 2);
            subScale = 1 + (Math.sin(cycle) > 0 ? Math.sin(cycle) * 0.08 * intensity : 0);
          } else if (animSettings.subjectMotion === 'swing') {
            subRotate = Math.sin(t * 1.6) * 0.04 * intensity;
          } else if (animSettings.subjectMotion === 'glitch') {
            if (Math.sin(t * 8) > 0.94) {
              subX += (Math.random() - 0.5) * 12 * intensity;
            }
          }

          // Move to subject center
          ctx.translate(subX, subY);
          ctx.rotate(subRotate);
          ctx.scale(subScale, subScale);

          const drawW = targetWidth;
          const drawH = targetHeight;
          const drawX = -drawW / 2;
          const drawY = -drawH / 2;

          // Drop shadow under subject
          if (animSettings.dropShadowOpacity > 0 && cutoutCanvas) {
            ctx.save();
            ctx.shadowColor = animSettings.dropShadowColor || 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 24 * animSettings.dropShadowOpacity;
            ctx.shadowOffsetY = 16 * animSettings.dropShadowOpacity;
            ctx.drawImage(cutoutCanvas, drawX, drawY, drawW, drawH);
            ctx.restore();
          }

          // Rim light glow
          if (animSettings.rimLightIntensity > 0 && cutoutCanvas) {
            ctx.save();
            ctx.shadowColor = animSettings.rimLightColor || 'rgba(255, 255, 255, 0.4)';
            ctx.shadowBlur = 14 * animSettings.rimLightIntensity;
            ctx.drawImage(cutoutCanvas, drawX, drawY, drawW, drawH);
            ctx.restore();
          }

          // Draw the subject itself
          ctx.drawImage(subjectSource, drawX, drawY, drawW, drawH);

          ctx.restore();
        }

        // ==========================================
        // 3. LAYER 3: ATMOSPHERIC PARTICLE OVERLAYS
        // ==========================================
        if (particleSystemRef.current && animSettings.particleEffect !== 'none') {
          particleSystemRef.current.updateAndDraw(ctx, speed);
        }

        ctx.restore();
      };

      // If split view is enabled, draw composite on right and original on left
      if (splitRatio !== null && originalImage) {
        const splitX = Math.round(targetWidth * splitRatio);

        // 1. Draw animated composite on entire canvas
        drawComposite(targetWidth);

        // 2. Draw original image on the left side of split
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, targetHeight);
        ctx.clip();
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        // Draw split divider line
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, targetHeight);
        ctx.stroke();

        // Divider handle pill
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(splitX, targetHeight / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Normal full view
        drawComposite(targetWidth);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    originalImage,
    cutoutCanvas,
    bgSettings,
    animSettings,
    aspectRatio,
    isPlaying,
    mousePos,
    isHovered,
    splitRatio,
    onCanvasReady
  ]);

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Viewport Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-3">
          {/* Aspect Ratio Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
            {(['original', '1:1', '9:16', '16:9'] as AspectRatio[]).map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  aspectRatio === ar
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {ar === 'original' ? 'Original' : ar}
              </button>
            ))}
          </div>

          {/* Split Mode Toggle */}
          <button
            onClick={() => setSplitRatio(splitRatio === null ? 0.5 : null)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              splitRatio !== null
                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold'
                : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{splitRatio !== null ? 'Modo Dividido Activo' : 'Antes / Después'}</span>
          </button>
        </div>

        {/* Right tools: 3D Parallax indicator and play/pause */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Parallax 2.5D: Mueve el cursor
          </span>

          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              isPlaying
                ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                : 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Animar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0, y: 0 });
          setIsDraggingSplit(false);
        }}
        onMouseDown={(e) => {
          if (splitRatio !== null) {
            setIsDraggingSplit(true);
          }
        }}
        onMouseUp={() => setIsDraggingSplit(false)}
        className="relative flex-1 flex items-center justify-center p-4 bg-transparency-grid overflow-hidden select-none cursor-crosshair min-h-[440px]"
      >
        <canvas
          ref={canvasRef}
          className="max-h-[580px] max-w-full rounded-xl shadow-2xl object-contain border border-neutral-800/80 bg-neutral-950"
        />

        {/* Split view labels overlay */}
        {splitRatio !== null && (
          <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur text-neutral-300 border border-neutral-800">
              Original
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-400/90 backdrop-blur text-neutral-950 font-bold border border-amber-300 shadow">
              Fondo Cambiado + Animado
            </span>
          </div>
        )}
      </div>

      {/* Viewport Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-t border-neutral-800 text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <span>Resolución: {canvasRef.current ? `${canvasRef.current.width} × ${canvasRef.current.height}` : '800 × 600'}</span>
          <span>·</span>
          <span>FPS: 60fps GPU</span>
          <span>·</span>
          <span>Movimiento: {animSettings.subjectMotion}</span>
        </div>

        <button
          onClick={() => setMousePos({ x: 0, y: 0 })}
          className="flex items-center gap-1 hover:text-neutral-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Centrar Vista</span>
        </button>
      </div>
    </div>
  );
};
