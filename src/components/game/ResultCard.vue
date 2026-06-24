<template>
  <div class="flex flex-col items-center justify-center text-center p-8 bg-[#FFFDF9] border-4 border-slate-800 rounded-[2.5rem] shadow-bubbly max-w-lg w-full relative overflow-hidden">
    
    <!-- Background sparkles -->
    <div class="absolute -top-10 -left-10 text-4xl animate-float-slow opacity-30 select-none">⭐</div>
    <div class="absolute -bottom-10 -right-10 text-4xl animate-float-fast opacity-30 select-none">✏️</div>
    <div class="absolute top-1/2 -right-8 text-4xl animate-float opacity-30 select-none">☁️</div>

    <div class="z-10 flex flex-col items-center w-full">
      <!-- Mascot / Icon -->
      <span class="text-7xl mb-4 animate-float-fast inline-block">🏆</span>
      
      <!-- Greeting Headline -->
      <h1 class="font-bubble text-slate-800 text-4xl md:text-5xl mb-2">{{ titleMessage }}</h1>
      <p class="font-bubble text-brand-pink text-lg md:text-xl mb-6">Hebat! Kamu telah menyelesaikan semua angka!</p>

      <!-- Stars Banner -->
      <div class="flex gap-4 justify-center items-center mb-8">
        <div 
          v-for="i in 3" 
          :key="i"
          :class="[
            'text-5xl md:text-6xl transition-all duration-700 transform',
            i <= starRating ? 'scale-110 rotate-[10deg] filter drop-shadow-[0_4px_0_rgba(0,0,0,0.15)]' : 'scale-90 opacity-30 grayscale'
          ]"
        >
          ⭐
        </div>
      </div>

      <!-- Stats List -->
      <div class="bg-[#EBF7FF] border-2 border-slate-800 rounded-3xl p-5 w-full flex flex-col gap-3 mb-8 shadow-bubbly-blue text-left">
        <div class="flex justify-between items-center text-lg">
          <span class="font-bubble text-slate-500">⭐ Total Skor:</span>
          <span class="font-bubble font-bold text-2xl text-slate-800">{{ score }}</span>
        </div>
        
        <div class="flex justify-between items-center text-lg">
          <span class="font-bubble text-slate-500">⏱️ Total Waktu:</span>
          <span class="font-bubble font-bold text-2xl text-slate-800">{{ formattedTime }}</span>
        </div>

        <div class="flex justify-between items-center text-lg">
          <span class="font-bubble text-slate-500">✨ Bintang Dikoleksi:</span>
          <span class="font-bubble font-bold text-2xl text-slate-800">{{ starsCollected }} / 30</span>
        </div>
      </div>

      <!-- Call to Actions -->
      <div class="flex flex-col sm:flex-row gap-4 w-full">
        <!-- Replay Button -->
        <AppButton 
          variant="green" 
          size="md" 
          class="flex-1 w-full"
          @click="emit('replay')"
        >
          <span>🔄</span> Main Lagi
        </AppButton>
        
        <!-- Home Button -->
        <AppButton 
          variant="blue" 
          size="md" 
          class="flex-1 w-full"
          @click="emit('home')"
        >
          <span>🏠</span> Menu Utama
        </AppButton>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameEngine } from '../../composables/useGameEngine';
import AppButton from '../common/AppButton.vue';

const emit = defineEmits(['replay', 'home']);
const { score, totalTime, starsCollected } = useGameEngine();

// Star rating evaluation (out of 3 stars for the entire game session)
const starRating = computed(() => {
  // If player gets 25+ stars, they get 3 stars. 15+ is 2 stars. Otherwise 1.
  if (starsCollected.value >= 25) return 3;
  if (starsCollected.value >= 15) return 2;
  return 1;
});

const titleMessage = computed(() => {
  if (starRating.value === 3) return 'Sempurna!';
  if (starRating.value === 2) return 'Luar Biasa!';
  return 'Kerja Bagus!';
});

// Format elapsed seconds to MM:SS
const formattedTime = computed(() => {
  const mins = Math.floor(totalTime.value / 60);
  const secs = totalTime.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} menit`;
});
</script>
