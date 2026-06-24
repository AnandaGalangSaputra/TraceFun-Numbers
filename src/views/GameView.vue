<template>
  <div class="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-2 md:p-4">
    
    <!-- Game Viewport (Left - Span 8 columns) -->
    <div class="lg:col-span-8 flex flex-col items-center">
      
      <!-- Video and Canvas Container -->
      <div class="relative w-full aspect-[4/3] border-4 border-slate-800 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-bubbly">
        
        <!-- Raw video stream -->
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
        ></video>

        <!-- Skeleton hand tracker overlay -->
        <HandOverlay v-if="cameraStatus === 'active'" />

        <!-- Drawing trail, checkpoints, and cursor overlay -->
        <TraceCanvas 
          v-if="cameraStatus === 'active'" 
          :finger="indexFinger"
        />

        <!-- Game States Overlays (Uninitialized camera, missing hand) -->
        <div 
          v-if="cameraStatus === 'loading'" 
          class="absolute inset-0 bg-slate-900/90 flex flex-col justify-center items-center text-white z-40 text-center"
        >
          <div class="w-12 h-12 rounded-full border-4 border-slate-600 border-t-brand-blue animate-spin mb-4"></div>
          <p class="font-bubble text-lg">Menyiapkan kamera...</p>
        </div>

        <div 
          v-else-if="cameraStatus !== 'active'" 
          class="absolute inset-0 bg-slate-900/95 flex flex-col justify-center items-center text-white z-40 text-center p-6"
        >
          <span class="text-5xl mb-3">⚠️</span>
          <p class="font-bubble text-lg text-brand-pink font-bold">Kamera Terputus</p>
          <p class="text-sm font-sans text-slate-400 mt-1 mb-4">Pastikan browser Anda diizinkan untuk membuka webcam.</p>
          <AppButton variant="pink" size="sm" @click="initCameraAndGame">Hubungkan Kembali</AppButton>
        </div>

        <!-- Off-Track Instruction Banner -->
        <transition name="fade">
          <div 
            v-if="isOffTrack && !levelCompleted"
            class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-brand-pink border-2 border-slate-800 text-slate-800 font-bubble px-6 py-2.5 rounded-full shadow-bubbly-pink text-center z-30 flex items-center gap-2 animate-bounce"
          >
            <span>✏️</span>
            <span>Ikuti garis ya!</span>
          </div>
        </transition>

        <!-- Level Success / Celebratory Modal Overlay -->
        <transition name="scale-fade">
          <div 
            v-if="levelCompleted"
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-30"
          >
            <div class="bg-[#FFFDF9] border-4 border-slate-800 rounded-[2rem] p-6 shadow-bubbly text-center max-w-xs w-full animate-scale-up">
              <span class="text-5xl block animate-bounce mb-3">✨🎉✨</span>
              <h3 class="font-bubble text-slate-800 text-3xl font-bold mb-1">
                {{ feedbackText || 'Hebat!' }}
              </h3>
              <p class="font-bubble text-brand-blue text-sm uppercase mb-4">Angka {{ currentLevel.label }} Selesai</p>
              
              <!-- Stars for this level -->
              <div class="flex gap-2 justify-center mb-1">
                <span 
                  v-for="s in 3" 
                  :key="s" 
                  :class="['text-3xl transition-opacity', s <= levelStars ? 'opacity-100 scale-110' : 'opacity-25']"
                >
                  ⭐
                </span>
              </div>
            </div>
          </div>
        </transition>

        <!-- Dynamic Feedback Text Popup -->
        <transition name="pop-fade">
          <div 
            v-if="feedbackText && !levelCompleted"
            class="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-yellow border-2 border-slate-800 text-slate-800 font-bubble text-3xl py-2 px-6 rounded-2xl shadow-bubbly-yellow z-30"
          >
            {{ feedbackText }}
          </div>
        </transition>

        <!-- Hand Lost Reminder Overlay -->
        <transition name="fade">
          <div 
            v-if="cameraStatus === 'active' && !isHandDetected && !levelCompleted"
            class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/85 backdrop-blur-xs text-white rounded-full px-5 py-2 flex items-center gap-3 z-30 text-xs font-sans border border-slate-700 shadow"
          >
            <span class="animate-pulse">👋</span>
            <span>Arahkan telunjuk Anda ke depan kamera untuk mulai menggambar...</span>
          </div>
        </transition>

      </div>
    </div>

    <!-- HUD Control Sidebar (Right - Span 4 columns) -->
    <div class="lg:col-span-4 flex flex-col gap-4">
      <GameHUD 
        @pause="handlePause"
        @retry="handleRetry"
        @exit="handleExit"
      />
    </div>

    <!-- Pause Modal Menu Overlay -->
    <transition name="fade">
      <div 
        v-if="gameStatus === 'paused'" 
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <AppCard class="max-w-xs w-full text-center p-8 animate-scale-up" variant="purple">
          <span class="text-5xl block mb-4">⏸️</span>
          <h2 class="font-bubble text-slate-800 text-3xl mb-6">Permainan Dihentikan</h2>
          
          <div class="flex flex-col gap-4">
            <AppButton variant="yellow" size="md" class="w-full" @click="handleResume">
              ▶️ Lanjut Main
            </AppButton>
            <AppButton variant="purple" size="md" class="w-full" @click="handleRetry">
              🔄 Ulang Level
            </AppButton>
            <AppButton variant="disabled" size="md" class="w-full !bg-white hover:!bg-slate-100 !text-slate-700 !border-slate-800 shadow-bubbly" @click="handleExit">
              🏠 Menu Utama
            </AppButton>
          </div>
        </AppCard>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCamera } from '../composables/useCamera';
