export type ScaleId =
  | 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian'
  | 'locrian' | 'harmMinor' | 'melMinor' | 'phrygDom'
  | 'pentMajor' | 'pentMinor' | 'blues' | 'wholeTone';

export interface Scale {
  name: string;
  steps: number[];
  labels: string[];
  feel: string;
  suffix: string;
  color: string;
}

export type VoicingId = 'seconds' | 'thirds' | 'fourths' | 'fifths' | 'sixths' | 'sevenths';

export interface Voicing {
  id: VoicingId;
  label: string;
  stepSize: number;
  tagline: string;
}

export type StartDegreeId = 'root' | 'third' | 'fifth';

export interface StartDegree {
  id: StartDegreeId;
  label: string;
  degree: number;
  subtitle: string;
}

export type MoveDir = 'up' | 'down' | 'both';
export type MoveTier = 'primary' | 'secondary';
export type MoveFamily = 'tension' | 'gentle' | 'darkMed' | 'brightMed' | 'subdom' | 'dominant' | 'tritone';

export interface Move {
  id: string;
  dir: MoveDir;
  tier: MoveTier;
  label: string;
  arrow: string;
  semitones: number;
  hint: string;
  tip: string;
  fam: MoveFamily;
}

export interface IntervalColor {
  accent: string;
  bg: string;
}

export type ChordQuality = 'M' | 'm';

export interface ProgressionPattern {
  label: string;
  steps: Array<[number, ChordQuality]>;
}

export interface Pin {
  id: number;
  rootMidi: number;
  scaleId: ScaleId;
  voicingId: VoicingId;
  startDegId: StartDegreeId;
}
