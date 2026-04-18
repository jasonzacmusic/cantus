import * as Tone from 'tone';

// Salamander Grand Piano samples, CC0 licensed, hosted on the tone.js CDN.
// Tone.Sampler interpolates between these base pitches automatically.
const SALAMANDER_SAMPLES: Record<string, string> = {
  A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
  A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
  A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
  A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
  A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
  A5: 'A5.mp3', C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
  A6: 'A6.mp3', C7: 'C7.mp3',
};

const SALAMANDER_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

export interface AudioEngine {
  piano: Tone.Sampler;
  pad: Tone.PolySynth;
  click: Tone.Synth;
  reverb: Tone.Reverb;
}

let engine: AudioEngine | null = null;
let initPromise: Promise<AudioEngine> | null = null;

/**
 * Lazily initialize the audio engine. Must be called behind a user gesture.
 * Idempotent — repeated calls return the same promise / same engine.
 *
 * CRITICAL: the reverb must be .generate()'d BEFORE anything connects to it.
 * Connect first and the signal silently dies with no error.
 */
export async function initAudio(): Promise<AudioEngine> {
  if (engine) return engine;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await Tone.start();
    const ctx = Tone.getContext();
    if (ctx.state !== 'running') {
      try { await ctx.resume(); } catch {}
    }

    // 1) Build reverb first and await its impulse-response generation.
    const reverb = new Tone.Reverb({ decay: 3.2, wet: 0.22 });
    await reverb.generate();
    reverb.toDestination();

    // 2) Main voice — Salamander piano sampler, routed through reverb.
    const piano = new Tone.Sampler({
      urls: SALAMANDER_SAMPLES,
      baseUrl: SALAMANDER_BASE_URL,
      release: 1.2,
      volume: -2,
    }).connect(reverb);
    await Tone.loaded();

    // 3) Pad voice — warm sine body an octave below, gives the chord weight.
    const pad = new Tone.PolySynth(Tone.Synth).connect(reverb);
    pad.set({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.16, decay: 0.55, sustain: 0.72, release: 2.4 },
      volume: -20,
    });

    // 4) Metronome click — crisp sine tick, dry (no reverb).
    const click = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
      volume: -8,
    }).toDestination();

    engine = { piano, pad, click, reverb };
    return engine;
  })();

  try {
    return await initPromise;
  } catch (err) {
    initPromise = null;
    throw err;
  }
}

export function getEngine(): AudioEngine | null {
  return engine;
}

export function isAudioReady(): boolean {
  return engine !== null;
}

export function disposeAudio(): void {
  try { engine?.piano.dispose(); } catch {}
  try { engine?.pad.dispose(); } catch {}
  try { engine?.click.dispose(); } catch {}
  try { engine?.reverb.dispose(); } catch {}
  engine = null;
  initPromise = null;
}

// Helper: transpose a note name down an octave for the pad layer.
export function octDown(noteName: string): string {
  try { return Tone.Frequency(noteName).transpose(-12).toNote(); }
  catch { return noteName; }
}

export { Tone };
