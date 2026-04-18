import type { IntervalColor, Move, MoveFamily } from './types';

export const INTERVAL_NAMES = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];

export const INTERVAL_COLORS: Record<MoveFamily, IntervalColor> = {
  tension:    { accent: '#7856A0', bg: '#EEE6F3' },
  gentle:     { accent: '#6A7D5E', bg: '#E9ECDC' },
  darkMed:    { accent: '#9C5D6B', bg: '#F1E1E3' },
  brightMed:  { accent: '#C68E42', bg: '#F5EBD8' },
  subdom:     { accent: '#4C6E4E', bg: '#DFE9E0' },
  dominant:   { accent: '#3A7087', bg: '#DDE9EE' },
  tritone:    { accent: '#C64B3B', bg: '#F8E6E2' },
};

// PRIORITY ORDER (user-requested): 3rds, 6ths, TT, 4ths, 5ths as PRIMARY.
// 2nds & 7ths are SECONDARY. Each with richer musical descriptions.
export const MOVES: Move[] = [
  // ASC · PRIMARY
  { id: 'upm3',  dir: 'up',   tier: 'primary', label: 'm3', arrow: '↑', semitones:  3, hint: 'the blue mediant',    tip: 'medieval "imperfect consonance" · leads to the relative minor',  fam: 'darkMed'   },
  { id: 'upM3',  dir: 'up',   tier: 'primary', label: 'M3', arrow: '↑', semitones:  4, hint: 'the sunlit mediant',  tip: 'imperfect consonance too · leads to the relative major',          fam: 'brightMed' },
  { id: 'upm6',  dir: 'up',   tier: 'primary', label: 'm6', arrow: '↑', semitones:  8, hint: 'the warm horizon',    tip: 'mirror of M3 · medieval singers loved 6ths, called them "dulcis"', fam: 'brightMed' },
  { id: 'upM6',  dir: 'up',   tier: 'primary', label: 'M6', arrow: '↑', semitones:  9, hint: 'the open horizon',    tip: 'mirror of m3 · wider, a gentle stride through the key',           fam: 'darkMed'   },
  { id: 'tt',    dir: 'both', tier: 'primary', label: 'TT', arrow: '⇅', semitones:  6, hint: 'diabolus in musica',  tip: 'medieval monks called this "the devil" · perfectly symmetric, never settled',  fam: 'tritone'   },
  { id: 'upP4',  dir: 'up',   tier: 'primary', label: 'P4', arrow: '↑', semitones:  5, hint: "Pythagoras' pillar",  tip: 'the subdominant (IV) · one of the four perfect consonances · a gentle rest', fam: 'subdom'    },
  { id: 'upP5',  dir: 'up',   tier: 'primary', label: 'P5', arrow: '↑', semitones:  7, hint: 'the purest pull',     tip: "the dominant (V) · Pythagoras' 3:2 ratio · gravity of the key",   fam: 'dominant'  },
  // ASC · SECONDARY
  { id: 'upm2',  dir: 'up',   tier: 'secondary', label: 'm2', arrow: '↑', semitones:  1, hint: 'the whisper',       tip: 'a half-step · the ancients called this a dissonance',             fam: 'tension'   },
  { id: 'upM2',  dir: 'up',   tier: 'secondary', label: 'M2', arrow: '↑', semitones:  2, hint: 'the quiet step',    tip: "the scale's ordinary stride",                                     fam: 'gentle'    },
  { id: 'upm7',  dir: 'up',   tier: 'secondary', label: 'm7', arrow: '↑', semitones: 10, hint: 'the blues cry',     tip: 'the signature of dominant-7 chords · wants to fall by a step',     fam: 'gentle'    },
  { id: 'upM7',  dir: 'up',   tier: 'secondary', label: 'M7', arrow: '↑', semitones: 11, hint: 'the leading call',  tip: 'the "leading tone" · a half-step from home, yearning',             fam: 'tension'   },
  // DESC · PRIMARY
  { id: 'dnm3',  dir: 'down', tier: 'primary', label: 'm3', arrow: '↓', semitones: -3, hint: 'the blue mediant',    tip: 'medieval "imperfect consonance" · down to the relative minor',    fam: 'darkMed'   },
  { id: 'dnM3',  dir: 'down', tier: 'primary', label: 'M3', arrow: '↓', semitones: -4, hint: 'the sunlit mediant',  tip: 'imperfect consonance · down to the relative major',               fam: 'brightMed' },
  { id: 'dnm6',  dir: 'down', tier: 'primary', label: 'm6', arrow: '↓', semitones: -8, hint: 'the warm horizon',    tip: 'mirror of M3, downward · medieval "dulcis"',                      fam: 'brightMed' },
  { id: 'dnM6',  dir: 'down', tier: 'primary', label: 'M6', arrow: '↓', semitones: -9, hint: 'the open horizon',    tip: 'mirror of m3, downward · a wide descent',                         fam: 'darkMed'   },
  { id: 'dnP4',  dir: 'down', tier: 'primary', label: 'P4', arrow: '↓', semitones: -5, hint: "Pythagoras' pillar",  tip: 'the subdominant (IV) below · perfect consonance',                 fam: 'subdom'    },
  { id: 'dnP5',  dir: 'down', tier: 'primary', label: 'P5', arrow: '↓', semitones: -7, hint: 'the purest pull',     tip: 'the dominant (V) below · the 3:2 ratio, downward',                fam: 'dominant'  },
  // DESC · SECONDARY
  { id: 'dnm2',  dir: 'down', tier: 'secondary', label: 'm2', arrow: '↓', semitones: -1, hint: 'the whisper',       tip: 'a half-step down · ancient dissonance',                          fam: 'tension'   },
  { id: 'dnM2',  dir: 'down', tier: 'secondary', label: 'M2', arrow: '↓', semitones: -2, hint: 'the quiet step',    tip: 'scalar motion downward',                                         fam: 'gentle'    },
  { id: 'dnm7',  dir: 'down', tier: 'secondary', label: 'm7', arrow: '↓', semitones: -10, hint: 'the blues cry',    tip: 'the dom-7 signature · descending',                               fam: 'gentle'    },
  { id: 'dnM7',  dir: 'down', tier: 'secondary', label: 'M7', arrow: '↓', semitones: -11, hint: 'the leading call', tip: 'the leading tone from above · half-step from home',              fam: 'tension'   },
];
