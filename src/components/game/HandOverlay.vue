<template>
  <canvas
    ref="canvasRef"
    class="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useHandTracking } from '../../composables/useHandTracking';

const canvasRef = ref(null);
const { rawLandmarks, isHandDetected } = useHandTracking();

let ctx = null;
let animationId = null;
let canvasWidth = 0;
let canvasHeight = 0;

// MediaPipe Hands joint connections
const connections = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index Finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle Finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring Finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm connections
  [5, 9], [9, 13], [13, 17]
];

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
};

const drawSkeleton = () => {
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext('2d');
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (isHandDetected.value && rawLandmarks.value.length > 0) {
    const pts = rawLandmarks.value;

    // 1. Draw connecting bones (lines)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#CDB4DB'; // Soft Purple
    ctx.lineCap = 'round';
    
    connections.forEach(([start, end]) => {
      const pt1 = pts[start];
      const pt2 = pts[end];
      
      if (pt1 && pt2) {
        const x1 = (1 - pt1.x) * canvasWidth; // Mirror X
        const y1 = pt1.y * canvasHeight;
        const x2 = (1 - pt2.x) * canvasWidth; // Mirror X
        const y2 = pt2.y * canvasHeight;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // 2. Draw joint nodes (dots)
    pts.forEach((pt, idx) => {
      const px = (1 - pt.x) * canvasWidth; // Mirror X
      const py = pt.y * canvasHeight;

      ctx.beginPath();
      
      let radius = 6;
      let fillStyle = '#6BCBFF'; // Blue joints
      
      if (idx === 8) {
        // INDEX_FINGER_TIP (the target cursor pointer)
        radius = 9;
        fillStyle = '#FF8FAB'; // Pink highlight
        
        // Draw pulse outline for index tip
        ctx.arc(px, py, radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 143, 171, 0.4)';
        ctx.fill();
        ctx.beginPath();
      } else if ([4, 12, 16, 20].includes(idx)) {
        // Other finger tips
        radius = 7;
        fillStyle = '#95E1A3'; // Green tips
      } else if (idx === 0) {
        // Wrist
        radius = 8;
        fillStyle = '#FFD93D'; // Yellow wrist
      }

      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillStyle;
      ctx.strokeStyle = '#1e293b'; // slate-800 border
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
  }

  animationId = requestAnimationFrame(drawSkeleton);
};

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animationId = requestAnimationFrame(drawSkeleton);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  cancelAnimationFrame(animationId);
});
</script>
