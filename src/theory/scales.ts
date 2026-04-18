import type { Scale, ScaleId } from './types';

export const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const NOTES_FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

export const SCALES: Record<ScaleId, Scale> = {
  major:      { name: 'Major',             steps: [0,2,4,5,7,9,11], labels: ['1','2','3','4','5','6','7'],              feel: 'bright, happy',     suffix: '',  color: '#C68E42' },
  minor:      { name: 'Natural Minor',     steps: [0,2,3,5,7,8,10], labels: ['1','2','♭3','4','5','♭6','♭7'],            feel: 'sad, classical',    suffix: 'm', color: '#5B5D8B' },
  dorian:     { name: 'Dorian',            steps: [0,2,3,5,7,9,10], labels: ['1','2','♭3','4','5','6','♭7'],             feel: 'jazzy, medieval',   suffix: 'm', color: '#3A7087' },
  phrygian:   { name: 'Phrygian',          steps: [0,1,3,5,7,8,10], labels: ['1','♭2','♭3','4','5','♭6','♭7'],           feel: 'dark, Spanish',     suffix: 'm', color: '#8B3A2C' },
  lydian:     { name: 'Lydian',            steps: [0,2,4,6,7,9,11], labels: ['1','2','3','♯4','5','6','7'],              feel: 'dreamy, sharp',     suffix: '',  color: '#5C7856' },
  mixolydian: { name: 'Mixolydian',        steps: [0,2,4,5,7,9,10], labels: ['1','2','3','4','5','6','♭7'],              feel: 'bluesy, Celtic',    suffix: '',  color: '#B8623D' },
  locrian:    { name: 'Locrian',           steps: [0,1,3,5,6,8,10], labels: ['1','♭2','♭3','4','♭5','♭6','♭7'],          feel: 'unstable, rare',    suffix: '°', color: '#4A4A5C' },
  harmMinor:  { name: 'Harmonic Minor',    steps: [0,2,3,5,7,8,11], labels: ['1','2','♭3','4','5','♭6','7'],             feel: 'exotic, tense',     suffix: 'm', color: '#7856A0' },
  melMinor:   { name: 'Melodic Minor',     steps: [0,2,3,5,7,9,11], labels: ['1','2','♭3','4','5','6','7'],              feel: 'jazz minor',        suffix: 'm', color: '#9C5D6B' },
  phrygDom:   { name: 'Phrygian Dominant', steps: [0,1,4,5,7,8,10], labels: ['1','♭2','3','4','5','♭6','♭7'],            feel: 'flamenco, fire',    suffix: '',  color: '#C64B3B' },
  pentMajor:  { name: 'Major Pentatonic',  steps: [0,2,4,7,9],      labels: ['1','2','3','5','6'],                        feel: 'folk, simple',      suffix: '',  color: '#6A7D5E' },
  pentMinor:  { name: 'Minor Pentatonic',  steps: [0,3,5,7,10],     labels: ['1','♭3','4','5','♭7'],                      feel: 'blues, universal',  suffix: 'm', color: '#5B79B8' },
  blues:      { name: 'Blues',             steps: [0,3,5,6,7,10],   labels: ['1','♭3','4','♭5','5','♭7'],                 feel: 'classic blues',     suffix: 'm', color: '#2D5E6B' },
  wholeTone:  { name: 'Whole Tone',        steps: [0,2,4,6,8,10],   labels: ['1','2','3','♯4','♯5','♯6'],                 feel: 'dreamy, Debussy',   suffix: '+', color: '#9B7FBF' },
};

export const SCALE_IDS = Object.keys(SCALES) as ScaleId[];
