import { BackgroundPreset, ImageAsset } from '../types/studio';

export const SAMPLE_IMAGES: ImageAsset[] = [
  {
    id: 'portrait-woman',
    name: 'Retrato de Moda',
    url: '/src/assets/images/sample_portrait_woman_1793991656405.jpg',
    thumbnail: '/src/assets/images/sample_portrait_woman_1793991656405.jpg',
    category: 'Personas',
    description: 'Retrato de estudio con traje sastre y excelente separación de sujeto.'
  },
  {
    id: 'vintage-car',
    name: 'Auto Clásico Rojo',
    url: '/src/assets/images/sample_vintage_car_1793991657557.jpg',
    thumbnail: '/src/assets/images/sample_vintage_car_1793991657557.jpg',
    category: 'Vehículos',
    description: 'Auto deportivo clásico con reflejos nítidos y carrocería roja.'
  },
  {
    id: 'playful-cat',
    name: 'Gato Naranja',
    url: '/src/assets/images/sample_playful_cat_1793991657881.jpg',
    thumbnail: '/src/assets/images/sample_playful_cat_1793991657881.jpg',
    category: 'Mascotas',
    description: 'Gato esponjoso con detalle fino en pelaje y bigotes.'
  },
  {
    id: 'futuristic-robot',
    name: 'Robot Androide',
    url: '/src/assets/images/sample_futuristic_robot_1793991657470.jpg',
    thumbnail: '/src/assets/images/sample_futuristic_robot_1793991657470.jpg',
    category: 'Ciencia Ficción',
    description: 'Diseño mecatrónico cromado con iluminación de estudio.'
  }
];

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'studio-softbox',
    name: 'Estudio Profesional Minimal',
    category: 'studio',
    previewStyle: 'radial-gradient(circle at 50% 35%, #383838 0%, #151515 80%)',
    cssBackground: 'radial-gradient(ellipse at 50% 40%, #3a3a40 0%, #141417 75%, #0a0a0c 100%)',
    lightingHint: {
      tintColor: 'rgba(255, 255, 255, 0.05)',
      shadowColor: 'rgba(0, 0, 0, 0.7)',
      rimGlowColor: 'rgba(220, 220, 255, 0.25)'
    }
  },
  {
    id: 'cyber-neon',
    name: 'Metrópolis Cyberpunk',
    category: 'urban',
    previewStyle: 'linear-gradient(135deg, #090014 0%, #180033 45%, #00f2fe 100%)',
    cssBackground: 'radial-gradient(circle at 80% 20%, rgba(255, 0, 128, 0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(0, 242, 254, 0.35) 0%, transparent 60%), linear-gradient(180deg, #050510 0%, #100a26 60%, #030008 100%)',
    lightingHint: {
      tintColor: 'rgba(255, 0, 128, 0.08)',
      shadowColor: 'rgba(5, 0, 20, 0.85)',
      rimGlowColor: 'rgba(0, 242, 254, 0.5)'
    }
  },
  {
    id: 'golden-sunset',
    name: 'Atardecer Dorado',
    category: 'nature',
    previewStyle: 'linear-gradient(180deg, #ff5e36 0%, #feb47b 60%, #301934 100%)',
    cssBackground: 'radial-gradient(circle at 50% 70%, #ffdf7a 0%, #ff7b39 35%, #801d52 75%, #1f0b2a 100%)',
    lightingHint: {
      tintColor: 'rgba(255, 170, 50, 0.15)',
      shadowColor: 'rgba(40, 10, 25, 0.8)',
      rimGlowColor: 'rgba(255, 200, 100, 0.65)'
    }
  },
  {
    id: 'deep-space',
    name: 'Nebulosa Cósmica',
    category: 'fantasy',
    previewStyle: 'radial-gradient(circle at 40% 40%, #6b11ff 0%, #08001a 80%)',
    cssBackground: 'radial-gradient(ellipse at 70% 30%, rgba(138, 43, 226, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 25% 75%, rgba(0, 212, 255, 0.3) 0%, transparent 55%), linear-gradient(135deg, #03000a 0%, #0c021f 50%, #010005 100%)',
    lightingHint: {
      tintColor: 'rgba(160, 60, 255, 0.1)',
      shadowColor: 'rgba(0, 0, 0, 0.9)',
      rimGlowColor: 'rgba(180, 100, 255, 0.55)'
    }
  },
  {
    id: 'emerald-forest',
    name: 'Bosque Místico',
    category: 'nature',
    previewStyle: 'linear-gradient(180deg, #0a2618 0%, #174229 50%, #05120a 100%)',
    cssBackground: 'radial-gradient(ellipse at 50% 20%, rgba(120, 240, 180, 0.25) 0%, transparent 65%), linear-gradient(180deg, #0d2919 0%, #153b26 50%, #040f08 100%)',
    lightingHint: {
      tintColor: 'rgba(80, 220, 140, 0.08)',
      shadowColor: 'rgba(2, 12, 6, 0.85)',
      rimGlowColor: 'rgba(130, 255, 180, 0.45)'
    }
  },
  {
    id: 'luxury-travertine',
    name: 'Galería Mármol Cálido',
    category: 'minimal',
    previewStyle: 'linear-gradient(135deg, #d8d0c5 0%, #b8aca0 100%)',
    cssBackground: 'radial-gradient(ellipse at 35% 30%, #eee8e0 0%, #c8bea8 60%, #9e927c 100%)',
    lightingHint: {
      tintColor: 'rgba(240, 230, 210, 0.12)',
      shadowColor: 'rgba(50, 42, 35, 0.65)',
      rimGlowColor: 'rgba(255, 250, 235, 0.4)'
    }
  },
  {
    id: 'theatre-velvet',
    name: 'Foco de Escenario Rojo',
    category: 'studio',
    previewStyle: 'radial-gradient(circle at 50% 30%, #8b0000 0%, #1a0000 90%)',
    cssBackground: 'radial-gradient(ellipse at 50% 25%, #a40606 0%, #4a0000 55%, #120000 95%)',
    lightingHint: {
      tintColor: 'rgba(255, 50, 50, 0.1)',
      shadowColor: 'rgba(15, 0, 0, 0.9)',
      rimGlowColor: 'rgba(255, 120, 120, 0.55)'
    }
  },
  {
    id: 'cyber-grid',
    name: 'Cuadrícula Tron Sci-Fi',
    category: 'urban',
    previewStyle: 'linear-gradient(180deg, #010a15 0%, #003049 100%)',
    cssBackground: 'linear-gradient(180deg, #020b14 0%, #051e36 60%, #01060c 100%)',
    lightingHint: {
      tintColor: 'rgba(0, 180, 255, 0.1)',
      shadowColor: 'rgba(1, 10, 20, 0.9)',
      rimGlowColor: 'rgba(64, 224, 255, 0.6)'
    }
  }
];

export const GRADIENT_PRESETS = [
  { name: 'Aurora Azul', css: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' },
  { name: 'Fuego Púrpura', css: 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #be123c 100%)' },
  { name: 'Menta Eléctrico', css: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)' },
  { name: 'Obsidiana Grafito', css: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)' },
  { name: 'Crepúsculo Violeta', css: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #7e22ce 100%)' },
  { name: 'Sol Poniente', css: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)' },
  { name: 'Neón Aqua', css: 'linear-gradient(135deg, #083344 0%, #0e7490 50%, #06b6d4 100%)' },
  { name: 'Platino Puro', css: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' }
];

export const SOLID_COLOR_PRESETS = [
  '#000000',
  '#0f172a',
  '#18181b',
  '#ffffff',
  '#e2e8f0',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899'
];
