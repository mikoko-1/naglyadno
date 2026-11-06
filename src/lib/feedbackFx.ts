import confetti from 'canvas-confetti';

type Intensity = 'normal' | 'finale';

const COLORS = ['#4f46e5', '#2dd4bf', '#fbbf24', '#fb7185', '#ffffff'];

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return null;
  }
  if (!audioContext) audioContext = new window.AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function playNotes(notes: { freq: number; at: number; duration: number }[]) {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  for (const note of notes) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note.freq, now + note.at);
    gain.gain.setValueAtTime(0.0001, now + note.at);
    gain.gain.exponentialRampToValueAtTime(0.05, now + note.at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + note.at);
    oscillator.stop(now + note.at + note.duration + 0.02);
  }
}

/** Короткий мажорный ход. Создаём контекст внутри клика, чтобы браузер его не блокировал. */
export function playSuccess(intensity: Intensity = 'normal') {
  const notes = [
    { freq: 523.25, at: 0, duration: 0.16 },
    { freq: 659.25, at: 0.08, duration: 0.18 },
    { freq: 783.99, at: 0.16, duration: 0.26 },
  ];
  if (intensity === 'finale') {
    notes.push({ freq: 1046.5, at: 0.28, duration: 0.32 });
  }
  playNotes(notes);
}

export function playError() {
  playNotes([
    { freq: 220, at: 0, duration: 0.14 },
    { freq: 174.61, at: 0.1, duration: 0.2 },
  ]);
}

export function celebrate(intensity: Intensity = 'normal') {
  const particleCount = intensity === 'finale' ? 160 : 80;
  void confetti({
    particleCount,
    spread: intensity === 'finale' ? 90 : 65,
    startVelocity: intensity === 'finale' ? 48 : 36,
    origin: { y: 0.62 },
    colors: COLORS,
    ticks: 200,
    scalar: 0.9,
    gravity: 0.95,
  });
}
