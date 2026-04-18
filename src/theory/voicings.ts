import type { StartDegree, Voicing } from './types';

export const VOICINGS: Voicing[] = [
  { id: 'seconds',  label: '2nds', stepSize: 1, tagline: 'Cluster · tight close harmony' },
  { id: 'thirds',   label: '3rds', stepSize: 2, tagline: 'The traditional triad' },
  { id: 'fourths',  label: '4ths', stepSize: 3, tagline: 'Quartal · open, filmic' },
  { id: 'fifths',   label: '5ths', stepSize: 4, tagline: 'Quintal · airy and vast' },
  { id: 'sixths',   label: '6ths', stepSize: 5, tagline: 'Spread · wide & cinematic' },
  { id: 'sevenths', label: '7ths', stepSize: 6, tagline: 'Extreme spread · rare, exotic' },
];

export const START_DEGREES: StartDegree[] = [
  { id: 'root',  label: 'root', degree: 0, subtitle: '1' },
  { id: 'third', label: '3rd',  degree: 2, subtitle: '♭3/3' },
  { id: 'fifth', label: '5th',  degree: 4, subtitle: '5' },
];