import { useHandTracking } from '../composables/useHandTracking';
import { useGameEngine } from '../composables/useGameEngine';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';
import HandOverlay from '../components/game/HandOverlay.vue';
import TraceCanvas from '../components/game/TraceCanvas.vue';
import GameHUD from '../components/game/GameHUD.vue';

const router = useRouter();

const { activeStream, cameraStatus, startCamera, stopCamera } = useCamera();
const { indexFinger, isHandDetected, initHandTracking, processFrame, resetTracking } = useHandTracking();
const {
  gameStatus,
  currentLevel,
  activeCheckpointIndex,
  isOffTrack,
  levelCompleted,
  levelStars,
  feedbackText,
  checkCollision,
  startTimer,
  stopTimer,
  pauseGame,
  resumeGame,
  resetGame
} = useGameEngine();

const videoRef = ref(null);
let animationFrameId = null;
let loopActive = false;

// Request permissions, bootstrap webcam stream, and initialize the game session
const initCameraAndGame = async () => {
  resetGame();
  try {
    const stream = await startCamera();
    if (stream && videoRef.value) {
      videoRef.value.srcObject = stream;
    }
    startTimer();
  } catch (err) {
    console.error('Camera startup failed in GameView:', err);
  }
};

// Continuous hand frame tracking loop
const runTrackingLoop = async () => {
  if (!loopActive) return;

  if (videoRef.value && cameraStatus.value === 'active' && videoRef.value.readyState >= 2) {
    // 1. Process webcam picture to gather coordinates
    await processFrame(videoRef.value);
    
    // 2. Feed coordinates into game collision loop
    if (indexFinger.value && gameStatus.value === 'playing') {
      checkCollision(indexFinger.value);
    }
  }

  animationFrameId = requestAnimationFrame(runTrackingLoop);
};

// Listen to stream updates
watch(activeStream, (newStream) => {
  if (videoRef.value && newStream) {
    videoRef.value.srcObject = newStream;
  }
});

// Watch gameStatus: redirect when game finished
watch(gameStatus, (newStatus) => {
  if (newStatus === 'finished') {
    router.push('/result');
  }
});

onMounted(() => {
  initHandTracking();
  initCameraAndGame();
  
  loopActive = true;
  animationFrameId = requestAnimationFrame(runTrackingLoop);
});

onUnmounted(() => {
  loopActive = false;
  cancelAnimationFrame(animationFrameId);
  stopCamera();
  stopTimer();
  resetTracking();
});

// Control triggers
const handlePause = () => {
  pauseGame();
};

const handleResume = () => {
  resumeGame();
};

const handleRetry = () => {
  // Reset level state
  activeCheckpointIndex.value = 0;
  levelCompleted.value = false;
  isOffTrack.value = false;
  resumeGame();
};

const handleExit = () => {
  router.push('/');
};
</script>

<style scoped>
/* Custom transitions for game elements */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s ease;
}
.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.pop-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.5);
}
.pop-fade-leave-active {
  transition: all 0.2s ease;
}
.pop-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}
.pop-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.2);
}
</style>
