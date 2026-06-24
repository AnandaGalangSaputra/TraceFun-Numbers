<template>
  <button
    :class="[
      'font-bubble rounded-3xl border-2 border-slate-800 transition-all duration-150 transform hover:scale-105 active:scale-95 active:translate-y-1',
      variantClasses[variant],
      sizeClasses[size],
      disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <!-- Slot for button content -->
    <span class="flex items-center justify-center gap-2">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useSound } from '../../composables/useSound';

const props = defineProps({
  variant: {
    type: String,
    default: 'blue',
    validator: (val) => ['yellow', 'blue', 'green', 'pink', 'purple', 'disabled'].includes(val)
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);
const { playClick } = useSound();

const variantClasses = {
  yellow: 'bg-brand-yellow hover:bg-[#FFE370] text-slate-800 shadow-bubbly-yellow active:shadow-bubbly-yellow-hover',
  blue: 'bg-brand-blue hover:bg-[#8BD8FF] text-slate-800 shadow-bubbly-blue active:shadow-bubbly-blue-hover',
  green: 'bg-brand-green hover:bg-[#B3F4BF] text-slate-800 shadow-bubbly-green active:shadow-bubbly-green-hover',
  pink: 'bg-brand-pink hover:bg-[#FFAEC1] text-slate-800 shadow-bubbly-pink active:shadow-bubbly-pink-hover',
  purple: 'bg-brand-purple hover:bg-[#DECBE6] text-slate-800 shadow-bubbly-purple active:shadow-bubbly-purple-hover',
  disabled: 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed shadow-none active:translate-y-0 active:scale-100'
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm border-2',
  md: 'px-6 py-3 text-lg border-2',
  lg: 'px-8 py-4 text-2xl border-4'
};

const handleClick = (event) => {
  if (props.disabled) return;
  playClick();
  emit('click', event);
};
</script>
