/**
 * Exports a given HTMLCanvasElement to a WebM/MP4 video by capturing its live stream
 * through MediaRecorder.
 */
export function recordCanvasVideo(
  canvas: HTMLCanvasElement,
  durationSeconds = 5,
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const stream = canvas.captureStream(30);

      // Determine best supported mimeType
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];

      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime, videoBitsPerSecond: 4000000 })
        : new MediaRecorder(stream);

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        resolve(videoBlob);
      };

      recorder.onerror = (e) => {
        reject(e);
      };

      recorder.start(100);

      const startTime = performance.now();
      const totalMs = durationSeconds * 1000;

      const interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(100, Math.round((elapsed / totalMs) * 100));
        if (onProgress) onProgress(progress);

        if (elapsed >= totalMs) {
          clearInterval(interval);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Downloads a Blob or DataURL directly as a file in the browser
 */
export function triggerFileDownload(urlOrBlob: string | Blob, filename: string) {
  const url = typeof urlOrBlob === 'string' ? urlOrBlob : URL.createObjectURL(urlOrBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (typeof urlOrBlob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
