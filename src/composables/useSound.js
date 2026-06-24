import { ref } from 'vue';

const isMuted = ref(localStorage.getItem('tracefun_muted') === 'true');
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function useSound() {
  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    localStorage.setItem('tracefun_muted', isMuted.value);
    if (!isMuted.value) {
      // Small feedback click when unmuted
      setTimeout(() => playClick(), 50);
    }
  };

  const playOscillator = (freqs, times, type = 'sine', duration = 0.15, volume = 0.1) => {
    if (isMuted.value) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (Array.isArray(freqs)) {
        osc.frequency.setValueAtTime(freqs[0], now);
        for (let i = 1; i < freqs.length; i++) {
          const t = times ? times[i] : (duration / (freqs.length - 1)) * i;
          osc.frequency.exponentialRampToValueAtTime(freqs[i], now + t);
        }
      } else {
        osc.frequency.setValueAtTime(freqs, now);
      }
      
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  const playClick = () => {
    playOscillator([180, 90], null, 'triangle', 0.06, 0.15);
  };

  const playDing = () => {
    // Two quick high tones for satisfying checkpoint feedback
    playOscillator([587.33, 1174.66], [0, 0.1], 'sine', 0.22, 0.08);
  };

  const playSuccess = () => {
    // Rising Major Chime: C5 -> E5 -> G5 -> C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        playOscillator(freq, null, 'sine', 0.18, 0.06);
      }, idx * 60);
    });
  };

  const playVictory = () => {
    // Joyful victory theme: C5 -> G5 -> E5 -> C6
    const notes = [523.25, 783.99, 659.25, 1046.50, 1318.51];
    const delays = [0, 100, 200, 300, 420];
    const durations = [0.12, 0.12, 0.12, 0.18, 0.35];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playOscillator(freq, null, 'triangle', durations[idx], 0.07);
      }, delays[idx]);
    });
  };

  const playWarning = () => {
    // Short downward buzz
    playOscillator([200, 110], null, 'sawtooth', 0.2, 0.04);
  };

  return {
    isMuted,
    toggleMute,
    playClick,
    playDing,
    playSuccess,
    playVictory,
    playWarning
  };
}
