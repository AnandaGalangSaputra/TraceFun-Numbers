<template>
  <div class="flex flex-col gap-2 w-full max-w-md">
    <label class="font-bubble text-slate-700 text-lg flex items-center gap-2">
      <span>📹</span> Pilih Kamera Webcam:
    </label>
    
    <div class="relative w-full">
      <select
        v-model="selectedDeviceId"
        @change="handleCameraChange"
        class="w-full px-5 py-3 text-lg rounded-2xl border-2 border-slate-800 bg-white text-slate-700 font-bubble appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue"
      >
        <option v-if="devices.length === 0" value="" disabled>Mendeteksi kamera...</option>
        <option
          v-for="device in devices"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-800">
        <span class="text-xl">▼</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCamera } from '../../composables/useCamera';

const { devices, selectedDeviceId, loadDevices, switchCamera } = useCamera();

const handleCameraChange = async (event) => {
  const deviceId = event.target.value;
  if (deviceId) {
    try {
      await switchCamera(deviceId);
    } catch (err) {
      console.error('Gagal mengganti kamera:', err);
    }
  }
};

onMounted(() => {
  loadDevices();
});
</script>
