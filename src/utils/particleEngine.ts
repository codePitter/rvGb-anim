import { ParticleEffect } from '../types/studio';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  phase: number;
  pulseSpeed: number;
  rotation?: number;
  rotSpeed?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private type: ParticleEffect = 'none';
  private width = 800;
  private height = 600;

  constructor(width: number, height: number, type: ParticleEffect) {
    this.width = width;
    this.height = height;
    this.setType(type);
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public setType(type: ParticleEffect) {
    if (this.type === type && this.particles.length > 0) return;
    this.type = type;
    this.particles = [];
    this.initParticles();
  }

  private initParticles() {
    if (this.type === 'none') return;

    const count = this.type === 'cyber_rain' ? 80 : this.type === 'golden_sparkles' ? 45 : 35;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(randomY = false): Particle {
    const x = Math.random() * this.width;
    const y = randomY ? Math.random() * this.height : (this.type === 'fire_embers' || this.type === 'hearts' ? this.height + 10 : -10);

    let vx = (Math.random() - 0.5) * 0.5;
    let vy = 1;
    let size = 3;
    let color = '#fff';
    let maxAlpha = 0.8;
    const pulseSpeed = 0.02 + Math.random() * 0.04;

    switch (this.type) {
      case 'golden_sparkles':
        size = 2 + Math.random() * 5;
        vx = (Math.random() - 0.5) * 0.6;
        vy = -0.3 - Math.random() * 0.6;
        color = Math.random() > 0.4 ? '#fcd34d' : '#fef08a';
        maxAlpha = 0.7 + Math.random() * 0.3;
        break;

      case 'snow_fall':
        size = 2 + Math.random() * 4;
        vx = (Math.random() - 0.5) * 0.8 + 0.3;
        vy = 0.8 + Math.random() * 1.5;
        color = '#ffffff';
        maxAlpha = 0.6 + Math.random() * 0.35;
        break;

      case 'cyber_rain':
        size = 1.5;
        vx = -0.5 - Math.random() * 0.5;
        vy = 12 + Math.random() * 8;
        color = Math.random() > 0.5 ? '#38bdf8' : '#a855f7';
        maxAlpha = 0.5 + Math.random() * 0.4;
        break;

      case 'fireflies':
        size = 3 + Math.random() * 3.5;
        vx = (Math.random() - 0.5) * 0.8;
        vy = (Math.random() - 0.5) * 0.8;
        color = '#a3e635';
        maxAlpha = 0.85;
        break;

      case 'hearts':
        size = 10 + Math.random() * 12;
        vx = (Math.random() - 0.5) * 0.8;
        vy = -0.8 - Math.random() * 1.2;
        color = Math.random() > 0.3 ? '#f43f5e' : '#fb7185';
        maxAlpha = 0.75;
        break;

      case 'fire_embers':
        size = 2 + Math.random() * 4;
        vx = (Math.random() - 0.5) * 1.5;
        vy = -1.5 - Math.random() * 2.2;
        color = Math.random() > 0.4 ? '#f97316' : '#ef4444';
        maxAlpha = 0.85;
        break;
    }

    return {
      x,
      y,
      vx,
      vy,
      size,
      alpha: Math.random() * maxAlpha,
      maxAlpha,
      color,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.05
    };
  }

  public updateAndDraw(ctx: CanvasRenderingContext2D, speed = 1) {
    if (this.type === 'none') return;

    ctx.save();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.phase += p.pulseSpeed * speed;
      p.alpha = (Math.sin(p.phase) * 0.5 + 0.5) * p.maxAlpha;

      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * speed;
      }

      // Check boundaries
      const isDead =
        p.y > this.height + 20 ||
        p.y < -20 ||
        p.x < -20 ||
        p.x > this.width + 20;

      if (isDead) {
        this.particles[i] = this.createParticle(false);
        continue;
      }

      // Draw particle based on type
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (this.type === 'golden_sparkles') {
        // Draw 4-point sparkle star
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s * 2);
        ctx.quadraticCurveTo(0, 0, s * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, s * 2);
        ctx.quadraticCurveTo(0, 0, -s * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s * 2);
        ctx.fill();
        ctx.restore();
      } else if (this.type === 'cyber_rain') {
        // Draw rain streak
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 2);
        ctx.stroke();
      } else if (this.type === 'hearts') {
        // Draw small heart
        ctx.save();
        ctx.translate(p.x, p.y);
        const s = p.size / 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-5 * s, -10 * s, -15 * s, -5 * s, 0, 10 * s);
        ctx.bezierCurveTo(15 * s, -5 * s, 5 * s, -10 * s, 0, 0);
        ctx.fill();
        ctx.restore();
      } else if (this.type === 'fireflies') {
        // Glowing orb with soft halo
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        grad.addColorStop(0, '#bef264');
        grad.addColorStop(0.4, 'rgba(163, 230, 53, 0.4)');
        grad.addColorStop(1, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard soft circle (snow / fire embers)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
