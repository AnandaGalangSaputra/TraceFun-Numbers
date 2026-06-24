<template>
  <div class="flex flex-col items-center justify-center min-h-[85vh] w-full px-4 animate-scale-up">
    <!-- Celebrate Confetti Layer using standard CSS particles if needed, but the ResultCard handles most metrics -->
    <ResultCard 
      @replay="handleReplay"
      @home="handleHome"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useGameEngine } from '../composables/useGameEngine';
import ResultCard from '../components/game/ResultCard.vue';

const router = useRouter();
const { resetGame } = useGameEngine();

const handleReplay = () => {
  resetGame();
  router.push('/game');
};

const handleHome = () => {
  resetGame();
  router.push('/');
};
</script>
