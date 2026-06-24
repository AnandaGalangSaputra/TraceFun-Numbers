<template>
  <div class="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-4xl px-4 animate-scale-up">
    <AppCard class="w-full" variant="cream">
      
      <!-- Header -->
      <div class="flex flex-col items-center text-center mb-6">
        <span class="text-5xl mb-2">📷</span>
        <h1 class="font-bubble text-slate-800 text-3xl md:text-4xl">Pengaturan Kamera</h1>
        <p class="text-slate-500 font-sans text-sm md:text-base mt-1">
          Izinkan akses kamera dan coba lambaikan tanganmu ke layar untuk menguji sensor gerakan!
        </p>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <!-- Preview Column (Left) -->
        <div class="lg:col-span-7 flex flex-col items-center gap-3">
          
          <!-- Viewport Container -->
          <div class="relative w-full aspect-[4/3] max-w-md border-4 border-slate-800 rounded-3xl bg-slate-900 overflow-hidden shadow-bubbly">
            
            <!-- Video feed (hidden or raw mirrored background) -->
            <video
              ref="videoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover transform scale-x-[-1]"
            ></video>

            <!-- Skeleton and landmark overlays -->
            <HandOverlay v-if="cameraStatus === 'active'" />

            <!-- State overlays (Loading, Error, Permission Denied) -->
            <div 
              v-if="cameraStatus === 'loading'" 
              class="absolute inset-0 bg-slate-900/80 flex flex-col justify-center items-center text-white text-center p-4 z-30"
            >
              <div class="w-12 h-12 rounded-full border-4 border-slate-600 border-t-brand-blue animate-spin mb-4"></div>
              <p class="font-bubble text-lg">Menghubungkan ke kamera...</p>
            </div>

            <div 
              v-else-if="cameraStatus === 'permission_denied'" 
              class="absolute inset-0 bg-[#FFF0F4]/95 flex flex-col justify-center items-center text-slate-800 text-center p-6 z-30"
            >
              <span class="text-5xl mb-3">⚠️</span>
              <p class="font-bubble text-lg text-brand-pink font-bold mb-2">Akses Kamera Ditolak</p>
              <p class="text-sm font-sans text-slate-600 max-w-xs">
                TraceFun memerlukan izin kamera. Klik ikon kamera di baris alamat browser Anda untuk memberikan izin.
              </p>
              <AppButton variant="pink" size="sm" class="mt-4" @click="initCamera">Coba Lagi</AppButton>
            </div>

            <div 
              v-else-if="cameraStatus === 'error'" 
              class="absolute inset-0 bg-slate-950/95 flex flex-col justify-center items-center text-white text-center p-6 z-30"
            >
              <span class="text-5xl mb-3">❌</span>
              <p class="font-bubble text-lg text-red-400 font-bold mb-2">Kamera Gagal Dibuka</p>
              <p class="text-sm text-slate-400 max-w-xs">
                {{ errorMessage }}
              </p>
              <AppButton variant="pink" size="sm" class="mt-4" @click="initCamera">Coba Lagi</AppButton>
            </div>

            <!-- Model Loading overlay -->
            <div 
              v-if="cameraStatus === 'active' && isModelLoading"
              class="absolute bottom-4 left-4 right-4 bg-slate-900/90 text-white rounded-xl px-4 py-2 flex items-center gap-3 z-30 text-xs font-sans"
            >
              <div class="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
              <span>Memuat AI pendeteksi gerakan jari tangan...</span>
            </div>

          </div>

          <!-- Hand Status Indicator Bar -->
          <div 
            v-if="cameraStatus === 'active'"
            :class="[
              'w-full max-w-md py-2.5 px-4 rounded-2xl border-2 border-slate-800 font-bubble text-center transition-all duration-300 text-sm md:text-base shadow-sm',
              isHandDetected 
                ? 'bg-brand-green/30 text-slate-800 border-slate-800' 
                : 'bg-brand-yellow/30 text-slate-800 border-slate-800 animate-pulse'
            ]"
          >
            <span v-if="isHandDetected">✨ Tangan terdeteksi! Siap bermain. 👍</span>
            <span v-else>👋 Silakan arahkan tanganmu ke depan kamera.</span>
          </div>

        </div>

        <!-- Setup Form Column (Right) -->
        <div class="lg:col-span-5 flex flex-col justify-center gap-6">
          <!-- Selector Dropdown -->
          <CameraSelector />

          <!-- Details / Instruction Tip -->
          <div class="bg-[#EBF7FF] border-2 border-slate-800 rounded-2xl p-4 text-slate-700 text-sm font-sans flex items-start gap-3 shadow-bubbly-blue">
            <span class="text-xl">💡</span>
            <p>
              Gunakan ruangan dengan <b>pencahayaan yang cukup</b> agar sistem deteksi jari dapat mengenali skeleton tangan dengan akurat.
            </p>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex gap-4 border-t border-slate-200 pt-6">
            <AppButton variant="purple" size="md" class="flex-1" @click="goBack">
              ⬅️ Kembali
            </AppButton>

            <AppButton 
              variant="green" 
              size="md" 
              class="flex-[1.5]"
              :disabled="cameraStatus !== 'active'"
              @click="proceedToTutorial"
            >
              Lanjut ➡️
            </AppButton>
          </div>
        </div>

      </div>

    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCamera } from '../composables/useCamera';
import { useHandTracking } from '../composables/useHandTracking';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';
import CameraSelector from '../components/camera/CameraSelector.vue';
import HandOverlay from '../components/game/HandOverlay.vue';

const router = useRouter();
const { activeStream, cameraStatus, errorMessage, startCamera, stopCamera } = useCamera();
const { isHandDetected, isModelLoading, initHandTracking, processFrame, resetTracking } = useHandTracking();

const videoRef = ref(null);
let animationFrameId = null;
let loopActive = false;

// Initialize camera and start rendering the tracking feed
const initCamera = async () => {
  try {
    const stream = await startCamera();
    if (stream && videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (err) {
    console.error('Camera startup failed:', err);
  }
};

// Hand-tracking frame processing loop
const runTrackingLoop = async () => {
  if (!loopActive) return;
  
  if (videoRef.value && cameraStatus.value === 'active' && videoRef.value.readyState >= 2) {
    await processFrame(videoRef.value);
  }
  animationFrameId = requestAnimationFrame(runTrackingLoop);
};

// Watch for changes in activeStream (e.g. from hot-switching)
watch(activeStream, (newStream) => {
  if (videoRef.value && newStream) {
    videoRef.value.srcObject = newStream;
  }
});

onMounted(() => {
  initCamera();
  initHandTracking();
  
  loopActive = true;
  animationFrameId = requestAnimationFrame(runTrackingLoop);
});

onUnmounted(() => {
  loopActive = false;
  cancelAnimationFrame(animationFrameId);
  stopCamera();
  resetTracking();
});

const goBack = () => {
  router.push('/');
};

const proceedToTutorial = () => {
  router.push('/tutorial');
};
</script>
