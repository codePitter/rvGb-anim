import { CutoutSettings } from '../types/studio';

/**
 * Computes color distance in RGB space
 */
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Automatically segments the subject from the background using smart border sampling,
 * color delta clustering, saliency center weighting, and edge feathering.
 */
export function processImageCutout(
  imageElement: HTMLImageElement,
  settings: CutoutSettings
): Promise<{
  cutoutCanvas: HTMLCanvasElement;
  cutoutDataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve) => {
    const width = imageElement.naturalWidth || imageElement.width || 800;
    const height = imageElement.naturalHeight || imageElement.height || 600;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      resolve({ cutoutCanvas: canvas, cutoutDataUrl: '', width, height });
      return;
    }

    ctx.drawImage(imageElement, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // 1. Sample perimeter border colors (top, bottom, left, right)
    const samples: [number, number, number][] = [];
    const stepX = Math.max(1, Math.floor(width / 40));
    const stepY = Math.max(1, Math.floor(height / 40));

    // Sample top and bottom rows
    for (let x = 0; x < width; x += stepX) {
      const topIdx = (x) * 4;
      samples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
      const botIdx = ((height - 1) * width + x) * 4;
      samples.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
    }
    // Sample left and right columns
    for (let y = 0; y < height; y += stepY) {
      const leftIdx = (y * width) * 4;
      samples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
      const rightIdx = (y * width + (width - 1)) * 4;
      samples.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
    }

    // Calculate primary background clusters or mean
    let meanR = 0, meanG = 0, meanB = 0;
    for (const [r, g, b] of samples) {
      meanR += r;
      meanG += g;
      meanB += b;
    }
    meanR /= samples.length;
    meanG /= samples.length;
    meanB /= samples.length;

    // Compute standard deviation of background sample
    let variance = 0;
    for (const [r, g, b] of samples) {
      const dist = colorDistance(r, g, b, meanR, meanG, meanB);
      variance += dist * dist;
    }
    const stdDev = Math.sqrt(variance / samples.length);

    // Dynamic threshold based on user sensitivity
    // sensitivity is 10 (conservative) to 90 (aggressive)
    const baseTolerance = (settings.sensitivity / 50) * Math.max(38, stdDev * 1.8);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

    const mask = new Float32Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Minimum distance to any of the sample clusters (corners + mean)
        let minDist = colorDistance(r, g, b, meanR, meanG, meanB);
        for (let s = 0; s < Math.min(samples.length, 25); s += 3) {
          const d = colorDistance(r, g, b, samples[s][0], samples[s][1], samples[s][2]);
          if (d < minDist) minDist = d;
        }

        // Center saliency bias: objects closer to center are more likely to be subject
        const dx = x - centerX;
        const dy = y - centerY;
        const distToCenter = Math.sqrt(dx * dx + dy * dy) / maxRadius;
        const saliencyBoost = (1 - distToCenter * 0.45);

        // Alpha calculation
        const effectiveTolerance = baseTolerance * (1 + (1 - saliencyBoost) * 0.3);
        let alpha = 1;

        if (minDist < effectiveTolerance * 0.7) {
          alpha = 0;
        } else if (minDist < effectiveTolerance * 1.3) {
          // Soft transition edge
          alpha = (minDist - effectiveTolerance * 0.7) / (effectiveTolerance * 0.6);
        } else {
          alpha = 1;
        }

        // Edge fade on the absolute outer 3 pixels to prevent perimeter leaks
        if (x <= 1 || x >= width - 2 || y <= 1 || y >= height - 2) {
          if (minDist < effectiveTolerance * 1.5) {
            alpha = 0;
          }
        }

        mask[y * width + x] = settings.invertMask ? (1 - alpha) : alpha;
      }
    }

    // Apply feathering / edge smoothing if feather > 0
    const featherRadius = Math.max(0, Math.min(8, Math.round(settings.edgeFeather)));
    let finalMask = mask;

    if (featherRadius > 0) {
      finalMask = new Float32Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0;
          let count = 0;
          for (let fy = -featherRadius; fy <= featherRadius; fy++) {
            const ny = y + fy;
            if (ny < 0 || ny >= height) continue;
            for (let fx = -featherRadius; fx <= featherRadius; fx++) {
              const nx = x + fx;
              if (nx < 0 || nx >= width) continue;
              sum += mask[ny * width + nx];
              count++;
            }
          }
          finalMask[y * width + x] = sum / count;
        }
      }
    }

    // Apply mask to original image pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        let m = finalMask[y * width + x];

        // Contrast boost on the alpha channel
        if (settings.contrastBoost > 0) {
          const factor = 1 + (settings.contrastBoost / 25);
          m = Math.min(1, Math.max(0, (m - 0.5) * factor + 0.5));
        }

        data[i + 3] = Math.round(data[i + 3] * m);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const cutoutDataUrl = canvas.toDataURL('image/png');
    resolve({
      cutoutCanvas: canvas,
      cutoutDataUrl,
      width,
      height
    });
  });
}
