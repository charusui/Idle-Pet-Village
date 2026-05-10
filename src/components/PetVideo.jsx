import { useEffect, useRef } from 'react';
import { getPetVideoPath } from '../data/gameData';

export default function PetVideo({ species, stage, size = 120 }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const src = getPetVideoPath(species, stage);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationId;

    const processFrame = () => {
      if (video.paused || video.ended || video.readyState < 2) {
        animationId = requestAnimationFrame(processFrame);
        return;
      }

      const w = video.videoWidth || size;
      const h = video.videoHeight || size;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      try {
        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // Flood-fill transparency from corners
        // Using a slightly lower threshold (200) to catch off-white backgrounds
        const threshold = 200; 
        const stack = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
        const visited = new Uint8Array(w * h);

        while (stack.length > 0) {
          const [x, y] = stack.pop();
          const idx = y * w + x;
          if (x < 0 || x >= w || y < 0 || y >= h || visited[idx]) continue;
          visited[idx] = 1;

          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];

          // If pixel is light enough, make it transparent and check neighbors
          if (r > threshold && g > threshold && b > threshold) {
            data[p + 3] = 0;
            stack.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (e) {
        // Fallback: if getImageData fails (CORS), at least show the video
        ctx.drawImage(video, 0, 0, w, h);
      }
      
      animationId = requestAnimationFrame(processFrame);
    };

    video.play().catch(() => {});
    processFrame();

    return () => cancelAnimationFrame(animationId);
  }, [src, size]);

  return (
    <div className="pet-video-container" style={{ width: size, height: size }}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="pet-video"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
