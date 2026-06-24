import { ref } from 'vue';

// Shared global state for camera
const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('tracefun_selected_camera') || '');
const activeStream = ref(null);
const cameraStatus = ref('inactive'); // inactive, loading, active, error, permission_denied
const errorMessage = ref('');

export function useCamera() {
  
  // Enumerate available video inputs
  const loadDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Browser Anda tidak mendukung akses daftar kamera.');
      }
      
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      
      // Map and add fallback labels if empty
      devices.value = videoDevices.map((device, idx) => ({
        deviceId: device.deviceId,
        label: device.label || `Kamera ${idx + 1}`
      }));

      // Set default selected camera if none is set
      if (devices.value.length > 0 && !selectedDeviceId.value) {
        selectedDeviceId.value = devices.value[0].deviceId;
      }
    } catch (err) {
      console.error('Gagal memuat daftar kamera:', err);
      errorMessage.value = err.message || 'Gagal mendeteksi kamera.';
    }
  };

  // Stop current active stream tracks
  const stopCamera = () => {
    if (activeStream.value) {
      activeStream.value.getTracks().forEach(track => {
        track.stop();
      });
      activeStream.value = null;
    }
    cameraStatus.value = 'inactive';
  };

  // Start stream from selected deviceId or default
  const startCamera = async (deviceId = null) => {
    stopCamera();
    cameraStatus.value = 'loading';
    errorMessage.value = '';

    const targetDeviceId = deviceId || selectedDeviceId.value;

    const constraints = {
      video: targetDeviceId 
        ? { deviceId: { exact: targetDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
        : { width: { ideal: 640 }, height: { ideal: 480 } }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStream.value = stream;
      cameraStatus.value = 'active';

      // Store selected device ID
      const activeTrack = stream.getVideoTracks()[0];
      if (activeTrack) {
        const settings = activeTrack.getSettings();
        if (settings.deviceId) {
          selectedDeviceId.value = settings.deviceId;
          localStorage.setItem('tracefun_selected_camera', settings.deviceId);
        }
      }

      // Reload devices to get actual device labels (now that permission is granted)
      await loadDevices();
      
      return stream;
    } catch (err) {
      stopCamera();
      console.error('Error starting camera:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        cameraStatus.value = 'permission_denied';
        errorMessage.value = 'Izin kamera ditolak. Berikan akses kamera pada browser Anda untuk dapat bermain.';
      } else {
        cameraStatus.value = 'error';
        errorMessage.value = 'Gagal mengakses kamera. Pastikan kamera tidak sedang digunakan oleh aplikasi lain.';
      }
      throw err;
    }
  };

  // Switch camera to a new deviceId
  const switchCamera = async (deviceId) => {
    selectedDeviceId.value = deviceId;
    localStorage.setItem('tracefun_selected_camera', deviceId);
    return await startCamera(deviceId);
  };

  return {
    devices,
    selectedDeviceId,
    activeStream,
    cameraStatus,
    errorMessage,
    loadDevices,
    startCamera,
    stopCamera,
    switchCamera
  };
}
