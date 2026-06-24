<template>
  <div class="relative w-full h-full">
    <!-- Main interactive canvas -->
    <canvas
      ref="canvasRef"
      class="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useGameEngine } from '../../composables/useGameEngine';

const props = defineProps({
  finger: {
    type: Object,
    default: null // { x, y } normalized
  }
});

const canvasRef = ref(null);
const { currentLevel, activeCheckpointIndex, levelCompleted } = useGameEngine();

let ctx = null;
let animationId = null;
let canvasWidth = 0;
let canvasHeight = 0;

// Visual elements state
const trail = ref([]); // Past finger points for drawing
const particles = ref([]); // Floating pointer particles
const successParticles = ref([]); // Explosive complete particles
let pulseScale = 1;
let pulseDirection = 1;
let gameTime = 0;

// Resize canvas to fill its parent
const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
};

// Spawn trail particles at the finger position
const spawnPointerParticles = (x, y) => {
  for (let i = 0; i < 2; i++) {
    particles.value.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 2, // Drift upwards
      size: Math.random() * 6 + 4,
      color: `hsl(${Math.random() * 360}, 90%, 75%)`,
      alpha: 1,
      decay: Math.random() * 0.03 + 0.02
    });
  }
};

// Spawn explosive particles on completion
const spawnSuccessParticles = () => {
  successParticles.value = [];
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    successParticles.value.push({
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Slight upward force
      size: Math.random() * 12 + 6,
      color: `hsl(${Math.random() * 360}, 95%, 70%)`,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01,
      type: Math.random() > 0.5 ? 'circle' : 'star'
    });
  }
};

// Draw a star shape
const drawStar = (c, cx, cy, spikes, outerRadius, innerRadius, color, alpha) => {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    c.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    c.lineTo(x, y);
    rot += step;
  }
  c.lineTo(cx, cy - outerRadius);
  c.closePath();
  c.fill();
  c.restore();
};

// The main loop
const render = () => {
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext('2d');
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  gameTime += 0.05;
  
  // Pulse animation for active checkpoint
  pulseScale += 0.03 * pulseDirection;
  if (pulseScale > 1.2 || pulseScale < 0.9) {
    pulseDirection *= -1;
  }

  const checkpoints = currentLevel.value.checkpoints;
  const activeIdx = activeCheckpointIndex.value;

  // 1. Draw guidance lines
  if (checkpoints.length > 1) {
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw guidance path background (dashed gray line)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    checkpoints.forEach((cp, idx) => {
      const px = cp.x * canvasWidth;
      const py = cp.y * canvasHeight;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Draw completed segments (solid green)
    if (activeIdx > 0) {
      ctx.strokeStyle = '#95E1A3'; // Mint green
      ctx.beginPath();
      for (let i = 0; i <= activeIdx; i++) {
        const cp = checkpoints[Math.min(i, checkpoints.length - 1)];
        const px = cp.x * canvasWidth;
        const py = cp.y * canvasHeight;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Draw remaining segments (dashed colorful line)
    if (activeIdx < checkpoints.length - 1) {
      ctx.strokeStyle = '#6BCBFF'; // Soft Blue
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      for (let i = activeIdx; i < checkpoints.length; i++) {
        const cp = checkpoints[i];
        const px = cp.x * canvasWidth;
        const py = cp.y * canvasHeight;
        if (i === activeIdx) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset
    }
  }

  // 2. Draw checkpoints
  checkpoints.forEach((cp, idx) => {
    const px = cp.x * canvasWidth;
    const py = cp.y * canvasHeight;
    
    let isCompleted = idx < activeIdx;
    let isActive = idx === activeIdx;
    
    // Draw outer glow/pulse for active
    if (isActive && !levelCompleted.value) {
      ctx.beginPath();
      ctx.arc(px, py, 38 * pulseScale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 217, 61, 0.35)'; // Glow yellow
      ctx.fill();
    }

    // Draw checkpoint bubble
    ctx.beginPath();
    const radius = isActive ? 28 : 24;
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    
    // Borders
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 4;

    // Fills based on status
    if (isCompleted) {
      ctx.fillStyle = '#95E1A3'; // green mint
    } else if (isActive && !levelCompleted.value) {
      ctx.fillStyle = '#FFD93D'; // yellow
    } else {
      ctx.fillStyle = '#FFFFFF'; // white locked
    }
    ctx.fill();
    ctx.stroke();

    // Draw checkpoint text label (number)
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px Fredoka, Nunito';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (isCompleted) {
      ctx.fillText('✓', px, py);
    } else {
      ctx.fillText(idx + 1, px, py);
    }
  });

  // 3. Draw user drawing trail
  if (trail.value.length > 1) {
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 143, 171, 0.6)'; // Semi-transparent pink trail
    ctx.beginPath();
    trail.value.forEach((pt, idx) => {
      const px = pt.x * canvasWidth;
      const py = pt.y * canvasHeight;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Draw trail joints
    trail.value.forEach((pt, idx) => {
      const px = pt.x * canvasWidth;
      const py = pt.y * canvasHeight;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 143, 171, ${0.2 + (idx / trail.value.length) * 0.8})`;
      ctx.fill();
    });
  }

  // 4. Draw pointer particles
  particles.value.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    
    if (p.alpha <= 0) {
      particles.value.splice(idx, 1);
      return;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  });

  // 5. Draw finger pointer
  if (props.finger && !levelCompleted.value) {
    const fx = props.finger.x * canvasWidth;
    const fy = props.finger.y * canvasHeight;

    // Glowing pointer ring
    ctx.beginPath();
    ctx.arc(fx, fy, 16 + Math.sin(gameTime * 2) * 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 143, 171, 0.4)';
    ctx.fill();

    // Core pointer point
    ctx.beginPath();
    ctx.arc(fx, fy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FF8FAB'; // Pink
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    // Add star icon at pointer center
    drawStar(ctx, fx, fy, 5, 6, 2, '#FFFFFF', 1.0);
  }

  // 6. Draw completion success particles
  if (levelCompleted.value) {
    successParticles.value.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        successParticles.value.splice(idx, 1);
        return;
      }

      if (p.type === 'star') {
        drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2, p.color, p.alpha);
      } else {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  animationId = requestAnimationFrame(render);
};

// Watch finger coordinates to update trail history
watch(() => props.finger, (newVal) => {
  if (newVal) {
    const px = newVal.x * canvasWidth;
    const py = newVal.y * canvasHeight;
    
    trail.value.push({ x: newVal.x, y: newVal.y });
    if (trail.value.length > 25) {
      trail.value.shift();
    }
    
    spawnPointerParticles(px, py);
  } else {
    // Fade out trail when hand lost
    if (trail.value.length > 0) {
      trail.value.shift();
    }
  }
}, { deep: true });

// Watch level changes to spawn success explosion
watch(levelCompleted, (isDone) => {
  if (isDone) {
    spawnSuccessParticles();
    trail.value = [];
  }
});

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animationId = requestAnimationFrame(render);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  cancelAnimationFrame(animationId);
});
</script>
