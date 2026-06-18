const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const backgroundTempo = 118;
const backgroundStepDuration = 60 / backgroundTempo / 2;
const backgroundLookahead = 0.12;
const backgroundPattern = [
  { note: 392, bass: 98 },
  { note: 494, bass: 98 },
  { note: 587, bass: 147 },
  { note: 494, bass: 147 },
  { note: 440, bass: 110 },
  { note: 523, bass: 110 },
  { note: 659, bass: 165 },
  { note: 523, bass: 165 },
];

let backgroundGain = null;
let backgroundTimerId = null;
let nextMusicTime = 0;
let currentStep = 0;

function createTone(frequency, duration, type = 'sine', volume = 0.2) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function ensureBackgroundGain() {
  if (backgroundGain) return;
  backgroundGain = audioContext.createGain();
  backgroundGain.gain.value = 0.055;
  backgroundGain.connect(audioContext.destination);
}

function scheduleMusicNote(frequency, startTime, duration, type, volume) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(backgroundGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function scheduleBackgroundMusic() {
  while (nextMusicTime < audioContext.currentTime + backgroundLookahead) {
    const step = backgroundPattern[currentStep % backgroundPattern.length];
    const isDownbeat = currentStep % 2 === 0;

    scheduleMusicNote(step.bass, nextMusicTime, backgroundStepDuration * 1.8, 'triangle', 0.18);
    scheduleMusicNote(step.note, nextMusicTime, backgroundStepDuration * 0.75, 'square', isDownbeat ? 0.08 : 0.05);

    nextMusicTime += backgroundStepDuration;
    currentStep += 1;
  }
}

function playBackgroundMusic() {
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  ensureBackgroundGain();
  if (backgroundTimerId) return;

  nextMusicTime = audioContext.currentTime;
  currentStep = 0;
  scheduleBackgroundMusic();
  backgroundTimerId = setInterval(scheduleBackgroundMusic, 50);
}

function stopBackgroundMusic() {
  if (!backgroundTimerId) return;
  clearInterval(backgroundTimerId);
  backgroundTimerId = null;
}

function playEatSound() {
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  createTone(880, 0.12, 'square', 0.1);
}

function playGameOverSound() {
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  createTone(220, 0.24, 'sawtooth', 0.12);
  setTimeout(() => createTone(165, 0.18, 'sawtooth', 0.1), 140);
}

window.AudioManager = {
  playBackgroundMusic,
  stopBackgroundMusic,
  playEatSound,
  playGameOverSound,
};
