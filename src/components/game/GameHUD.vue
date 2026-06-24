<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Main Stats Card -->
    <div class="bg-[#FFFDF9] border-2 border-slate-800 rounded-[2rem] p-6 shadow-bubbly flex flex-col gap-4">
      
      <!-- Current Level Header -->
      <div class="text-center pb-3 border-b-2 border-dashed border-slate-300">
        <span class="font-bubble text-slate-500 text-sm uppercase tracking-wider block">Level Progress</span>
        <h2 class="font-bubble text-slate-800 text-2xl md:text-3xl mt-1">
          Angka <span class="text-brand-pink font-bold text-3xl md:text-4xl">{{ currentLevel.label }}</span>
        </h2>
        <span class="text-xs font-semibold bg-brand-blue/30 text-slate-700 px-3 py-1 rounded-full mt-2 inline-block">
          {{ currentLevelIndex + 1 }} dari 10 Angka
        </span>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Score Box -->
        <div class="bg-[#EBF7FF] border-2 border-slate-800 rounded-2xl p-3 text-center shadow-bubbly-blue">
          <span class="text-2xl block mb-1">⭐</span>
          <span class="font-bubble text-slate-500 text-xs uppercase tracking-wider block">Skor</span>
          <span class="font-bubble text-2xl font-bold text-slate-800">{{ score }}</span>
        </div>

        <!-- Timer Box -->
        <div class="bg-[#FFF0F4] border-2 border-slate-800 rounded-2xl p-3 text-center shadow-bubbly-pink">
          <span class="text-2xl block mb-1">⏱️</span>
          <span class="font-bubble text-slate-500 text-xs uppercase tracking-wider block">Waktu</span>
          <span class="font-bubble text-2xl font-bold text-slate-800">{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Sound Toggle -->
      <button 
        @click="toggleMute" 
        class="flex items-center justify-between px-4 py-3 bg-[#F2FAF3] border-2 border-slate-800 rounded-2xl shadow-bubbly-green hover:scale-[1.02] active:scale-[0.98] active:translate-y-[2px] transition-all font-bubble text-slate-700 text-sm"
      >
        <span>Efek Suara:</span>
        <span class="text-lg font-bold flex items-center gap-1">
          <span v-if="!isMuted">🔊 ON</span>
          <span v-else>🔇 OFF</span>
        </span>
      </button>

    </div>

    <!-- Quick Actions panel -->
    <div class="flex items-center gap-3 w-full">
      <!-- Pause -->
      <button
        @click="emit('pause')"
        class="flex-1 py-3 bg-[#DECBE6] hover:bg-[#d0b8dc] text-slate-800 font-bubble text-base border-2 border-slate-800 rounded-2xl shadow-bubbly-purple hover:scale-105 active:scale-95 active:translate-y-1 transition-all flex items-center justify-center gap-2"
      >
        <span>⏸️</span> Pause
      </button>

      <!-- Reset / Ulang -->
      <button
        @click="emit('retry')"
        class="flex-1 py-3 bg-brand-yellow hover:bg-[#ffe370] text-slate-800 font-bubble text-base border-2 border-slate-800 rounded-2xl shadow-bubbly-yellow hover:scale-105 active:scale-95 active:translate-y-1 transition-all flex items-center justify-center gap-2"
      >
        <span>🔄</span> Ulang
      </button>

      <!-- Exit -->
      <button
        @click="emit('exit')"
        class="py-3 px-4 bg-[#FF8FAB]/40 hover:bg-[#FF8FAB]/60 text-slate-700 font-bubble border-2 border-slate-800 rounded-2xl shadow-bubbly-pink hover:scale-105 active:scale-95 active:translate-y-1 transition-all flex items-center justify-center"
        title="Kembali ke Menu Utama"
      >
        <span>🏠</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameEngine } from '../../composables/useGameEngine';
import { useSound } from '../../composables/useSound';

const emit = defineEmits(['pause', 'retry', 'exit']);
const { currentLevelIndex, score, totalTime, currentLevel } = useGameEngine();
const { isMuted, toggleMute } = useSound();

// Format elapsed seconds to MM:SS
const formattedTime = computed(() => {
  const mins = Math.floor(totalTime.value / 60);
  const secs = totalTime.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});
</script>
