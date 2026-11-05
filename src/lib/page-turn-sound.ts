const SAMPLE_URL = "/assets/sounds/page-turn.wav";
const COOLDOWN_MS = 240;

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let rawData: ArrayBuffer | null = null;
let loadPromise: Promise<AudioBuffer | null> | null = null;
let lastPlayAt = 0;
let activeGain: GainNode | null = null;
let listenersBound = false;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const scoped = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? scoped.webkitAudioContext ?? null;
}

function getContext(): AudioContext | null {
  const Ctor = getAudioContextCtor();
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

function prefetchSample(): void {
  if (rawData || typeof fetch === "undefined") return;
  void fetch(SAMPLE_URL)
    .then((response) => (response.ok ? response.arrayBuffer() : null))
    .then((data) => {
      if (data) rawData = data;
    })
    .catch(() => undefined);
}

async function loadBuffer(audio: AudioContext): Promise<AudioBuffer | null> {
  try {
    if (!rawData) {
      const response = await fetch(SAMPLE_URL);
      if (!response.ok) return null;
      rawData = await response.arrayBuffer();
    }
    return await audio.decodeAudioData(rawData.slice(0));
  } catch {
    return null;
  }
}

export async function unlockPageTurnSound(): Promise<void> {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") {
    try {
      await audio.resume();
    } catch {
      return;
    }
  }
  if (!loadPromise) loadPromise = loadBuffer(audio);
  buffer = await loadPromise;
}

export function bindPageTurnSoundUnlock(): void {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;
  prefetchSample();
  const unlock = () => {
    void unlockPageTurnSound();
  };
  window.addEventListener("pointerdown", unlock, { once: true, capture: true });
  window.addEventListener("keydown", unlock, { once: true, capture: true });
}

function fadeOutActive(audio: AudioContext): void {
  if (!activeGain) return;
  const gain = activeGain;
  const now = audio.currentTime;
  gain.gain.cancelScheduledValues(now);
  const current = Math.max(gain.gain.value, 0.0001);
  gain.gain.setValueAtTime(current, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  activeGain = null;
}

function startSample(
  audio: AudioContext,
  sample: AudioBuffer,
  direction: 1 | -1,
  durationMs: number,
): void {
  fadeOutActive(audio);

  const now = audio.currentTime;
  const playDur = Math.min(sample.duration, Math.max(0.36, durationMs / 1000));

  const source = audio.createBufferSource();
  source.buffer = sample;
  source.playbackRate.value = direction > 0 ? 0.98 : 1.04;

  const pan = audio.createStereoPanner();
  pan.pan.setValueAtTime(direction > 0 ? 0.34 : -0.34, now);
  pan.pan.linearRampToValueAtTime(direction > 0 ? -0.2 : 0.2, now + playDur * 0.58);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.42, now + 0.045);
  gain.gain.setValueAtTime(0.42, now + playDur * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + playDur);

  source.connect(pan);
  pan.connect(gain);
  gain.connect(audio.destination);

  activeGain = gain;
  source.start(now);
  source.stop(now + playDur + 0.03);
}

function playProcedural(
  audio: AudioContext,
  direction: 1 | -1,
  durationMs: number,
): void {
  fadeOutActive(audio);

  const now = audio.currentTime;
  const duration = Math.max(0.32, Math.min(0.9, durationMs / 1000));
  const frames = Math.floor(audio.sampleRate * duration);
  const noise = audio.createBuffer(1, frames, audio.sampleRate);
  const data = noise.getChannelData(0);
  let pink = 0;
  for (let i = 0; i < frames; i += 1) {
    pink = 0.97 * pink + 0.03 * (Math.random() * 2 - 1);
    data[i] = pink;
  }

  const source = audio.createBufferSource();
  source.buffer = noise;

  const bandpass = audio.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 0.72;
  bandpass.frequency.setValueAtTime(direction > 0 ? 1350 : 1650, now);
  bandpass.frequency.exponentialRampToValueAtTime(
    direction > 0 ? 2300 : 1050,
    now + duration * 0.55,
  );

  const pan = audio.createStereoPanner();
  pan.pan.setValueAtTime(direction > 0 ? 0.3 : -0.3, now);
  pan.pan.linearRampToValueAtTime(direction > 0 ? -0.18 : 0.18, now + duration * 0.55);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.28, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(bandpass);
  bandpass.connect(pan);
  pan.connect(gain);
  gain.connect(audio.destination);

  activeGain = gain;
  source.start(now);
  source.stop(now + duration);
}

export function playPageTurnSound(
  direction: 1 | -1 = 1,
  durationMs = 860,
): void {
  const audio = getContext();
  if (!audio) return;

  if (audio.state === "suspended") {
    void audio.resume();
  }

  const now = performance.now();
  if (now - lastPlayAt < COOLDOWN_MS) return;
  lastPlayAt = now;

  if (buffer) {
    startSample(audio, buffer, direction, durationMs);
    return;
  }

  if (!loadPromise) loadPromise = loadBuffer(audio);
  void loadPromise.then((sample) => {
    buffer = sample;
    if (sample) startSample(audio, sample, direction, durationMs);
    else playProcedural(audio, direction, durationMs);
  });
}

export function getTurnDirection(pageFlip: {
  getFlipController?: () => {
    getCalculation?: () => { getDirection?: () => number } | null;
  };
}): 1 | -1 {
  try {
    const direction = pageFlip
      .getFlipController?.()
      ?.getCalculation?.()
      ?.getDirection?.();
    if (direction === 1) return -1;
  } catch {
    return 1;
  }
  return 1;
}
