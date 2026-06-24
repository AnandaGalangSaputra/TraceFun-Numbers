<template>
  <div class="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-4xl px-4 animate-scale-up">
    <AppCard variant="cream" class="w-full">
      
      <!-- Title -->
      <div class="text-center mb-8">
        <span class="text-5xl mb-2 inline-block">🎓</span>
        <h1 class="font-bubble text-slate-800 text-3xl md:text-4xl">Cara Bermain</h1>
        <p class="text-slate-500 font-sans text-sm md:text-base mt-1">
          Pelajari langkah mudah ini sebelum masuk ke arena permainan!
        </p>
      </div>

      <!-- Content Layout -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        <!-- Animated Mockup Tracing Box (Left) -->
        <div class="md:col-span-6 flex flex-col items-center">
          <div class="relative w-full aspect-[4/3] max-w-sm bg-white border-2 border-slate-800 rounded-3xl p-6 shadow-bubbly-blue overflow-hidden flex flex-col items-center justify-center">
            <span class="font-bubble text-xs text-slate-400 absolute top-4 left-4 uppercase">Simulasi Gerakan</span>
            
            <!-- Target Line Guide -->
            <svg class="w-full h-full max-h-[160px]" viewBox="0 0 100 100">
              <!-- Dashed line for path -->
              <line 
                x1="50" y1="20" 
                x2="50" y2="80" 
                stroke="#6BCBFF" 
                stroke-width="8" 
                stroke-linecap="round"
                stroke-dasharray="8 8"
              />
              <!-- Completed trace representation (revealed by cursor) -->
              <line 
                x1="50" y1="20" 
                x2="50" y2="50" 
                stroke="#95E1A3" 
                stroke-width="8" 
                stroke-linecap="round"
                class="sim-completed-line"
              />
              
              <!-- Checkpoint 1 -->
              <circle cx="50" cy="20" r="8" fill="#95E1A3" stroke="#1e293b" stroke-width="2" />
              <text x="50" y="21.5" font-family="Fredoka, sans-serif" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle" dominant-baseline="middle">✓</text>
              
              <!-- Checkpoint 2 (Active Target) -->
              <circle cx="50" cy="50" r="9" fill="#FFD93D" stroke="#1e293b" stroke-width="2" class="sim-pulse-point" />
              <text x="50" y="51.5" font-family="Fredoka, sans-serif" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle" dominant-baseline="middle">2</text>
              
              <!-- Checkpoint 3 -->
              <circle cx="50" cy="80" r="8" fill="#FFFFFF" stroke="#1e293b" stroke-width="2" />
              <text x="50" y="81.5" font-family="Fredoka, sans-serif" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle" dominant-baseline="middle">3</text>
            </svg>

            <!-- Animated hand cursor tracing -->
            <div class="absolute text-5xl sim-hand-pointer">
              👆
            </div>

            <!-- Hint overlay text -->
            <div class="mt-4 font-bubble text-brand-pink text-sm animate-pulse-slow">
              Sentuh titik kuning <b>2</b> selanjutnya!
            </div>
          </div>
        </div>

        <!-- Instructional Steps (Right) -->
        <div class="md:col-span-6 flex flex-col gap-5 text-left">
          
          <div class="flex gap-4 items-start">
            <span class="text-3xl bg-brand-pink/20 border-2 border-slate-800 p-2 rounded-2xl flex-shrink-0">👋</span>
            <div>
              <h3 class="font-bubble text-slate-800 text-lg">Angkat Tanganmu</h3>
              <p class="text-slate-600 text-sm font-sans mt-0.5">
                Berdirilah sekitar 0.5 - 1 meter di depan kamera, angkat telapak tangan menghadap ke kamera.
              </p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <span class="text-3xl bg-brand-yellow/20 border-2 border-slate-800 p-2 rounded-2xl flex-shrink-0">☝️</span>
            <div>
              <h3 class="font-bubble text-slate-800 text-lg">Tunjuk Jari Telunjuk</h3>
              <p class="text-slate-600 text-sm font-sans mt-0.5">
                Rapatkan jari-jari lain dan gunakan <b>ujung jari telunjuk</b> sebagai pointer/kursor ajaib di layar.
              </p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <span class="text-3xl bg-brand-green/20 border-2 border-slate-800 p-2 rounded-2xl flex-shrink-0">🟢</span>
            <div>
              <h3 class="font-bubble text-slate-800 text-lg">Sentuh Titik Secara Berurutan</h3>
              <p class="text-slate-600 text-sm font-sans mt-0.5">
                Sentuh titik kuning berdenyut <b>(1 ➔ 2 ➔ 3 dst.)</b>. Jika benar, titik berubah warna menjadi hijau!
              </p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <span class="text-3xl bg-brand-blue/20 border-2 border-slate-800 p-2 rounded-2xl flex-shrink-0">⚠️</span>
            <div>
              <h3 class="font-bubble text-slate-800 text-lg">Jangan Keluar Jalur</h3>
              <p class="text-slate-600 text-sm font-sans mt-0.5">
                Ikuti garis bantuan dengan perlahan. Jika terlalu jauh melenceng, sistem akan memberi tahu untuk kembali ke jalur.
              </p>
            </div>
          </div>

        </div>
      </div>

      <!-- Navigation Panel -->
      <div class="flex gap-4 border-t border-slate-200 pt-6 mt-8">
        <AppButton variant="purple" size="md" @click="goBack">
          ⬅️ Kembali
        </AppButton>
        <AppButton variant="yellow" size="md" class="flex-1 text-xl animate-wiggle-hover" @click="startGame">
          Mulai Bermain! 🚀
        </AppButton>
      </div>

    </AppCard>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';

const router = useRouter();

const goBack = () => {
  router.push('/camera');
};

const startGame = () => {
  router.push('/game');
};
</script>

<style scoped>
/* Animated simulation styles */
@keyframes traceHand {
  0% { transform: translate(-5px, 20px); opacity: 0; }
  10% { transform: translate(-5px, 20px); opacity: 1; }
  /* Hover 1 */
  20% { transform: translate(-5px, -30px); }
  /* Trace to 2 */
  50% { transform: translate(-5px, 15px); }
  /* Pause at 2 */
  70% { transform: translate(-5px, 15px); }
  /* Return */
  90% { transform: translate(-5px, 20px); opacity: 1; }
  100% { transform: translate(-5px, 20px); opacity: 0; }
}

.sim-hand-pointer {
  animation: traceHand 5s infinite ease-in-out;
  left: 50%;
  top: 50%;
}

@keyframes simPulse {
  0%, 100% { transform: scale(1); r: 9; }
  50% { transform: scale(1.15); r: 11; }
}

.sim-pulse-point {
  animation: simPulse 1.5s infinite ease-in-out;
  transform-origin: 50px 50px;
}

@keyframes drawCompleted {
  0%, 20% { stroke-dasharray: 0 100; opacity: 0; }
  50%, 100% { stroke-dasharray: 30 100; opacity: 1; }
}

.sim-completed-line {
  stroke-dasharray: 0 100;
  animation: drawCompleted 5s infinite ease-in-out;
}
</style>
