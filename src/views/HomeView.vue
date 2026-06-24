<template>
  <div class="flex flex-col items-center justify-center min-h-[85vh] w-full px-4 relative">
    
    <!-- Floating decorative elements -->
    <div class="absolute top-10 left-10 text-6xl animate-float opacity-30 select-none text-brand-yellow">1</div>
    <div class="absolute bottom-16 left-20 text-6xl animate-float-slow opacity-20 select-none text-brand-blue">3</div>
    <div class="absolute top-24 right-16 text-6xl animate-float-fast opacity-25 select-none text-brand-pink">2</div>
    <div class="absolute bottom-10 right-28 text-6xl animate-float opacity-20 select-none text-brand-purple">5</div>
    
    <AppCard class="max-w-2xl w-full text-center p-8 md:p-12 relative overflow-hidden animate-scale-up">
      <!-- Background splash -->
      <div class="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brand-yellow/10"></div>
      <div class="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-brand-blue/10"></div>

      <!-- Mascot & Title -->
      <div class="mb-6 relative">
        <span class="text-7xl md:text-8xl block animate-float-fast inline-block">✨🖐️✨</span>
      </div>

      <!-- Heading -->
      <h1 class="font-bubble text-slate-800 text-5xl md:text-6xl font-bold tracking-tight mb-3 drop-shadow-[0_4px_0_rgba(0,0,0,0.05)]">
        <span class="text-brand-pink">Trace</span><span class="text-brand-blue">Fun</span>
        <span class="text-brand-yellow"> Numbers</span>
      </h1>
      
      <p class="text-slate-600 font-bubble text-lg md:text-xl max-w-md mx-auto mb-10">
        Belajar menulis angka dengan menggerakkan ujung jari telunjukmu di depan webcam!
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-5 justify-center items-center max-w-sm mx-auto mb-8">
        <!-- Start Button -->
        <AppButton 
          variant="yellow" 
          size="lg" 
          class="w-full text-xl animate-wiggle-hover"
          @click="startPlaying"
        >
          🎮 Mulai Main!
        </AppButton>
        
        <!-- Instructions Button -->
        <AppButton 
          variant="purple" 
          size="md" 
          class="w-full text-lg"
          @click="showInstructions = true"
        >
          📖 Petunjuk
        </AppButton>
      </div>

      <!-- Settings Toolbar (Sound Toggle) -->
      <div class="flex justify-center border-t border-dashed border-slate-200 pt-6">
        <button
          @click="toggleMute"
          class="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 rounded-full font-bubble text-sm text-slate-700 transition-all active:translate-y-0.5 active:scale-95"
        >
          <span>{{ isMuted ? '🔇' : '🔊' }}</span>
          <span>Efek Suara: <b>{{ isMuted ? 'OFF' : 'ON' }}</b></span>
        </button>
      </div>
    </AppCard>

    <!-- Instructions Modal overlay -->
    <transition name="modal-fade">
      <div 
        v-if="showInstructions" 
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showInstructions = false"
      >
        <AppCard class="max-w-lg w-full relative p-6 md:p-8 animate-scale-up" variant="blue">
          <!-- Close button -->
          <button 
            @click="showInstructions = false" 
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center border-2 border-slate-800 bg-white hover:bg-slate-100 rounded-full text-xl font-bold text-slate-700 hover:scale-110 active:scale-90 transition-all"
          >
            ✕
          </button>
          
          <h2 class="font-bubble text-slate-800 text-3xl mb-4 text-center">📖 Cara Bermain</h2>
          
          <div class="flex flex-col gap-4 text-left font-sans text-slate-600 text-base md:text-lg mb-6">
            <div class="flex gap-3 items-start">
              <span class="text-2xl bg-white border border-slate-800 w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 font-bubble">1</span>
              <p>Berikan <b>izin kamera</b> di halaman berikutnya dan pilih webcam yang ingin kamu pakai.</p>
            </div>
            
            <div class="flex gap-3 items-start">
              <span class="text-2xl bg-white border border-slate-800 w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 font-bubble">2</span>
              <p>Arahkan <b>tanganmu ke kamera</b>. Gunakan <b>ujung jari telunjuk</b> sebagai penunjuk utama (pointer).</p>
            </div>

            <div class="flex gap-3 items-start">
              <span class="text-2xl bg-white border border-slate-800 w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 font-bubble">3</span>
              <p>Gerakkan telunjukmu menyentuh <b>checkpoint lingkaran kuning</b> yang berdenyut secara berurutan.</p>
            </div>

            <div class="flex gap-3 items-start">
              <span class="text-2xl bg-white border border-slate-800 w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 font-bubble">4</span>
              <p>Ikuti garis putus-putus dan selesaikan semua angka dari <b>1 sampai 9</b> lalu terakhir <b>0</b>!</p>
            </div>
          </div>

          <div class="text-center">
            <AppButton 
              variant="green" 
              size="md" 
              class="w-full sm:w-auto"
              @click="showInstructions = false"
            >
              Mengerti! 👍
            </AppButton>
          </div>
        </AppCard>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSound } from '../composables/useSound';
import AppButton from '../components/common/AppButton.vue';
import AppCard from '../components/common/AppCard.vue';

const router = useRouter();
const { isMuted, toggleMute, playClick } = useSound();

const showInstructions = ref(false);

const startPlaying = () => {
  router.push('/camera');
};
</script>

<style scoped>
/* Modal Fade transition classes */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
