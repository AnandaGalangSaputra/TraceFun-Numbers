import { ref } from 'vue';

// Shared global state for hand tracking
const isHandDetected = ref(false);
const indexFinger = ref(null); // { x, y } normalized
const rawLandmarks = ref([]);
const isModelLoading = ref(true);

let handsInstance = null;
let lastProcessedTime = 0;

// Exponential Moving Average (EMA) smoothing parameters
const EMA_ALPHA = 0.35; // Lower values = smoother but slower, higher values = more responsive
let prevX = null;
let prevY = null;

export function useHandTracking() {
  
  const initHandTracking = () => {
    if (handsInstance) {
      isModelLoading.value = false;
      return handsInstance;
    }

    if (!window.Hands) {
      console.error('MediaPipe Hands library belum termuat dari CDN.');
      return null;
    }

    isModelLoading.value = true;

    try {
      handsInstance = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55
      });

      handsInstance.onResults((results) => {
        isModelLoading.value = false;
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          isHandDetected.value = true;
          const landmarks = results.multiHandLandmarks[0];
          rawLandmarks.value = landmarks;

          // Landmark 8 is INDEX_FINGER_TIP
          const tip = landmarks[8];
          
          if (tip) {
            // Mirror X because the camera preview is mirrored for selfie/mirror gameplay
            const targetX = 1 - tip.x;
            const targetY = tip.y;

            // Apply smoothing (Exponential Moving Average)
            if (prevX === null || prevY === null) {
              prevX = targetX;
              prevY = targetY;
            } else {
              prevX = EMA_ALPHA * targetX + (1 - EMA_ALPHA) * prevX;
              prevY = EMA_ALPHA * targetY + (1 - EMA_ALPHA) * prevY;
            }

            indexFinger.value = {
              x: prevX,
              y: prevY
            };
          }
        } else {
          isHandDetected.value = false;
          indexFinger.value = null;
          rawLandmarks.value = [];
          
          // Reset smoothing
          prevX = null;
          prevY = null;
        }
      });
      
      console.log('MediaPipe Hands berhasil diinisialisasi.');
    } catch (err) {
      console.error('Gagal menginisialisasi MediaPipe Hands:', err);
      isModelLoading.value = false;
    }

    return handsInstance;
  };

  const processFrame = async (videoElement) => {
    if (!handsInstance) {
      initHandTracking();
    }
    
    if (handsInstance && videoElement && videoElement.readyState >= 2) {
      try {
        // Prevent sending frames too fast to avoid CPU overloading
        const now = performance.now();
        if (now - lastProcessedTime > 30) { // Max ~30fps processing
          await handsInstance.send({ image: videoElement });
          lastProcessedTime = now;
        }
      } catch (err) {
        console.error('MediaPipe gagal memproses frame:', err);
      }
    }
  };

  const resetTracking = () => {
    isHandDetected.value = false;
    indexFinger.value = null;
    rawLandmarks.value = [];
    prevX = null;
    prevY = null;
  };

  return {
    isHandDetected,
    indexFinger,
    rawLandmarks,
    isModelLoading,
    initHandTracking,
    processFrame,
    resetTracking
  };
}
