import * as Tone from 'tone';

// ────────────────────────────────────────────────────────────
//  SAMPLE BANKS  (all CC-licensed, hosted on public CDNs)
// ────────────────────────────────────────────────────────────

// Salamander Grand Piano — CC0, hosted on the tone.js CDN.
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

// Nylon guitar & harp — Berklee/CCMixter samples hosted by
// nbrosowsky/tonejs-instruments (CC). Tone.Sampler interpolates.
const NBR_BASE = 'https://nbrosowsky.github.io/tonejs-instruments/samples';

const NYLON_SAMPLES: Record<string, string> = {
  'A2': 'A2.mp3', 'B2': 'B2.mp3',
  'D3': 'D3.mp3', 'E3': 'E3.mp3', 'G3': 'G3.mp3', 'A3': 'A3.mp3', 'B3': 'B3.mp3',
  'D4': 'D4.mp3', 'E4': 'E4.mp3', 'G4': 'G4.mp3', 'A4': 'A4.mp3',
  'D5': 'D5.mp3', 'E5': 'E5.mp3',
};

const HARP_SAMPLES: Record<string, string> = {
  'C3': 'C3.mp3', 'D3': 'D3.mp3', 'E3': 'E3.mp3', 'G3': 'G3.mp3', 'A3': 'A3.mp3',
  'C4': 'C4.mp3', 'D4': 'D4.mp3', 'E4': 'E4.mp3', 'F4': 'F4.mp3', 'G4': 'G4.mp3', 'A4': 'A4.mp3', 'B4': 'B4.mp3',
  'C5': 'C5.mp3', 'D5': 'D5.mp3', 'E5': 'E5.mp3', 'F5': 'F5.mp3', 'G5': 'G5.mp3',
};

export type InstrumentId = 'piano' | 'nylon' | 'harp';

// ────────────────────────────────────────────────────────────
//  ENGINE
// ────────────────────────────────────────────────────────────
export interface AudioEngine {
  piano: Tone.Sampler;
  click: Tone.Synth;
  reverb: Tone.Reverb;
  master: Tone.Gain;
  metroGain: Tone.Gain;
  instruments: Partial<Record<InstrumentId, Tone.Sampler>>;
  loadInstrument: (id: InstrumentId) => Promise<Tone.Sampler>;
  setMasterVolume: (linear0to1: number) => void;   // linear volume, 0..1
  setMetroVolume:  (linear0to1: number) => void;
}

let engine: AudioEngine | null = null;
let initPromise: Promise<AudioEngine> | null = null;

/**
 * Lazily initialize the audio engine. Must be called behind a user gesture.
 * Idempotent — repeated calls return the same promise / same engine.
 *
 * Routing:
 *   piano / nylon / harp  →  reverb → master → destination
 *   click                  →  metroGain → destination  (dry)
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

    // 1) Master gain + reverb first. Reverb MUST be generated before
    //    anything connects to it — otherwise the signal silently dies.
    const master = new Tone.Gain(0.9).toDestination();
    const reverb = new Tone.Reverb({ decay: 3.2, wet: 0.22 });
    await reverb.generate();
    reverb.connect(master);

    // 2) Piano sampler (Salamander) — route through reverb.
    const piano = new Tone.Sampler({
      urls: SALAMANDER_SAMPLES,
      baseUrl: SALAMANDER_BASE_URL,
      release: 1.2,
      volume: -2,
    }).connect(reverb);
    await Tone.loaded();

    // 3) Metronome click — crisp sine tick, dry (no reverb).
    const metroGain = new Tone.Gain(0.6).toDestination();
    const click = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
      volume: -4,
    }).connect(metroGain);

    const instruments: Partial<Record<InstrumentId, Tone.Sampler>> = { piano };

    const loadInstrument = async (id: InstrumentId): Promise<Tone.Sampler> => {
      const existing = instruments[id];
      if (existing) return existing;
      if (id === 'piano') return piano;

      const urls = id === 'nylon' ? NYLON_SAMPLES : HARP_SAMPLES;
      const folder = id === 'nylon' ? 'guitar-nylon' : 'harp';
      const sampler = new Tone.Sampler({
        urls,
        baseUrl: `${NBR_BASE}/${folder}/`,
        release: id === 'harp' ? 2.4 : 0.9,
        volume: id === 'harp' ? -4 : -5,
      }).connect(reverb);
      await sampler.loaded;          // resolves when all buffers are ready
      instruments[id] = sampler;
      return sampler;
    };

    const setMasterVolume = (v: number) => {
      master.gain.rampTo(Math.max(0, Math.min(1, v)), 0.04);
    };
    const setMetroVolume = (v: number) => {
      metroGain.gain.rampTo(Math.max(0, Math.min(1, v)), 0.04);
    };

    engine = { piano, click, reverb, master, metroGain, instruments, loadInstrument, setMasterVolume, setMetroVolume };
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
  if (!engine) return;
  try { engine.piano.dispose(); } catch {}
  try { Object.values(engine.instruments).forEach(i => { try { i?.dispose(); } catch {} }); } catch {}
  try { engine.click.dispose(); } catch {}
  try { engine.reverb.dispose(); } catch {}
  try { engine.master.dispose(); } catch {}
  try { engine.metroGain.dispose(); } catch {}
  engine = null;
  initPromise = null;
}

// ────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────

// Transpose a note name down an octave for the "pad / low octave" layer.
export function octDown(noteName: string): string {
  try { return Tone.Frequency(noteName).transpose(-12).toNote(); }
  catch { return noteName; }
}

export { Tone };
