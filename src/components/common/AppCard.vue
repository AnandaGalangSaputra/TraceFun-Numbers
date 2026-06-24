<template>
  <div
    :class="[
      'rounded-[2rem] border-2 border-slate-800 transition-all duration-300 bg-white p-6 md:p-8',
      variantClasses[variant],
      hoverable ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'cream',
    validator: (val) => ['yellow', 'blue', 'green', 'pink', 'purple', 'cream'].includes(val)
  },
  hoverable: {
    type: Boolean,
    default: false
  }
});

const variantClasses = {
  cream: 'bg-[#FFFDF9] shadow-bubbly text-slate-800',
  yellow: 'bg-[#FFF9E6] shadow-bubbly-yellow text-slate-800',
  blue: 'bg-[#EBF7FF] shadow-bubbly-blue text-slate-800',
  green: 'bg-[#F2FAF3] shadow-bubbly-green text-slate-800',
  pink: 'bg-[#FFF0F4] shadow-bubbly-pink text-slate-800',
  purple: 'bg-[#FAF5FF] shadow-bubbly-purple text-slate-800'
};
</script>
