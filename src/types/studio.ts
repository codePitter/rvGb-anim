export type SubjectAnimation =
  | 'none'
  | 'float'
  | 'breathe'
  | 'parallax_3d'
  | 'wiggle'
  | 'zoom_punch'
  | 'glitch'
  | 'swing';

export type BackgroundAnimation =
  | 'none'
  | 'ken_burns'
  | 'slow_rotate'
  | 'ambient_pulse'
  | 'color_wave';

export type ParticleEffect =
  | 'none'
  | 'golden_sparkles'
  | 'snow_fall'
  | 'cyber_rain'
  | 'fireflies'
  | 'hearts'
  | 'fire_embers';

export type BackgroundType =
  | 'preset'
  | 'color'
  | 'gradient'
  | 'blur_original'
  | 'custom_image'
  | 'transparent';

export type AspectRatio = 'original' | '1:1' | '9:16' | '16:9' | '4:5';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'studio' | 'nature' | 'urban' | 'fantasy' | 'minimal';
  previewStyle: string; // CSS background style or gradient
  cssBackground: string;
  lightingHint: {
    tintColor: string;
    shadowColor: string;
    rimGlowColor: string;
  };
}

export interface AnimationSettings {
  subjectMotion: SubjectAnimation;
  backgroundMotion: BackgroundAnimation;
  particleEffect: ParticleEffect;
  speed: number; // 0.2 to 2.5
  intensity: number; // 0.2 to 2.0
  parallaxStrength: number; // 0 to 1.5
  depthSeparation: number; // 0 to 60px
  dropShadowBlur: number; // 0 to 50px
  dropShadowOpacity: number; // 0 to 1
  dropShadowColor: string;
  rimLightIntensity: number; // 0 to 1
  rimLightColor: string;
}

export interface CutoutSettings {
  autoCutout: boolean;
  sensitivity: number; // 10 to 90
  edgeFeather: number; // 0 to 8
  contrastBoost: number; // 0 to 40
  invertMask: boolean;
}

export interface BackgroundSettings {
  type: BackgroundType;
  presetId: string;
  solidColor: string;
  gradientIndex: number;
  customImageUrl: string | null;
  blurOriginalRadius: number; // 0 to 40
}

export interface ImageAsset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: string;
  description: string;
}
