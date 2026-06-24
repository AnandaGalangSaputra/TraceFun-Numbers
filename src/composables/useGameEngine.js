import { ref, computed } from 'vue';
import { levels } from '../data/levels';
import { useSound } from './useSound';

// Shared global state for gameplay
const currentLevelIndex = ref(0);
const activeCheckpointIndex = ref(0);
const score = ref(0);
const totalTime = ref(0); // overall game duration in seconds
const levelTime = ref(0); // time spent on current level in seconds
const starsCollected = ref(0);
const gameStatus = ref('not_started'); // not_started, playing, paused, finished
const isOffTrack = ref(false);
const levelCompleted = ref(false);
const levelStars = ref(3);

const feedbackText = ref('');
const feedbackTexts = ['Hebat!', 'Bagus!', 'Keren!', 'Pintar!', 'Luar Biasa!'];

const COLLISION_RADIUS = 0.085; // Tolerance radius (8.5% of canvas size)
const OFF_TRACK_THRESHOLD = 0.22; // Off-track warning boundary (22%)
let timerInterval = null;
let offTrackFramesCount = 0;
let levelErrors = 0;

export function useGameEngine() {
  const { playDing, playSuccess, playVictory, playWarning } = useSound();

  const currentLevel = computed(() => levels[currentLevelIndex.value]);
  const isLastLevel = computed(() => currentLevelIndex.value === levels.length - 1);

  // Helper: Distance between two 2D points
  const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Helper: Shortest distance from point P to line segment AB
  const getDistanceToSegment = (p, a, b) => {
    const l2 = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    if (l2 === 0) return getDistance(p, a);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = {
      x: a.x + t * (b.x - a.x),
      y: a.y + t * (b.y - a.y)
    };
    return getDistance(p, projection);
  };

  const showRandomFeedback = () => {
    const idx = Math.floor(Math.random() * feedbackTexts.length);
    feedbackText.value = feedbackTexts[idx];
    setTimeout(() => {
      feedbackText.value = '';
    }, 1200);
  };

  const checkCollision = (finger) => {
    if (gameStatus.value !== 'playing' || levelCompleted.value || !finger) {
      isOffTrack.value = false;
      return;
    }

    const checkpoints = currentLevel.value.checkpoints;
    const target = checkpoints[activeCheckpointIndex.value];

    // 1. Check target checkpoint collision
    const distToTarget = getDistance(finger, target);
    if (distToTarget <= COLLISION_RADIUS) {
      playDing();
      score.value += 10;
      
      if (activeCheckpointIndex.value === checkpoints.length - 1) {
        // Last checkpoint hit -> level complete!
        handleLevelComplete();
      } else {
        // Next checkpoint
        activeCheckpointIndex.value++;
        isOffTrack.value = false;
        offTrackFramesCount = 0;
        if (Math.random() > 0.6) {
          showRandomFeedback();
        }
      }
      return;
    }

    // 2. Out of bounds detection
    let distToPath = 0;
    if (activeCheckpointIndex.value === 0) {
      // If tracing hasn't started, measure distance to first checkpoint
      distToPath = distToTarget;
    } else {
      // Measure distance to segment from previously hit checkpoint to current checkpoint
      const prev = checkpoints[activeCheckpointIndex.value - 1];
      distToPath = getDistanceToSegment(finger, prev, target);
    }

    if (distToPath > OFF_TRACK_THRESHOLD) {
      offTrackFramesCount++;
      // Require ~1 second (assuming ~30 process frames per sec) of continuous off-track behavior
      if (offTrackFramesCount > 25 && !isOffTrack.value) {
        isOffTrack.value = true;
        levelErrors++;
        playWarning();
      }
    } else if (distToPath < OFF_TRACK_THRESHOLD * 0.7) {
      // Safe zone -> reset warnings
      isOffTrack.value = false;
      offTrackFramesCount = 0;
    }
  };

  const handleLevelComplete = () => {
    levelCompleted.value = true;
    
    // Calculate star rating for this level
    let stars = 3;
    if (levelErrors > 2 || levelTime.value > 25) {
      stars = 1;
    } else if (levelErrors > 0 || levelTime.value > 15) {
      stars = 2;
    }
    
    levelStars.value = stars;
    starsCollected.value += stars;
    score.value += 100; // completion bonus
    
    playSuccess();

    // Small delay to display success animation, then advance or complete game
    setTimeout(() => {
      if (isLastLevel.value) {
        handleGameComplete();
      } else {
        // Next Level
        currentLevelIndex.value++;
        activeCheckpointIndex.value = 0;
        levelCompleted.value = false;
        levelErrors = 0;
        levelTime.value = 0;
        isOffTrack.value = false;
        offTrackFramesCount = 0;
      }
    }, 1800);
  };

  const handleGameComplete = () => {
    stopTimer();
    gameStatus.value = 'finished';
    playVictory();
  };

  // Timer controls
  const startTimer = () => {
    if (timerInterval) return;
    gameStatus.value = 'playing';
    timerInterval = setInterval(() => {
      if (gameStatus.value === 'playing' && !levelCompleted.value) {
        totalTime.value++;
        levelTime.value++;
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const pauseGame = () => {
    gameStatus.value = 'paused';
    isOffTrack.value = false;
  };

  const resumeGame = () => {
    gameStatus.value = 'playing';
  };

  const resetGame = () => {
    stopTimer();
    currentLevelIndex.value = 0;
    activeCheckpointIndex.value = 0;
    score.value = 0;
    totalTime.value = 0;
    levelTime.value = 0;
    starsCollected.value = 0;
    levelCompleted.value = false;
    isOffTrack.value = false;
    levelErrors = 0;
    offTrackFramesCount = 0;
    gameStatus.value = 'not_started';
  };

  return {
    currentLevelIndex,
    activeCheckpointIndex,
    score,
    totalTime,
    levelTime,
    starsCollected,
    gameStatus,
    isOffTrack,
    levelCompleted,
    levelStars,
    feedbackText,
    currentLevel,
    isLastLevel,
    COLLISION_RADIUS,
    checkCollision,
    startTimer,
    stopTimer,
    pauseGame,
    resumeGame,
    resetGame
  };
}
