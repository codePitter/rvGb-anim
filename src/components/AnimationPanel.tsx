import React from 'react';
import { AnimationSettings, SubjectAnimation, BackgroundAnimation, ParticleEffect } from '../types/studio';
import { Film, Play, Sparkles, Orbit, Compass, Move, Flame, CloudSnow, CloudRain, Heart } from 'lucide-react';

interface AnimationPanelProps {
  settings: AnimationSettings;
  onChangeSettings: (newSettings: Partial<AnimationSettings>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const AnimationPanel: React.FC<AnimationPanelProps> = ({
  settings,
  onChangeSettings,
  isPlaying,
  onTogglePlay
}) => {
  const SUBJECT_MOTIONS: { id: SubjectAnimation; name: string; desc: string }[] = [
    { id: 'float', name: 'Flotación Suave', desc: 'Levitación orgánica con sincronía de sombra' },
    { id: 'parallax_3d', name: 'Parallax 3D Vivo', desc: 'Separación holográfica 2.5D que responde al cursor' },
    { id: 'breathe', name: 'Respiración / Pulso', desc: 'Dilatación sutil para dar vida y presencia' },
    { id: 'wiggle', name: 'Ritmo / Wiggle', desc: 'Balanceo rítmico alegre de lado a lado' },
    { id: 'zoom_punch', name: 'Zoom Punch', desc: 'Acercamiento dramático continuo estilo tráiler' },
    { id: 'swing', name: 'Péndulo Sutil', desc: 'Inclinación pendular armónica' },
    { id: 'glitch', name: 'Glitch Sci-Fi', desc: 'Distorsión holográfica intermitente' },
    { id: 'none', name: 'Estático', desc: 'Sin animación en el sujeto' }
  ];

  const BACKGROUND_MOTIONS: { id: BackgroundAnimation; name: string }[] = [
    { id: 'ken_burns', name: 'Ken Burns Dinámico' },
    { id: 'slow_rotate', name: 'Giro Astral Suave' },
    { id: 'ambient_pulse', name: 'Pulso de Luz' },
    { id: 'color_wave', name: 'Marea de Color' },
    { id: 'none', name: 'Fondo Fijo' }
  ];

  const PARTICLE_FX: { id: ParticleEffect; name: string; icon: React.ReactNode }[] = [
    { id: 'golden_sparkles', name: 'Destellos de Oro', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'snow_fall', name: 'Nieve Cinemática', icon: <CloudSnow className="w-3.5 h-3.5 text-blue-300" /> },
    { id: 'cyber_rain', name: 'Lluvia Cyber Neón', icon: <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'fireflies', name: 'Luciérnagas Místicas', icon: <Orbit className="w-3.5 h-3.5 text-lime-400" /> },
    { id: 'fire_embers', name: 'Brasas Ardientes', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
    { id: 'hearts', name: 'Corazones Flotantes', icon: <Heart className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'none', name: 'Sin Partículas', icon: <Move className="w-3.5 h-3.5 text-neutral-500" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span>Motor de Animación 2.5D</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dale movimiento tridimensional al sujeto, fondo y atmósfera.
          </p>
        </div>

        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPlaying
              ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
              : 'bg-amber-400 text-neutral-950 shadow-sm'
          }`}
        >
          <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-neutral-200' : 'fill-neutral-950'}`} />
          <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
        </button>
      </div>

      {/* 1. Movimiento del Sujeto */}
      <div>
        <span className="text-xs font-medium text-neutral-300 block mb-2">
          1. Movimiento del Sujeto
        </span>
        <div className="grid grid-cols-2 gap-2">
          {SUBJECT_MOTIONS.map((item) => {
            const isSelected = settings.subjectMotion === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeSettings({ subjectMotion: item.id })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-neutral-900 ring-2 ring-amber-400/30'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-amber-400' : 'text-neutral-200'}`}>
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 block line-clamp-1 mt-0.5">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Movimiento de Fondo */}
      <div>
        <span className="text-xs font-medium text-neutral-300 block mb-2">
          2. Animación de Fondo
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {BACKGROUND_MOTIONS.map((item) => {
            const isSelected = settings.backgroundMotion === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeSettings({ backgroundMotion: item.id })}
                className={`px-3 py-2 rounded-lg border text-left text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-neutral-900 text-amber-400'
                    : 'border-neutral-800 text-neutral-300 hover:border-neutral-700 bg-neutral-900/40'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Partículas & Efectos Atmosféricos */}
      <div>
        <span className="text-xs font-medium text-neutral-300 block mb-2">
          3. Partículas Atmosféricas (Overlays)
        </span>
        <div className="grid grid-cols-2 gap-2">
          {PARTICLE_FX.map((item) => {
            const isSelected = settings.particleEffect === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeSettings({ particleEffect: item.id })}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-neutral-900 text-amber-400'
                    : 'border-neutral-800 text-neutral-300 hover:border-neutral-700 bg-neutral-900/40'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders de Control */}
      <div className="pt-3 border-t border-neutral-800 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-300 font-medium">Velocidad de Movimiento</span>
            <span className="text-neutral-400 font-mono text-[11px]">{settings.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={settings.speed}
            onChange={(e) => onChangeSettings({ speed: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-300 font-medium">Intensidad / Amplitud</span>
            <span className="text-neutral-400 font-mono text-[11px]">{settings.intensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.0"
            step="0.1"
            value={settings.intensity}
            onChange={(e) => onChangeSettings({ intensity: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-300 font-medium">Profundidad 3D (Parallax)</span>
            <span className="text-neutral-400 font-mono text-[11px]">{settings.parallaxStrength.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={settings.parallaxStrength}
            onChange={(e) => onChangeSettings({ parallaxStrength: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-neutral-400 block mt-1">
            Mueve el mouse sobre el lienzo para experimentar la separación de capas en 3D.
          </span>
        </div>
      </div>
    </div>
  );
};
