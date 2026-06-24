<template>
  <div class="min-h-screen flex flex-col font-sans select-none overflow-x-hidden relative">
    <!-- Background subtle floating decorations -->
    <div class="absolute top-20 left-10 text-4xl opacity-10 animate-float pointer-events-none">⭐</div>
    <div class="absolute top-40 right-20 text-5xl opacity-10 animate-float-slow pointer-events-none">☁️</div>
    <div class="absolute bottom-20 left-20 text-5xl opacity-10 animate-float-fast pointer-events-none">🎨</div>
    <div class="absolute bottom-40 right-10 text-4xl opacity-10 animate-float pointer-events-none">✨</div>

    <!-- Main Viewport Router Container -->
    <main class="flex-grow flex items-center justify-center p-4 md:p-6 z-10">
      <router-view v-slot="{ Component }">
        <transition name="fade-bounce" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
// Top-level App Entrypoint
</script>

<style>
/* Page navigation transitions */
.fade-bounce-enter-active,
.fade-bounce-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-bounce-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.fade-bounce-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
