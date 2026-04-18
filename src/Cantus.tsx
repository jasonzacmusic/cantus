// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, RotateCcw, Film, Volume2, Disc3, Pin, X, PlayCircle, Square, Music2, Plus, Sparkles, Wand2, Flower2, Waves } from 'lucide-react';

import { NOTES_SHARP, NOTES_FLAT, SCALES, SCALE_IDS } from './theory/scales';
import { VOICINGS, START_DEGREES } from './theory/voicings';
import { MOVES, INTERVAL_NAMES, INTERVAL_COLORS } from './theory/moves';
import {
  CLASSIC_PATTERNS, CINEMATIC_PATTERNS, CLASSIC_KEYS,
  CINEMATIC_ROOTS, CINEMATIC_VOICING_PLANS,
} from './theory/progressions';
import {
  mod12, pitchName, asciiName, preferFlats, isMajorFamily,
  voicingMidi, voicingIntervals, chordNameFor, intervalBetween,
  notesToToneNames, displayMidi,
} from './theory/chord';
import { initAudio as initAudioEngine, getEngine, octDown, Tone } from './audio/engine';

// (theory constants and helpers live in ./theory/* — imported above)
/* REMOVED_BLOCK_START
const _OLD_SCALES_REMOVED = {
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

const SCALE_IDS = Object.keys(SCALES);

const VOICINGS = [
  { id: 'seconds',  label: '2nds', stepSize: 1, tagline: 'Cluster · tight close harmony' },
  { id: 'thirds',   label: '3rds', stepSize: 2, tagline: 'The traditional triad' },
  { id: 'fourths',  label: '4ths', stepSize: 3, tagline: 'Quartal · open, filmic' },
  { id: 'fifths',   label: '5ths', stepSize: 4, tagline: 'Quintal · airy and vast' },
  { id: 'sixths',   label: '6ths', stepSize: 5, tagline: 'Spread · wide & cinematic' },
  { id: 'sevenths', label: '7ths', stepSize: 6, tagline: 'Extreme spread · rare, exotic' },
];

const START_DEGREES = [
  { id: 'root',  label: 'root', degree: 0, subtitle: '1' },
  { id: 'third', label: '3rd',  degree: 2, subtitle: '♭3/3' },
  { id: 'fifth', label: '5th',  degree: 4, subtitle: '5' },
];

const INTERVAL_COLORS = {
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
const MOVES = [
  // ASC · PRIMARY
  { id: 'upm3',  dir: 'up',   tier: 'primary', label: 'm3', arrow: '↑', semitones:  3, hint: 'the blue mediant',    tip: 'medieval "imperfect consonance" · leads to the relative minor',  fam: 'darkMed'   },
  { id: 'upM3',  dir: 'up',   tier: 'primary', label: 'M3', arrow: '↑', semitones:  4, hint: 'the sunlit mediant',  tip: 'imperfect consonance too · leads to the relative major',          fam: 'brightMed' },
  { id: 'upm6',  dir: 'up',   tier: 'primary', label: 'm6', arrow: '↑', semitones:  8, hint: 'the warm horizon',    tip: 'mirror of M3 · medieval singers loved 6ths, called them "dulcis"', fam: 'brightMed' },
  { id: 'upM6',  dir: 'up',   tier: 'primary', label: 'M6', arrow: '↑', semitones:  9, hint: 'the open horizon',    tip: 'mirror of m3 · wider, a gentle stride through the key',           fam: 'darkMed'   },
  { id: 'tt',    dir: 'both', tier: 'primary', label: 'TT', arrow: '⇅', semitones:  6, hint: 'diabolus in musica',  tip: 'medieval monks called this "the devil" · perfectly symmetric, never settled',  fam: 'tritone'   },
  { id: 'upP4',  dir: 'up',   tier: 'primary', label: 'P4', arrow: '↑', semitones:  5, hint: "Pythagoras' pillar",  tip: 'the subdominant (IV) · one of the four perfect consonances · a gentle rest', fam: 'subdom'    },
  { id: 'upP5',  dir: 'up',   tier: 'primary', label: 'P5', arrow: '↑', semitones:  7, hint: 'the purest pull',     tip: 'the dominant (V) · Pythagoras\' 3:2 ratio · gravity of the key',   fam: 'dominant'  },
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

const INTERVAL_NAMES = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];

function mod12(n) { return ((n % 12) + 12) % 12; }
function pitchName(rootIdx, useFlats) { return (useFlats ? NOTES_FLAT : NOTES_SHARP)[mod12(rootIdx)]; }
function asciiName(rootIdx, useFlats) { return pitchName(rootIdx, useFlats).replace('♯','#').replace('♭','b'); }

function preferFlats(rootIdx, scaleId) {
  const majorFlats = [5, 10, 3, 8, 1, 6];
  const minorFlats = [2, 7, 0, 5, 10, 3];
  const scale = SCALES[scaleId];
  if (!scale) return false;
  const isMajorFam = scale.steps[2] === 4;
  return (isMajorFam ? majorFlats : minorFlats).includes(mod12(rootIdx));
}

function isMajorFamily(scaleId) {
  const s = SCALES[scaleId];
  return s && s.steps[2] === 4;
}

function voicingMidi(rootMidi, scaleId, stepSize, startDegree = 0) {
  const steps = SCALES[scaleId].steps;
  const len = steps.length;
  return [0, stepSize, stepSize * 2].map(step => {
    const scaleStep = step + startDegree;
    const i = scaleStep % len;
    const oct = Math.floor(scaleStep / len) * 12;
    return rootMidi + steps[i] + oct;
  });
}

function voicingIntervals(scaleId, stepSize, startDegree = 0) {
  const labs = SCALES[scaleId].labels;
  const len = labs.length;
  return [0, stepSize, stepSize * 2].map(step => labs[(step + startDegree) % len]);
}

function chordNameFor(rootIdx, scaleId, useFlats) {
  const s = SCALES[scaleId];
  return pitchName(rootIdx, useFlats) + (s ? s.suffix : '');
}

function intervalBetween(m1, m2) {
  let diff = m2 - m1;
  while (diff >  6) diff -= 12;
  while (diff < -6) diff += 12;
  const abs = Math.abs(diff);
  const name = INTERVAL_NAMES[abs] || '·';
  const arrow = diff === 0 ? '=' : diff > 0 ? '↑' : '↓';
  return `${arrow}${name}`;
}

function notesToToneNames(midiArr) {
  return midiArr.map(m => Tone.Frequency(m, 'midi').toNote());
}

function _displayMidiRemoved(m) {
  let d = m; while (d < 60) d += 12; while (d > 84) d -= 12; return d;
}
REMOVED_BLOCK_END */

// ════════════════════════════════════════════════════════════
//  PIANO
// ════════════════════════════════════════════════════════════

function Piano({
  highlighted = [],
  rootPcs = new Set(),
  sharedPcs = new Set(),
  activeMidi = null,
  useFlats = false,
  onKeyClick = null,
  size = 'normal',
  orderMap = null,          // { midi: order } — shows small "1, 2, 3" on highlighted keys (single-chord view)
  pcCountMap = null,        // { pc: count } — combined view mode: "how many chords contain this pc"
}) {
  const startOctave = 4;
  const octaves = 2;
  const whiteKeysOrder = [0, 2, 4, 5, 7, 9, 11];
  const blackKeysOrder = [1, 3, 6, 8, 10];

  const whiteKeys = [];
  const blackKeys = [];
  for (let o = 0; o < octaves + 1; o++) {
    whiteKeysOrder.forEach((pc, idxInOct) => {
      const midi = (startOctave + o + 1) * 12 + pc;
      if (o === octaves && idxInOct > 0) return;
      whiteKeys.push({ midi, pc });
    });
    if (o < octaves) {
      blackKeysOrder.forEach(pc => {
        const midi = (startOctave + o + 1) * 12 + pc;
        blackKeys.push({ midi, pc });
      });
    }
  }

  const kw  = size === 'small' ? 48 : 56;
  const kh  = size === 'small' ? 180 : 218;
  const bkw = size === 'small' ? 30 : 34;
  const bkh = size === 'small' ? 116 : 142;
  const whiteLetterSize = size === 'small' ? 18 : 22;
  const blackLetterSize = size === 'small' ? 13 : 15;

  const totalW = whiteKeys.length * kw;
  const blackOffsets = { 1: 1.0, 3: 2.0, 6: 4.0, 8: 5.0, 10: 6.0 };
  const highlightSet = new Set(highlighted);
  const octaveBaseIndex = (midi) => Math.floor(midi / 12) - (startOctave + 1);
  const clickable = typeof onKeyClick === 'function';

  // Combined-view detection: if pcCountMap is present, use count-based logic
  // and ignore root/shared props. Cleaner, one question: "is this in ≥2 chords?"
  const combinedMode = pcCountMap != null;

  const resolveFill = (pc, midi, isWhite) => {
    const isActive = activeMidi === midi;
    if (isActive) return 'url(#pGold)';

    const isLit = highlightSet.has(midi);
    if (!isLit) return isWhite ? 'url(#pWhite)' : 'url(#pBlack)';

    if (combinedMode) {
      // Combined view: shared (2+) vs unique (1). No root coloring.
      const count = pcCountMap[pc] || 0;
      return count >= 2 ? 'url(#pGold2)' : 'url(#pVoice)';
    }

    // Single-chord view: root vs voicing
    if (rootPcs.has(pc)) return 'url(#pRoot)';
    return 'url(#pVoice)';
  };

  return (
    <svg viewBox={`-2 -2 ${totalW + 4} ${kh + 4}`} xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="pWhite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBFAF5"/><stop offset="100%" stopColor="#F2ECDB"/>
        </linearGradient>
        <linearGradient id="pBlack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26263A"/><stop offset="100%" stopColor="#12121C"/>
        </linearGradient>
        <linearGradient id="pVoice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B5C88"/><stop offset="100%" stopColor="#3D3356"/>
        </linearGradient>
        <linearGradient id="pRoot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4604F"/><stop offset="100%" stopColor="#A63A2C"/>
        </linearGradient>
        <linearGradient id="pGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9B960"/><stop offset="100%" stopColor="#B88A2E"/>
        </linearGradient>
        <linearGradient id="pGold2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9AE54"/><stop offset="100%" stopColor="#8E6B22"/>
        </linearGradient>
      </defs>

      {whiteKeys.map((k, i) => {
        const fill = resolveFill(k.pc, k.midi, true);
        const isLit = highlightSet.has(k.midi);
        const label = isLit ? pitchName(k.pc, useFlats).replace('♯','#').replace('♭','b') : '';
        const isSharedInCombined = combinedMode && isLit && (pcCountMap[k.pc] || 0) >= 2;
        const labelColor = (!combinedMode && rootPcs.has(k.pc)) ? '#FBF3EB' : '#F6F1E7';
        const orderNum = orderMap && isLit ? orderMap[k.midi] : null;
        const shareCount = isSharedInCombined ? pcCountMap[k.pc] : null;
        return (
          <g key={`w-${k.midi}`}
             onClick={clickable ? () => onKeyClick(k.pc, k.midi) : undefined}
             style={{ cursor: clickable ? 'pointer' : 'default' }}>
            <rect x={i * kw} y={0} width={kw - 1.5} height={kh} rx={3}
              fill={fill} stroke="#2A2A3A" strokeWidth={1.2}
              style={{ transition: 'fill 220ms ease-out' }}/>
            {orderNum != null && (
              <g>
                <circle cx={i * kw + (kw - 1.5) / 2} cy={16} r={10}
                  fill="rgba(246, 241, 231, 0.95)" stroke={rootPcs.has(k.pc) ? '#A63A2C' : '#3D3356'} strokeWidth={1.2}/>
                <text x={i * kw + (kw - 1.5) / 2} y={20} textAnchor="middle"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
                    fill: rootPcs.has(k.pc) ? '#A63A2C' : '#3D3356', pointerEvents: 'none',
                  }}>{orderNum}</text>
              </g>
            )}
            {shareCount != null && (
              <g>
                <circle cx={i * kw + (kw - 1.5) / 2} cy={18} r={13}
                  fill="rgba(246, 241, 231, 0.96)" stroke="#B88A2E" strokeWidth={1.6}/>
                <text x={i * kw + (kw - 1.5) / 2} y={22.5} textAnchor="middle"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700,
                    fill: '#8E6B22', pointerEvents: 'none', letterSpacing: '-0.02em',
                  }}>×{shareCount}</text>
              </g>
            )}
            {isLit && (
              <text x={i * kw + (kw - 1.5) / 2} y={kh - 20} textAnchor="middle"
                style={{
                  fontFamily: '"Fraunces", Georgia, serif', fontSize: whiteLetterSize, fontWeight: 500,
                  fill: labelColor, pointerEvents: 'none', letterSpacing: '-0.02em',
                }}>{label}</text>
            )}
            {clickable && !isLit && (
              <text x={i * kw + (kw - 1.5) / 2} y={kh - 13} textAnchor="middle"
                style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 400,
                  fill: 'rgba(31,30,46,0.3)', pointerEvents: 'none', letterSpacing: '0.05em',
                }}>
                {pitchName(k.pc, useFlats).replace('♯','#').replace('♭','b')}
              </text>
            )}
          </g>
        );
      })}

      {blackKeys.map((k) => {
        const fill = resolveFill(k.pc, k.midi, false);
        const isLit = highlightSet.has(k.midi);
        const octBase = octaveBaseIndex(k.midi) * 7;
        const x = (octBase + blackOffsets[k.pc]) * kw - bkw / 2;
        const label = isLit ? pitchName(k.pc, useFlats).replace('♯','#').replace('♭','b') : '';
        const orderNum = orderMap && isLit ? orderMap[k.midi] : null;
        const isSharedInCombined = combinedMode && isLit && (pcCountMap[k.pc] || 0) >= 2;
        const shareCount = isSharedInCombined ? pcCountMap[k.pc] : null;
        return (
          <g key={`b-${k.midi}`}
             onClick={clickable ? () => onKeyClick(k.pc, k.midi) : undefined}
             style={{ cursor: clickable ? 'pointer' : 'default' }}>
            <rect x={x} y={0} width={bkw} height={bkh} rx={2}
              fill={fill} stroke="#12121C" strokeWidth={1}
              style={{ transition: 'fill 220ms ease-out' }}/>
            {orderNum != null && (
              <g>
                <circle cx={x + bkw / 2} cy={14} r={9}
                  fill="rgba(246, 241, 231, 0.95)" stroke={rootPcs.has(k.pc) ? '#A63A2C' : '#3D3356'} strokeWidth={1.2}/>
                <text x={x + bkw / 2} y={17.6} textAnchor="middle"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
                    fill: rootPcs.has(k.pc) ? '#A63A2C' : '#3D3356', pointerEvents: 'none',
                  }}>{orderNum}</text>
              </g>
            )}
            {shareCount != null && (
              <g>
                <circle cx={x + bkw / 2} cy={16} r={11}
                  fill="rgba(246, 241, 231, 0.96)" stroke="#B88A2E" strokeWidth={1.5}/>
                <text x={x + bkw / 2} y={20} textAnchor="middle"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
                    fill: '#8E6B22', pointerEvents: 'none', letterSpacing: '-0.02em',
                  }}>×{shareCount}</text>
              </g>
            )}
            {isLit && (
              <text x={x + bkw / 2} y={bkh - 12} textAnchor="middle"
                style={{
                  fontFamily: '"Fraunces", Georgia, serif', fontSize: blackLetterSize, fontWeight: 500,
                  fill: '#F6F1E7', pointerEvents: 'none', letterSpacing: '-0.02em',
                }}>{label}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
//  SCALE RIBBON — a reference chart: key ▸ notes ▸ scale degrees
// ════════════════════════════════════════════════════════════

function ScaleRibbon({ rootIdx, scaleId, colors, fontMono, fontDisplay, useFlats }) {
  const s = SCALES[scaleId];
  const notes = s.steps.map((semi, i) => {
    const pc = mod12(rootIdx + semi);
    const isBlack = [1,3,6,8,10].includes(pc);
    return {
      pc,
      isBlack,
      label: s.labels[i],
      letter: pitchName(pc, useFlats).replace('♯','#').replace('♭','b'),
      idx: i,
    };
  });

  // Slightly taller keys so the letter has breathing room in the middle
  const keyW = 46, whiteH = 104, blackH = 64, gap = 10, topPad = 14;
  const totalW = notes.length * keyW + (notes.length - 1) * gap + 4;
  const labelY = topPad + whiteH + 28;
  const letterY = topPad + whiteH - 22;       // note letter near the bottom of each key
  const blackLetterY = topPad + blackH - 14;

  return (
    <svg viewBox={`0 0 ${totalW} ${labelY + 8}`} xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}>
      {notes.map((n, i) => {
        const x = 2 + i * (keyW + gap);
        const isRoot = i === 0;
        const fillColor = isRoot ? s.color : (n.isBlack ? '#1F1E2E' : '#FBFAF5');
        const h = n.isBlack ? blackH : whiteH;
        const rectX = n.isBlack ? x + 4 : x;
        const rectW = n.isBlack ? keyW - 8 : keyW;
        // Letter color: light on dark keys/root, dark on cream keys
        const letterColor = (isRoot || n.isBlack) ? '#F6F1E7' : '#1F1E2E';
        const ly = n.isBlack ? blackLetterY : letterY;
        const letterSize = n.isBlack ? 17 : 21;
        return (
          <g key={i}>
            <rect x={rectX} y={topPad} width={rectW} height={h} rx={4}
              fill={fillColor}
              stroke={isRoot ? s.color : (n.isBlack ? '#12121C' : '#2A2A3A')}
              strokeWidth={n.isBlack ? 1.2 : 1.4}
              style={{ animation: `scaleInDot 500ms ${i * 60}ms both ease-out` }}/>
            {/* Note letter printed on the key itself */}
            <text x={x + keyW / 2} y={ly} textAnchor="middle"
              style={{
                fontFamily: fontDisplay, fontSize: letterSize, fontWeight: 500,
                fill: letterColor, letterSpacing: '-0.02em',
                animation: `scaleInDot 500ms ${i * 60 + 120}ms both ease-out`,
              }}>
              {n.letter}
            </text>
            {/* Scale-degree label below */}
            <text x={x + keyW / 2} y={labelY} textAnchor="middle"
              style={{ fontFamily: fontMono, fontSize: 14, fontWeight: 500, fill: colors.ink2, letterSpacing: '0.06em' }}>
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HandUnderline({ color = '#524768', width = 1.8 }) {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ width: '100%', height: '12px', display: 'block' }}>
      <path d="M2,6 C 30,3 60,9 100,5 C 140,2 170,8 198,5"
        stroke={color} strokeWidth={width} fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN — CANTUS
// ════════════════════════════════════════════════════════════

export default function Cantus() {
  const [rootMidi, setRootMidi]       = useState(64);
  const [scaleId, setScaleId]         = useState('minor');
  const [voicingId, setVoicingId]     = useState('seconds');
  const [startDegId, setStartDegId]   = useState('root');
  const [pinboard, setPinboard]       = useState([]);
  const [cinema, setCinema]           = useState(false);
  const [cinemaScene, setCinemaScene] = useState(null);
  const [lastMove, setLastMove]       = useState(null);
  const [activeMidi, setActiveMidi]   = useState(null);
  const [audioError, setAudioError]   = useState(null);
  const [playingPinIdx, setPlayingPinIdx] = useState(null);
  const [recentPin, setRecentPin]     = useState(null); // flashes when user pins
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [guideOpen, setGuideOpen]     = useState(false);

  // ─── Transport (live-adjustable) ───
  const [bpm, setBpm]                 = useState(82);
  const [pattern, setPattern]         = useState('arpeggio');  // arpeggio | block | alberti | waltz | bossa | drone | strum
  const [timeSig, setTimeSig]         = useState('4/4');       // '4/4' | '3/4'
  const [metroVol, setMetroVol]       = useState(0.6);
  const [masterVol, setMasterVol]     = useState(0.9);

  const synthRef = useRef(null);
  const padRef = useRef(null);  // aliased to piano sampler for low-octave foundation
  const clickSynthRef = useRef(null);
  const engineRef = useRef(null);
  const audioReadyRef = useRef(false);
  const initPromiseRef = useRef(null);
  const cinemaRef = useRef(null);
  const arpTimersRef = useRef([]);
  const progressionCancelRef = useRef(false);
  const progressionStepRef = useRef(null);
  const progressionLoopIdxRef = useRef(0);
  const cinemaAutoStartedRef = useRef(false);

  // Refs mirror transport state so in-flight schedulers read fresh values
  const bpmRef        = useRef(82);
  const patternRef    = useRef('arpeggio');
  const timeSigRef    = useRef('4/4');
  const metroOnRef    = useRef(false);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { patternRef.current = pattern; }, [pattern]);
  useEffect(() => { timeSigRef.current = timeSig; }, [timeSig]);
  useEffect(() => { metroOnRef.current = metronomeOn; }, [metronomeOn]);

  const initAudio = useCallback(async () => {
    if (audioReadyRef.current) return;
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      try {
        const engine = await initAudioEngine();
        engineRef.current = engine;
        synthRef.current = engine.piano;
        padRef.current = engine.piano;  // piano doubles as the low-octave pad layer
        clickSynthRef.current = engine.click;
        // Apply current volume state to the engine
        try { engine.setMasterVolume(masterVol); } catch {}
        try { engine.setMetroVolume(metroVol); } catch {}
        audioReadyRef.current = true;
        setAudioError(null);
      } catch (err) {
        console.error('Audio init failed:', err);
        setAudioError(String(err?.message || err));
        initPromiseRef.current = null;
        throw err;
      }
    })();
    return initPromiseRef.current;
  }, [masterVol, metroVol]);

  // Live volume control — ramped, so sliders never click
  useEffect(() => {
    engineRef.current?.setMasterVolume(masterVol);
  }, [masterVol]);
  useEffect(() => {
    engineRef.current?.setMetroVolume(metroVol);
  }, [metroVol]);

  // Pattern → instrument mapping. Changing pattern triggers a lazy instrument load.
  const instrumentForPattern = (p) => {
    if (p === 'waltz') return 'harp';
    if (p === 'bossa' || p === 'strum') return 'nylon';
    return 'piano';
  };

  // Pre-load the instrument for the current pattern (once audio is ready).
  useEffect(() => {
    if (!audioReadyRef.current || !engineRef.current) return;
    const id = instrumentForPattern(pattern);
    engineRef.current.loadInstrument(id).catch(err => console.warn('sample load failed:', err));
  }, [pattern]);

  // Strummed block chord — each note triggered ~20ms after the previous.
  // Makes the chord feel pianistic instead of synthesizer-blocky.
  // Pad layer plays without strum for tight bass foundation.
  const playChord = useCallback((notes, duration = 1.8) => {
    if (!audioReadyRef.current || !synthRef.current) return;
    try {
      synthRef.current.releaseAll();
      padRef.current?.releaseAll();

      const now = Tone.now();
      const strumGap = 0.022; // 22ms between notes — subtle roll

      notes.forEach((n, i) => {
        // Slight velocity crescendo through the strum (0.78 → 0.95)
        const vel = 0.78 + (i / Math.max(1, notes.length - 1)) * 0.17;
        synthRef.current.triggerAttackRelease(n, duration, now + i * strumGap, vel);
      });

      // Pad: one chord, octave down, warm foundation
      const padNotes = notes.map(octDown);
      padRef.current?.triggerAttackRelease(padNotes, duration + 0.35, now, 0.6);
    } catch (err) { console.error('Play error:', err); }
  }, []);

  useEffect(() => () => {
    arpTimersRef.current.forEach(t => clearTimeout(t));
    if (cinemaRef.current) clearTimeout(cinemaRef.current);
    // Engine is disposed via disposeAudio() from audio/engine.ts (module-scoped singleton)
  }, []);

  // ─── Derived ───
  const voicing   = useMemo(() => VOICINGS.find(v => v.id === voicingId), [voicingId]);
  const startDeg  = useMemo(() => START_DEGREES.find(s => s.id === startDegId), [startDegId]);
  const scale     = SCALES[scaleId];
  const midiNotes = useMemo(() => voicingMidi(rootMidi, scaleId, voicing.stepSize, startDeg.degree), [rootMidi, scaleId, voicing, startDeg]);
  const intervalLabels = useMemo(() => voicingIntervals(scaleId, voicing.stepSize, startDeg.degree), [scaleId, voicing, startDeg]);
  const useFlats  = preferFlats(rootMidi, scaleId);
  const rootPc    = mod12(rootMidi);
  const chordName = chordNameFor(rootMidi, scaleId, useFlats);
  const spicyFlags = intervalLabels.map(lbl => lbl === '♭2' || lbl === '♯4' || lbl === '♭5');
  const displayHighlight = useMemo(() => midiNotes.map(displayMidi), [midiNotes]);

  const pinsData = useMemo(() => pinboard.map(p => {
    const v = VOICINGS.find(x => x.id === p.voicingId);
    const s = START_DEGREES.find(x => x.id === p.startDegId);
    const notes = voicingMidi(p.rootMidi, p.scaleId, v.stepSize, s.degree);
    const pcs = notes.map(mod12);
    const flats = preferFlats(p.rootMidi, p.scaleId);
    return {
      ...p, notes, pcs,
      chordName: chordNameFor(p.rootMidi, p.scaleId, flats),
      noteNames: notes.map(n => pitchName(mod12(n), flats)),
      scaleName: SCALES[p.scaleId].name,
      scaleColor: SCALES[p.scaleId].color,
      voicingLabel: v.label, startLabel: s.label,
    };
  }), [pinboard]);

  // pcCountMap: { pitchClass: howManyPinsContainIt }.
  // This is the one and only way we visualize sharing in the combined view —
  // no more competing "root" vs "shared" logic.
  const pcCountMap = useMemo(() => {
    const counts = {};
    pinsData.forEach(p => {
      // Use a set so a chord's own duplicates don't double-count a pc
      const pcs = new Set(p.pcs);
      pcs.forEach(pc => { counts[pc] = (counts[pc] || 0) + 1; });
    });
    return counts;
  }, [pinsData]);

  const sharedPcCount = useMemo(
    () => Object.values(pcCountMap).filter(n => n >= 2).length,
    [pcCountMap]
  );

  const combinedMidis = useMemo(() => {
    const set = new Set();
    pinsData.forEach(p => p.notes.forEach(m => set.add(displayMidi(m))));
    return Array.from(set);
  }, [pinsData]);

  const currentPinIdx = pinboard.findIndex(p =>
    p.rootMidi === rootMidi && p.scaleId === scaleId &&
    p.voicingId === voicingId && p.startDegId === startDegId
  );
  const isPinned = currentPinIdx >= 0;

  const clearArpTimers = () => {
    arpTimersRef.current.forEach(t => clearTimeout(t));
    arpTimersRef.current = [];
    setActiveMidi(null);
  };
  const stopCinema = () => {
    if (cinemaRef.current) { clearTimeout(cinemaRef.current); cinemaRef.current = null; }
    if (cinema) setCinema(false);
    if (cinemaScene) setCinemaScene(null);
  };
  const stopProgression = () => {
    progressionCancelRef.current = true;
    // Cancel the next scheduled step
    if (progressionStepRef?.current) {
      clearTimeout(progressionStepRef.current);
      progressionStepRef.current = null;
    }
    // Release any sustained notes immediately
    try { synthRef.current?.releaseAll(); } catch {}
    try { padRef.current?.releaseAll(); } catch {}
    setPlayingPinIdx(null);
    clearArpTimers();
  };

  // ─── Actions ───
  // AUDIO POLICY: Only the three explicit playback buttons produce sound
  //   · Hear it (playCurrent) — block chord, strummed
  //   · Bloom (playBloom)     — notes enter one-by-one and stack
  //   · Ripple (playRipple)   — palindrome arpeggio, up then back down
  // plus playProgression for the pinboard sequence. Every other action is silent.

  const playCurrent = async () => {
    stopCinema(); stopProgression(); clearArpTimers();
    try { await initAudio(); } catch { return; }
    playChord(notesToToneNames(midiNotes), 1.9);
  };

  // BLOOM: each note enters and STAYS. By the end all three are sounding.
  // Good for "listen to this chord being built from the bottom up."
  const playBloom = async () => {
    stopCinema(); stopProgression(); clearArpTimers();
    try { await initAudio(); } catch { return; }
    const names = notesToToneNames(midiNotes);
    const padNotes = names.map(octDown);
    const gap = 0.38;
    const holdTail = 1.6; // chord holds for this long after the last note enters
    const now = Tone.now();

    names.forEach((n, i) => {
      const vel = 0.75;
      // Each note sustains from its entry through the end of the phrase
      const noteDur = (names.length - i) * gap + holdTail;
      synthRef.current.triggerAttackRelease(n, noteDur, now + i * gap, vel);
      const t = setTimeout(() => setActiveMidi(displayHighlight[i]), i * gap * 1000);
      arpTimersRef.current.push(t);
    });

    // Pad sustains across the whole bloom
    padRef.current?.triggerAttackRelease(padNotes, names.length * gap + holdTail + 0.3, now + 0.1, 0.5);

    const tEnd = setTimeout(() => setActiveMidi(null), (names.length * gap + holdTail) * 1000);
    arpTimersRef.current.push(tEnd);
  };

  // RIPPLE: up the chord, then back down — a palindromic arpeggio.
  // Good for "listen to the shape of this voicing as a melody."
  const playRipple = async () => {
    stopCinema(); stopProgression(); clearArpTimers();
    try { await initAudio(); } catch { return; }
    const names = notesToToneNames(midiNotes);
    const padNotes = names.map(octDown);
    // Sequence: low → high → low (palindrome)
    const sequence = [...names, ...names.slice(0, -1).reverse()];
    const displaySeq = [...displayHighlight, ...displayHighlight.slice(0, -1).reverse()];
    const gap = 0.26;
    const now = Tone.now();

    sequence.forEach((n, i) => {
      // Gentle bell curve: soft at the edges, fuller in the middle
      const half = (sequence.length - 1) / 2;
      const distFromCenter = Math.abs(i - half) / half;
      const vel = 0.65 + (1 - distFromCenter) * 0.25;
      synthRef.current.triggerAttackRelease(n, gap * 1.1, now + i * gap, vel);
      const t = setTimeout(() => setActiveMidi(displaySeq[i]), i * gap * 1000);
      arpTimersRef.current.push(t);
    });

    // Pad holds under the whole ripple
    padRef.current?.triggerAttackRelease(padNotes, sequence.length * gap + 0.9, now + 0.1, 0.5);

    // Soft block at the end as resolution
    const blockAt = now + sequence.length * gap + 0.05;
    names.forEach((n, i) => {
      synthRef.current.triggerAttackRelease(n, 1.1, blockAt + i * 0.018, 0.72);
    });

    const tEnd = setTimeout(() => setActiveMidi(null), (sequence.length * gap + 0.25) * 1000);
    arpTimersRef.current.push(tEnd);
  };

  // Pinning is now silent — no confirmation stab
  const togglePin = () => {
    stopCinema();
    if (isPinned) {
      const id = pinboard[currentPinIdx].id;
      setPinboard(pinboard.filter(p => p.id !== id));
      return;
    }
    if (pinboard.length >= 4) return;
    const newPin = { id: Date.now(), rootMidi, scaleId, voicingId, startDegId };
    setPinboard([...pinboard, newPin]);
    setRecentPin(newPin.id);
    setTimeout(() => setRecentPin(null), 800);
  };

  // PIN SHORTCUT — adds a destination chord to pinboard WITHOUT navigating.
  const pinDestination = (move, flipQuality = false) => {
    if (pinboard.length >= 4) return;
    const newRoot = rootMidi + move.semitones;
    let adjusted = newRoot;
    while (adjusted < 55) adjusted += 12;
    while (adjusted > 72) adjusted -= 12;
    let newScaleId = scaleId;
    if (flipQuality) newScaleId = isMajorFamily(scaleId) ? 'minor' : 'major';
    if (pinboard.some(p => p.rootMidi === adjusted && p.scaleId === newScaleId &&
      p.voicingId === voicingId && p.startDegId === startDegId)) return;
    const newPin = { id: Date.now(), rootMidi: adjusted, scaleId: newScaleId, voicingId, startDegId };
    setPinboard([...pinboard, newPin]);
    setRecentPin(newPin.id);
    setTimeout(() => setRecentPin(null), 800);
  };

  const destinationIsPinned = (move, flipQuality = false) => {
    const newRoot = rootMidi + move.semitones;
    let adjusted = newRoot;
    while (adjusted < 55) adjusted += 12;
    while (adjusted > 72) adjusted -= 12;
    let newScaleId = scaleId;
    if (flipQuality) newScaleId = isMajorFamily(scaleId) ? 'minor' : 'major';
    return pinboard.some(p => p.rootMidi === adjusted && p.scaleId === newScaleId &&
      p.voicingId === voicingId && p.startDegId === startDegId);
  };

  const unpinById = (id) => {
    if (playingPinIdx !== null) stopProgression();
    setPinboard(pinboard.filter(p => p.id !== id));
  };
  const clearPinboard = () => { stopProgression(); setPinboard([]); };

  const movePin = (idx, delta) => {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= pinboard.length) return;
    stopProgression();
    const copy = [...pinboard];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    setPinboard(copy);
  };

  // ─── SURPRISE ME: auto-populate 4 pins with musically coherent progressions ───

  // Helper: generate a fresh pin object. Clamps root into the comfortable range.
  const makePin = (rootMidi, scaleId, voicingId, startDegId) => {
    let r = rootMidi;
    while (r < 55) r += 12;
    while (r > 72) r -= 12;
    return { id: Date.now() + Math.random(), rootMidi: r, scaleId, voicingId, startDegId };
  };

  // Progression banks (CLASSIC_PATTERNS, CINEMATIC_PATTERNS, CLASSIC_KEYS,
  // CINEMATIC_ROOTS, CINEMATIC_VOICING_PLANS) are imported from ./theory/progressions.
  /* REMOVED_PROG_START
  const _OLD_CLASSIC_REMOVED = [
    // I–V–vi–IV · "Axis of Awesome" · pop/hymn/praise
    { label: 'I–V–vi–IV',     steps: [[0,'M'], [7,'M'], [9,'m'], [5,'M']] },
    // vi–IV–I–V · Zombie, Someone Like You
    { label: 'vi–IV–I–V',     steps: [[9,'m'], [5,'M'], [0,'M'], [7,'M']] },
    // I–vi–IV–V · "50s doo-wop" · Earth Angel, Stand By Me
    { label: 'I–vi–IV–V',     steps: [[0,'M'], [9,'m'], [5,'M'], [7,'M']] },
    // I–V–vi–iii · classic pop variation
    { label: 'I–V–vi–iii',    steps: [[0,'M'], [7,'M'], [9,'m'], [4,'m']] },
    // ii–V–I–vi · jazz turnaround
    { label: 'ii–V–I–vi',     steps: [[2,'m'], [7,'M'], [0,'M'], [9,'m']] },
    // I–IV–V–I · hymn / 12-bar
    { label: 'I–IV–V–I',      steps: [[0,'M'], [5,'M'], [7,'M'], [0,'M']] },
    // vi–V–IV–V · Cry Me a River, Stairway
    { label: 'vi–V–IV–V',     steps: [[9,'m'], [7,'M'], [5,'M'], [7,'M']] },
    // I–iii–IV–V · Every Breath You Take, classic ballad
    { label: 'I–iii–IV–V',    steps: [[0,'M'], [4,'m'], [5,'M'], [7,'M']] },
    // I–IV–vi–V · More Than a Feeling
    { label: 'I–IV–vi–V',     steps: [[0,'M'], [5,'M'], [9,'m'], [7,'M']] },
    // I–V–IV–I · gospel/country
    { label: 'I–V–IV–I',      steps: [[0,'M'], [7,'M'], [5,'M'], [0,'M']] },
  ];

  // CINEMATIC: non-diatonic chromatic-mediant progressions — the Zimmer
  // vocabulary. These are chord moves that *don't belong* to a single key:
  // the jumps themselves (up a M3, down a m6, to the ♭VI, to the tritone)
  // are what create the filmic wonder/dread/suspense.
  //
  // Each chord is [offset_semitones_from_start, quality]
  const CINEMATIC_PATTERNS = [
    // Inception "Dream is Collapsing" · minor → ♭VI → ♭III → ♭VII (all minor)
    { label: 'Inception',       steps: [[0,'m'], [8,'m'], [3,'m'], [10,'m']] },
    // Interstellar main theme · I → ↑M3 → ↓m3 → home (major chromatic mediants)
    { label: 'Interstellar',    steps: [[0,'M'], [4,'M'], [0,'M'], [8,'M']] },
    // Dark Knight / Batman · i → ↑M3 → ↓M2 → ♭VI (minor mediant + chromatic)
    { label: 'Dark Knight',     steps: [[0,'m'], [4,'M'], [2,'M'], [8,'M']] },
    // Zimmer "Time" · i → ♭VI → ♭III → ♭VII — descending cycle of mediants
    { label: 'Time',            steps: [[0,'m'], [8,'M'], [3,'M'], [10,'M']] },
    // Pirates "He's a Pirate" · i → ♭VII → ♭VI → V (Andalusian + major V)
    { label: 'Pirates',         steps: [[0,'m'], [10,'M'], [8,'M'], [7,'M']] },
    // Man of Steel · I → ♭III → ♭VI → I  (double chromatic mediant)
    { label: 'Man of Steel',    steps: [[0,'M'], [3,'M'], [8,'M'], [0,'M']] },
    // Gladiator "Now We Are Free" · i → ♭VII → ♭VI → ♭VII (Dorian grandeur)
    { label: 'Gladiator',       steps: [[0,'m'], [10,'M'], [8,'M'], [10,'M']] },
    // Tritone drama · i → ♭V (tritone) → ♭VI → V — pure filmic tension
    { label: 'Tritone Drama',   steps: [[0,'m'], [6,'M'], [8,'M'], [7,'M']] },
    // Arrival / Villeneuve · i → ↑M3(major) → ↑m3(minor) → ♭VI
    { label: 'Arrival',         steps: [[0,'m'], [4,'M'], [7,'m'], [8,'M']] },
    // Blade Runner 2049 · i → ♭III → V → ♭VI · suspended uncertainty
    { label: 'Blade Runner',    steps: [[0,'m'], [3,'m'], [7,'M'], [8,'m']] },
  ];

  REMOVED_PROG_END */

  // Refs track which pattern was used last so consecutive taps cycle forward
  const classicIdxRef = useRef(-1);
  const cinematicIdxRef = useRef(-1);

  // CLASSIC: traditional diatonic progressions in 3rds (triads)
  const surpriseClassic = () => {
    stopCinema(); stopProgression(); clearArpTimers();
    // Advance to a different pattern than last time
    let idx = classicIdxRef.current;
    let next = idx;
    while (next === idx && CLASSIC_PATTERNS.length > 1) {
      next = Math.floor(Math.random() * CLASSIC_PATTERNS.length);
    }
    classicIdxRef.current = next;
    const pattern = CLASSIC_PATTERNS[next];
    const tonic = CLASSIC_KEYS[Math.floor(Math.random() * CLASSIC_KEYS.length)];

    setPinboard(pattern.steps.map(([offset, quality]) =>
      makePin(tonic + offset, quality === 'M' ? 'major' : 'minor', 'thirds', 'root')
    ));
    const [firstOffset, firstQuality] = pattern.steps[0];
    setRootMidi(tonic + firstOffset);
    setScaleId(firstQuality === 'M' ? 'major' : 'minor');
    setVoicingId('thirds'); setStartDegId('root');
    setLastMove(`classic · ${pattern.label}`);
  };

  // CINEMATIC: non-diatonic / chromatic-mediant film-score progressions
  // in quartal 4ths voicings for that open, suspended, Zimmer sound.
  const surpriseCinematic = () => {
    stopCinema(); stopProgression(); clearArpTimers();
    let idx = cinematicIdxRef.current;
    let next = idx;
    while (next === idx && CINEMATIC_PATTERNS.length > 1) {
      next = Math.floor(Math.random() * CINEMATIC_PATTERNS.length);
    }
    cinematicIdxRef.current = next;
    const pattern = CINEMATIC_PATTERNS[next];
    const tonic = CINEMATIC_ROOTS[Math.floor(Math.random() * CINEMATIC_ROOTS.length)];
    const vPlan = CINEMATIC_VOICING_PLANS[Math.floor(Math.random() * CINEMATIC_VOICING_PLANS.length)];

    setPinboard(pattern.steps.map(([offset, quality], i) => {
      const [v, sd] = vPlan[i];
      return makePin(tonic + offset, quality === 'M' ? 'major' : 'minor', v, sd);
    }));
    const [firstOffset, firstQuality] = pattern.steps[0];
    const [firstV, firstSD] = vPlan[0];
    setRootMidi(tonic + firstOffset);
    setScaleId(firstQuality === 'M' ? 'major' : 'minor');
    setVoicingId(firstV); setStartDegId(firstSD);
    setLastMove(`cinematic · ${pattern.label}`);
  };

  // loadPin — navigate to a pinned chord, silent
  const loadPin = (pin) => {
    stopCinema(); stopProgression(); clearArpTimers();
    setRootMidi(pin.rootMidi); setScaleId(pin.scaleId);
    setVoicingId(pin.voicingId); setStartDegId(pin.startDegId);
    setLastMove(`pin · ${chordNameFor(pin.rootMidi, pin.scaleId, preferFlats(pin.rootMidi, pin.scaleId))}`);
  };

  // ─── PROGRESSION PLAYBACK — looping, grid-aligned, reorder-safe ───
  //
  // Design: everything is scheduled against a fixed tempo grid.
  // Each chord = exactly 4 beats. Metronome ticks and chord events share
  // the same time anchor, so they can never drift apart.
  //
  // Each "step" schedules ONE chord + its 4 metronome ticks, then schedules
  // itself to run again at the next chord boundary. This means:
  //   - Reordering pins mid-play is picked up at the next step (reads fresh pinsData)
  //   - Adding/removing pins mid-play adjusts gracefully
  //   - Stop cancels the scheduled setTimeout cleanly
  //   - It loops forever — no "end of progression" stutter

  // ─── Pattern library ───
  // Each pattern returns a list of { note, time, dur, vel } events relative
  // to audioTime=0 for one bar. `names` is chord tones low→high (Tone.js note
  // strings). BEAT is seconds per beat, BEATS is beats in this bar.
  //
  // Designed to feel musical across cultures and levels:
  //   arpeggio  — ascending, universal (piano)
  //   block     — straight chord, gospel/hymn (piano)
  //   alberti   — lo-hi-mid-hi, Classical (piano)
  //   waltz     — bass then chord-chord, 3/4 folk/jazz (harp)
  //   bossa     — syncopated Brazilian comping (nylon)
  //   drone     — held sustain + melodic top, Carnatic/Celtic (piano)
  //   strum     — rolled chord attacks, global folk (nylon)
  const buildPatternEvents = (patternId, names, BEAT, BEATS) => {
    const bar = BEAT * BEATS;
    const low = names.map(octDown);
    const ev = [];

    if (patternId === 'block') {
      // Single block chord held most of the bar
      names.forEach((n, j) => ev.push({ note: n, time: j * 0.018, dur: bar * 0.88, vel: 0.78 }));
      // Low octave foundation
      ev.push({ note: low, time: 0.04, dur: bar * 0.9, vel: 0.5, layer: 'low' });
      return ev;
    }

    if (patternId === 'alberti') {
      // Low - high - mid - high (the Classical Alberti bass), one pair per beat
      const l = names[0], h = names[names.length - 1], m = names[Math.floor(names.length / 2)] || names[0];
      const order = [l, h, m, h];
      const noteDur = BEAT * 0.92;
      for (let b = 0; b < BEATS; b++) {
        ev.push({ note: order[b % order.length], time: b * BEAT, dur: noteDur, vel: 0.72 });
      }
      // Low octave sustain underneath
      ev.push({ note: low, time: 0.04, dur: bar * 0.95, vel: 0.4, layer: 'low' });
      return ev;
    }

    if (patternId === 'waltz') {
      // 3/4 feel regardless of BEATS. Bass on 1, chord on 2 and 3.
      // If BEATS != 3 we still lay this over the bar's first 3 beats and rest.
      const bassNote = low[0];
      ev.push({ note: bassNote, time: 0, dur: BEAT * 0.8, vel: 0.7, layer: 'low' });
      for (let c = 1; c < 3; c++) {
        names.forEach((n, j) => ev.push({ note: n, time: c * BEAT + j * 0.012, dur: BEAT * 0.55, vel: 0.62 }));
      }
      return ev;
    }

    if (patternId === 'bossa') {
      // Syncopated bossa: bass on 1 & 3, chord hits on "&" of 2 and on 4.5
      const bassNote = low[0];
      ev.push({ note: bassNote, time: 0,            dur: BEAT * 0.9,  vel: 0.72, layer: 'low' });
      ev.push({ note: bassNote, time: 2 * BEAT,     dur: BEAT * 0.9,  vel: 0.68, layer: 'low' });
      const chordHits = [BEAT * 1.5, BEAT * 2.75, BEAT * 3.5];
      chordHits.forEach(t => {
        if (t >= bar) return;
        names.forEach((n, j) => ev.push({ note: n, time: t + j * 0.01, dur: BEAT * 0.55, vel: 0.62 }));
      });
      return ev;
    }

    if (patternId === 'drone') {
      // Sustained foundation + melodic top-note arpeggio
      ev.push({ note: low, time: 0, dur: bar * 0.97, vel: 0.48, layer: 'low' });
      ev.push({ note: names, time: 0.05, dur: bar * 0.95, vel: 0.45 });
      // Gentle top-note pulses on each beat
      const top = names[names.length - 1];
      for (let b = 0; b < BEATS; b++) {
        ev.push({ note: top, time: b * BEAT + 0.08, dur: BEAT * 0.6, vel: 0.5 });
      }
      return ev;
    }

    if (patternId === 'strum') {
      // Rolled strum on each beat (guitar-flavored) — up-stroke low→high,
      // light off-beat strum on '&' of 2 for movement
      const rollGap = 0.028;
      for (let b = 0; b < BEATS; b++) {
        const up = b % 2 === 0;                      // down-strum on 1,3
        const base = b * BEAT;
        const seq = up ? names : [...names].reverse();
        seq.forEach((n, j) => {
          ev.push({ note: n, time: base + j * rollGap, dur: BEAT * 0.85, vel: up ? 0.78 : 0.62 });
        });
      }
      // Low foundation
      ev.push({ note: low[0], time: 0, dur: bar * 0.92, vel: 0.6, layer: 'low' });
      return ev;
    }

    // DEFAULT — arpeggio + resolving block (the original feel)
    const ARP_GAP = BEAT * 0.58;
    names.forEach((n, j) => {
      const vel = 0.68 + (j / Math.max(1, names.length - 1)) * 0.25;
      ev.push({ note: n, time: j * ARP_GAP, dur: ARP_GAP * 1.15, vel });
    });
    ev.push({ note: low, time: 0.05, dur: bar * 0.92, vel: 0.5, layer: 'low' });
    const blockAt = names.length * ARP_GAP + 0.04;
    names.forEach((n, j) => {
      ev.push({ note: n, time: blockAt + j * 0.02, dur: bar * 0.78 * 0.45, vel: 0.82 });
    });
    return ev;
  };

  const playProgression = async () => {
    if (pinsData.length < 2) return;
    stopCinema(); clearArpTimers();
    try { await initAudio(); } catch { return; }
    if (!audioReadyRef.current) return;

    // Reset state
    progressionCancelRef.current = false;
    progressionLoopIdxRef.current = 0;

    // Read freshly on each step — this is what makes reordering live-safe
    const getPinsSnapshot = () => pinsData;

    const scheduleChord = (audioTime, pinIdx, pinsSnap) => {
      const p = pinsSnap[pinIdx];
      if (!p) return;

      // Fresh read of transport state every bar — live-adjustable
      const curBpm      = bpmRef.current;
      const curPattern  = patternRef.current;
      const curTimeSig  = timeSigRef.current;
      const curMetroOn  = metroOnRef.current;
      const BEAT        = 60 / curBpm;
      const BEATS       = curTimeSig === '3/4' ? 3 : 4;
      const CHORD_DUR   = BEAT * BEATS;

      const displayHi = p.notes.map(displayMidi);
      const names = notesToToneNames(p.notes);

      // Pick the instrument for this pattern. Fall back to piano if the
      // sample bank isn't loaded yet (silent lazy-load kicked off by effect).
      const instId = instrumentForPattern(curPattern);
      const instruments = engineRef.current?.instruments || {};
      const voice = instruments[instId] || synthRef.current;
      const lowVoice = synthRef.current;  // piano always carries the low layer

      // Build pattern events for this bar
      const events = buildPatternEvents(curPattern, names, BEAT, BEATS);
      events.forEach(e => {
        const v = e.layer === 'low' ? lowVoice : voice;
        if (!v) return;
        try { v.triggerAttackRelease(e.note, e.dur, audioTime + e.time, e.vel); } catch {}
      });

      // METRONOME — one tick per beat, accent on 1
      if (curMetroOn && clickSynthRef.current) {
        for (let b = 0; b < BEATS; b++) {
          const isDownbeat = b === 0;
          clickSynthRef.current.triggerAttackRelease(
            isDownbeat ? 'C6' : 'G5',
            0.035,
            audioTime + b * BEAT,
            isDownbeat ? 0.78 : 0.32
          );
        }
      }

      // UI UPDATES
      const startMs = (audioTime - Tone.now()) * 1000;
      const tChord = setTimeout(() => {
        if (progressionCancelRef.current) return;
        setRootMidi(p.rootMidi); setScaleId(p.scaleId);
        setVoicingId(p.voicingId); setStartDegId(p.startDegId);
        setPlayingPinIdx(pinIdx);
        setLastMove(`playing · ${p.chordName}`);
      }, Math.max(0, startMs));
      arpTimersRef.current.push(tChord);

      // Highlight each chord tone once per bar, spaced across the bar
      const HI_GAP = (CHORD_DUR / Math.max(1, names.length)) * 1000;
      names.forEach((_, j) => {
        const t = setTimeout(() => {
          if (progressionCancelRef.current) return;
          setActiveMidi(displayHi[j]);
        }, Math.max(0, startMs + j * HI_GAP));
        arpTimersRef.current.push(t);
      });
      const tClear = setTimeout(() => {
        if (!progressionCancelRef.current) setActiveMidi(null);
      }, Math.max(0, startMs + CHORD_DUR * 1000 - 60));
      arpTimersRef.current.push(tClear);
    };

    // The step function — runs once per chord and reschedules itself
    const step = () => {
      if (progressionCancelRef.current) return;

      const pinsSnap = getPinsSnapshot();
      if (pinsSnap.length < 2) {
        progressionCancelRef.current = false;
        setPlayingPinIdx(null);
        setActiveMidi(null);
        return;
      }

      const idx = progressionLoopIdxRef.current % pinsSnap.length;

      const LOOKAHEAD = 0.12;
      const chordStart = Tone.now() + LOOKAHEAD;
      scheduleChord(chordStart, idx, pinsSnap);

      progressionLoopIdxRef.current = idx + 1;

      // Next step uses the LIVE tempo — bpm/timeSig changes land at next bar
      const curBpm = bpmRef.current;
      const curBeats = timeSigRef.current === '3/4' ? 3 : 4;
      const nextMs = (60 / curBpm) * curBeats * 1000;
      progressionStepRef.current = setTimeout(step, nextMs);
    };

    step();
  };

  // Navigation actions — state-only, no sound. User must click Hear it / Bloom / Ripple.
  const doMove = (move, flipQuality = false) => {
    stopCinema(); stopProgression(); clearArpTimers();
    const newRoot = rootMidi + move.semitones;
    let adjusted = newRoot;
    while (adjusted < 55) adjusted += 12;
    while (adjusted > 72) adjusted -= 12;
    let newScaleId = scaleId;
    if (flipQuality) newScaleId = isMajorFamily(scaleId) ? 'minor' : 'major';
    setRootMidi(adjusted); setScaleId(newScaleId);
    setLastMove(`${move.arrow}${move.label}${flipQuality ? ' ↔' : ''}`);
  };

  const quickFlipMajorMinor = () => {
    if (scaleId !== 'major' && scaleId !== 'minor') return;
    stopCinema(); stopProgression(); clearArpTimers();
    setScaleId(scaleId === 'minor' ? 'major' : 'minor');
  };

  const onPianoKeyClick = (pc) => {
    stopCinema(); stopProgression(); clearArpTimers();
    const newMidi = 60 + pc;
    setRootMidi(newMidi);
    setLastMove(`root → ${pitchName(pc, preferFlats(newMidi, scaleId))}`);
  };

  const pickScale = (newId) => {
    stopCinema(); stopProgression(); clearArpTimers();
    setScaleId(newId);
  };

  const pickVoicing = (id) => {
    stopCinema(); stopProgression(); clearArpTimers();
    setVoicingId(id);
  };

  const pickStartDeg = (id) => {
    stopCinema(); stopProgression(); clearArpTimers();
    setStartDegId(id);
  };

  const reset = () => {
    stopCinema(); stopProgression(); clearArpTimers();
    setRootMidi(64); setScaleId('minor');
    setVoicingId('seconds'); setStartDegId('root');
    setPinboard([]); setLastMove(null);
  };

  // ─── CINEMA — SILENT marketing reel · 5 acts, 18 scenes ───
  // Each scene with `act` starts a new chapter; the banner highlights the act change.
  const CINEMA_SEQUENCE = [
    // ACT I — the voicing magic (same chord, many voices)
    { act: 'I · one chord, many voices', root: 64, scaleId: 'minor', voicing: 'thirds',   startDeg: 'root',  hold: 2100, title: 'Em · the classic triad in 3rds' },
    {                                    root: 64, scaleId: 'minor', voicing: 'seconds',  startDeg: 'root',  hold: 1900, title: 'same chord, closer · 2nds cluster',       move: 'voicing → 2nds' },
    {                                    root: 64, scaleId: 'minor', voicing: 'fourths',  startDeg: 'root',  hold: 1900, title: 'open it up · 4ths, the quartal sound',   move: 'voicing → 4ths' },
    {                                    root: 64, scaleId: 'minor', voicing: 'fifths',   startDeg: 'root',  hold: 1900, title: 'airy · 5ths, the quintal horizon',        move: 'voicing → 5ths' },
    {                                    root: 64, scaleId: 'minor', voicing: 'sixths',   startDeg: 'root',  hold: 2100, title: 'cinematic · wide 6ths',                   move: 'voicing → 6ths' },

    // ACT II — same root, new color (scale variety)
    { act: 'II · same root, new color',  root: 64, scaleId: 'dorian',    voicing: 'fourths', startDeg: 'root',  hold: 2100, title: 'E Dorian · jazzy, hopeful',      move: 'scale → Dorian' },
    {                                    root: 64, scaleId: 'phrygian',  voicing: 'fourths', startDeg: 'root',  hold: 2100, title: 'E Phrygian · Spanish mist',     move: 'scale → Phrygian' },
    {                                    root: 64, scaleId: 'phrygDom',  voicing: 'fourths', startDeg: 'root',  hold: 2300, title: 'Phrygian Dominant · flamenco fire', move: 'scale → Phryg Dom' },
    {                                    root: 64, scaleId: 'harmMinor', voicing: 'fourths', startDeg: 'third', hold: 2200, title: 'Harmonic Minor · voiced from the ♭3', move: 'start → ♭3' },
    {                                    root: 64, scaleId: 'lydian',    voicing: 'fifths',  startDeg: 'root',  hold: 2200, title: 'E Lydian · dreamy ♯4',           move: 'scale → Lydian' },

    // ACT III — move through harmony (interval navigation)
    { act: 'III · move through harmony', root: 67, scaleId: 'minor', voicing: 'thirds', startDeg: 'root', hold: 2000, title: '↑ minor third · Gm, the relative',     move: '↑ m3' },
    {                                    root: 67, scaleId: 'major', voicing: 'thirds', startDeg: 'root', hold: 2000, title: '↔ flip to G major · parallel',       move: '↔ major' },
    {                                    root: 60, scaleId: 'major', voicing: 'thirds', startDeg: 'root', hold: 2000, title: '↓ P5 · land in C major · the IV world',move: '↓ P5' },
    {                                    root: 57, scaleId: 'minor', voicing: 'thirds', startDeg: 'root', hold: 2000, title: '↓ M3 · Am, the mirror',              move: '↓ M3' },

    // ACT IV — ancient colors (rare scales showcase)
    { act: 'IV · ancient colors',        root: 57, scaleId: 'pentMinor', voicing: 'thirds', startDeg: 'root', hold: 2200, title: 'A Minor Pentatonic · universal 5',  move: 'scale → Pentatonic' },
    {                                    root: 57, scaleId: 'blues',     voicing: 'thirds', startDeg: 'root', hold: 2400, title: 'A Blues · the blue note',           move: 'scale → Blues' },
    {                                    root: 60, scaleId: 'wholeTone', voicing: 'thirds', startDeg: 'root', hold: 2400, title: 'C Whole Tone · Debussy\'s dream',    move: 'scale → Whole Tone' },

    // FINALE
    { act: 'V · home again',             root: 64, scaleId: 'minor', voicing: 'fourths', startDeg: 'third', hold: 3000, title: 'back home · Em, richer than before', move: 'home · Em in 4ths' },
  ];

  const startCinemaLoop = () => {
    setCinema(true);
    let i = 0;
    let currentAct = null;
    const step = () => {
      if (i >= CINEMA_SEQUENCE.length) { setCinema(false); setCinemaScene(null); return; }
      const s = CINEMA_SEQUENCE[i];
      if (s.act) currentAct = s.act;
      setRootMidi(s.root); setScaleId(s.scaleId);
      setVoicingId(s.voicing); setStartDegId(s.startDeg);
      setLastMove(s.move || null);
      setCinemaScene({ i: i + 1, total: CINEMA_SEQUENCE.length, title: s.title, act: currentAct, actStart: !!s.act });
      // NO AUDIO in cinema — visual tour only.
      i++;
      cinemaRef.current = setTimeout(step, s.hold);
    };
    step();
  };

  const runCinema = () => {
    if (cinema) { stopCinema(); return; }
    stopProgression(); clearArpTimers();
    startCinemaLoop();
  };

  useEffect(() => {
    if (cinemaAutoStartedRef.current) return;
    cinemaAutoStartedRef.current = true;
    const t = setTimeout(() => { startCinemaLoop(); }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewOfMove = (move, flipQuality = false) => {
    const newRoot = mod12(rootMidi + move.semitones);
    let q = scaleId;
    if (flipQuality) q = isMajorFamily(scaleId) ? 'minor' : 'major';
    const flats = preferFlats(newRoot, q);
    return chordNameFor(newRoot, q, flats);
  };

  const colors = {
    paper: '#F6F1E7', paperD: '#EDE5D0', ink: '#1F1E2E', ink2: '#524768',
    teal: '#2D5E6B', spice: '#C64B3B', spiceBg: 'rgba(198, 75, 59, 0.08)',
    gold: '#B88A2E', goldBg: 'rgba(184, 138, 46, 0.10)',
    muted: '#8D846F', line: 'rgba(31, 30, 46, 0.12)',
  };
  const fontDisplay = '"Fraunces", "Playfair Display", Georgia, serif';
  const fontUI      = '"Geist", "Inter Tight", system-ui, sans-serif';
  const fontMono    = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

  const canQuickFlip = (scaleId === 'major' || scaleId === 'minor');
  const pinDisabled = pinboard.length >= 4 && !isPinned;

  const primaryAsc  = MOVES.filter(m => (m.dir === 'up' || m.dir === 'both') && m.tier === 'primary');
  const secondaryAsc = MOVES.filter(m => m.dir === 'up' && m.tier === 'secondary');
  const primaryDesc = MOVES.filter(m => m.dir === 'down' && m.tier === 'primary');
  const secondaryDesc = MOVES.filter(m => m.dir === 'down' && m.tier === 'secondary');

  return (
    <div style={{
      minHeight: '100vh', background: colors.paper, color: colors.ink,
      fontFamily: fontUI, padding: '32px 20px 60px', position: 'relative', overflow: 'hidden',
    }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />

      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.15  0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        opacity: 0.55, mixBlendMode: 'multiply',
      }}/>

      <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="/nsm-logo.png"
              alt="Nathaniel School of Music"
              style={{ height: 72, width: 'auto', display: 'block' }}
              decoding="async"
              loading="eager"
            />
            <div>
              <div style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.22em', color: colors.ink2, textTransform: 'uppercase' }}>
                Nathaniel School of Music · voicing lab
              </div>
              <div style={{ fontFamily: fontDisplay, fontSize: '36px', fontWeight: 500, marginTop: '2px', lineHeight: 1, letterSpacing: '-0.02em' }}>
                Can<span style={{ fontStyle: 'italic', color: colors.ink2 }}>tus</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setGuideOpen(true)} style={headerUtilBtn(colors, fontMono)} title="Learn how to use Cantus">
              <Sparkles size={12}/> LEARN
            </button>
            <button onClick={runCinema} style={{
              ...headerUtilBtn(colors, fontMono),
              background: cinema ? colors.spice : 'transparent',
              color: cinema ? colors.paper : colors.ink2,
              borderColor: cinema ? colors.spice : colors.line,
            }} title="A silent visual tour of what Cantus can do">
              <Film size={12}/> {cinema ? 'STOP' : 'TOUR'}
            </button>
            <button onClick={reset} style={headerUtilBtn(colors, fontMono)} title="Reset to Em">
              <RotateCcw size={12}/> RESET
            </button>
          </div>
        </header>

        {audioError && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', background: '#FBE9E5',
            border: `1px solid ${colors.spice}`, borderRadius: 6,
            fontFamily: fontMono, fontSize: 11, color: colors.spice,
          }}>
            Audio couldn't start: {audioError}. Try clicking any button — browsers need a user gesture first.
          </div>
        )}

        {cinema && cinemaScene && (
          <div style={{
            marginBottom: '20px', padding: '12px 16px',
            background: colors.paperD, border: `1px dashed ${colors.spice}`, borderRadius: '6px',
          }}>
            {cinemaScene.act && (
              <div style={{
                fontFamily: fontDisplay, fontSize: '13px', fontStyle: 'italic', fontWeight: 500,
                color: colors.spice, letterSpacing: '0.02em', marginBottom: 6,
                animation: cinemaScene.actStart ? 'fadeIn 600ms' : 'none',
              }}>
                act {cinemaScene.act}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.12em', color: colors.muted, textTransform: 'uppercase' }}>
                Scene {cinemaScene.i} / {cinemaScene.total} · silent tour
              </span>
              <span style={{ fontFamily: fontDisplay, fontSize: '16px', fontStyle: 'italic', color: colors.ink }}>
                {cinemaScene.title}
              </span>
              <div style={{ height: '4px', flex: '1 1 120px', background: colors.line, borderRadius: 2, minWidth: 80, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: colors.spice, width: `${(cinemaScene.i / cinemaScene.total) * 100}%`, transition: 'width 400ms ease-out' }}/>
              </div>
              <button onClick={stopCinema} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                background: 'transparent', border: `1px solid ${colors.spice}`, borderRadius: '999px',
                color: colors.spice, fontFamily: fontMono, fontSize: '10px', cursor: 'pointer',
              }}>
                <Square size={10}/> STOP
              </button>
            </div>
          </div>
        )}

        {/* HERO */}
        <section style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.3em', color: colors.muted, marginBottom: '10px', textTransform: 'uppercase' }}>
            your chord
          </div>
          <div
            key={`${rootMidi}-${scaleId}`}
            style={{
              fontFamily: fontDisplay, fontSize: 'clamp(90px, 18vw, 160px)',
              fontWeight: 500, lineHeight: 0.95, letterSpacing: '-0.045em',
              color: colors.ink,
              animation: 'chordIn 700ms cubic-bezier(0.2, 0.9, 0.2, 1)',
              fontStyle: isMajorFamily(scaleId) ? 'normal' : 'italic',
            }}>
            {chordName}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: fontMono, fontSize: '12px', color: scale.color, letterSpacing: '0.08em', fontWeight: 500 }}>
              {asciiName(rootMidi, useFlats)} · {scale.name}
            </span>
            {lastMove && (
              <span style={{
                fontFamily: fontMono, fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
                background: colors.paperD, color: colors.teal, letterSpacing: '0.02em',
                animation: 'fadeIn 800ms',
              }}>via {lastMove}</span>
            )}
          </div>
          {canQuickFlip && (
            <div style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center',
              padding: 3, borderRadius: 999,
              background: colors.paperD, border: `1px solid ${colors.line}`,
              fontFamily: fontDisplay, fontSize: '13px', fontWeight: 500,
            }}>
              <button
                onClick={() => { if (scaleId !== 'major') quickFlipMajorMinor(); }}
                style={{
                  background: scaleId === 'major' ? colors.ink : 'transparent',
                  color: scaleId === 'major' ? colors.paper : colors.ink2,
                  border: 'none', padding: '6px 16px', borderRadius: 999,
                  fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
                  cursor: scaleId === 'major' ? 'default' : 'pointer',
                  transition: 'all 180ms ease',
                }}>
                Major
              </button>
              <button
                onClick={() => { if (scaleId !== 'minor') quickFlipMajorMinor(); }}
                style={{
                  background: scaleId === 'minor' ? colors.ink : 'transparent',
                  color: scaleId === 'minor' ? colors.paper : colors.ink2,
                  border: 'none', padding: '6px 16px', borderRadius: 999,
                  fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', fontStyle: 'italic',
                  cursor: scaleId === 'minor' ? 'default' : 'pointer',
                  transition: 'all 180ms ease',
                }}>
                minor
              </button>
            </div>
          )}
        </section>

        {/* NOTE CARDS */}
        <section style={{ display: 'grid', gridTemplateColumns: `repeat(3, 1fr)`, maxWidth: '420px', margin: '0 auto 20px', gap: '10px' }}>
          {midiNotes.map((midi, i) => {
            const pc = mod12(midi);
            const name = pitchName(pc, useFlats);
            const spicy = spicyFlags[i];
            const isActive = activeMidi === displayHighlight[i];
            return (
              <div key={`${midi}-${i}`} style={{
                textAlign: 'center', padding: '10px 6px',
                background: isActive ? colors.goldBg : (spicy ? colors.spiceBg : colors.paperD),
                borderRadius: '6px',
                border: isActive ? `1.5px solid ${colors.gold}` : (spicy ? `1px dashed ${colors.spice}` : `1px solid ${colors.line}`),
                animation: `noteIn 500ms ${i * 80}ms both cubic-bezier(0.2, 0.9, 0.2, 1)`,
                transition: 'background 220ms ease, border 220ms ease',
              }}>
                <div style={{
                  fontFamily: fontDisplay, fontSize: '28px', fontWeight: 500,
                  color: i === 0 ? colors.spice : colors.ink, lineHeight: 1, letterSpacing: '-0.02em',
                }}>{name}</div>
                <div style={{ fontFamily: fontMono, fontSize: '10px', color: colors.ink2, marginTop: '3px', letterSpacing: '0.12em' }}>
                  {intervalLabels[i]}
                </div>
              </div>
            );
          })}
        </section>

        {/* PIANO — MOVED UP, RIGHT AFTER NOTE CARDS */}
        <section style={{ maxWidth: '940px', margin: '0 auto 22px' }}>
          <div style={{ textAlign: 'center', marginBottom: 8, fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase' }}>
            tap any key to set the root · numbers show the voicing order
          </div>
          <Piano
            size="normal"
            highlighted={displayHighlight}
            rootPcs={new Set([rootPc])}
            activeMidi={activeMidi}
            useFlats={useFlats}
            onKeyClick={onPianoKeyClick}
            orderMap={displayHighlight.reduce((acc, m, i) => { acc[m] = i + 1; return acc; }, {})}
          />
        </section>

        {/* ACTION ROW */}
        <section style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button onClick={playCurrent} style={btnPrimary(colors, fontDisplay)} title="Play all three notes together">
            <Play size={14} fill={colors.paper}/> Hear it
          </button>
          <button onClick={playBloom} style={btnOutline(colors, fontDisplay)} title="Notes enter one-by-one and stack into the chord">
            <Flower2 size={14}/> Bloom
          </button>
          <button onClick={playRipple} style={btnOutline(colors, fontDisplay)} title="Up the chord, then back down — a melodic shape">
            <Waves size={14}/> Ripple
          </button>
          <button onClick={togglePin} disabled={pinDisabled} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: isPinned ? colors.gold : (pinDisabled ? 'transparent' : colors.teal),
            color: isPinned ? colors.paper : (pinDisabled ? colors.muted : colors.paper),
            border: `1.5px solid ${isPinned ? colors.gold : colors.teal}`, borderRadius: '4px',
            fontFamily: fontDisplay, fontSize: '15px', fontWeight: 500,
            cursor: pinDisabled ? 'not-allowed' : 'pointer',
            opacity: pinDisabled ? 0.5 : 1,
            transition: 'all 180ms ease',
          }}>
            <Pin size={14} fill={isPinned ? colors.paper : (pinDisabled ? 'none' : colors.paper)}/>
            {isPinned ? `Unpin (#${currentPinIdx + 1})` : (pinboard.length >= 4 ? 'board full' : 'Pin this chord')}
          </button>
        </section>

        {/* PINBOARD */}
        <section style={{
          padding: '22px 22px 24px', background: colors.paperD, borderRadius: '10px',
          border: `1px solid ${colors.line}`, marginBottom: '36px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.3em', color: colors.muted, textTransform: 'uppercase' }}>
                your pinboard
              </div>
              <div style={{ fontFamily: fontDisplay, fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', marginTop: '2px', fontStyle: 'italic', color: colors.ink }}>
                chords that meet here · {pinsData.length}/4
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {pinsData.length >= 2 && (
                <>
                  <button
                    onClick={() => setMetronomeOn(v => !v)}
                    title={metronomeOn ? 'metronome on · 4 clicks per chord' : 'metronome off'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 12px', borderRadius: '999px',
                      background: metronomeOn ? colors.ink : 'transparent',
                      color: metronomeOn ? colors.paper : colors.ink2,
                      border: `1px solid ${metronomeOn ? colors.ink : colors.line}`,
                      fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 180ms ease',
                    }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '999px',
                      background: metronomeOn ? colors.gold : colors.muted,
                      animation: metronomeOn && playingPinIdx !== null ? 'metroPulse 0.5s ease-in-out infinite' : 'none',
                    }}/>
                    metronome
                  </button>
                  {playingPinIdx !== null ? (
                    <button onClick={stopProgression} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                      background: colors.spice, color: colors.paper, border: 'none', borderRadius: '4px',
                      fontFamily: fontDisplay, fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    }}>
                      <Square size={12}/> Stop
                    </button>
                  ) : (
                    <button onClick={playProgression} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                      background: colors.teal, color: colors.paper, border: 'none', borderRadius: '4px',
                      fontFamily: fontDisplay, fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    }}>
                      <PlayCircle size={14}/> Play progression
                    </button>
                  )}
                </>
              )}
              {pinsData.length > 0 && (
                <button onClick={clearPinboard} style={{
                  background: 'transparent', border: `1px solid ${colors.line}`, padding: '7px 14px', borderRadius: '999px',
                  fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: colors.ink2, cursor: 'pointer',
                }}>clear all</button>
              )}
            </div>
          </div>

          {/* TRANSPORT — pattern picker + tempo + time-sig + volumes.
               All changes are live; playback is never interrupted. */}
          {pinsData.length >= 2 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
              padding: '14px 14px',
              marginBottom: 18,
              background: colors.paper,
              border: `1px solid ${colors.line}`,
              borderRadius: 8,
            }}>
              {/* PATTERN PICKER */}
              <div>
                <div style={{ fontFamily: fontMono, fontSize: '9px', letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  pattern · {instrumentForPattern(pattern)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {[
                    { id: 'arpeggio', label: 'Arpeggio' },
                    { id: 'block',    label: 'Block' },
                    { id: 'alberti',  label: 'Alberti' },
                    { id: 'waltz',    label: 'Waltz' },
                    { id: 'bossa',    label: 'Bossa' },
                    { id: 'drone',    label: 'Drone' },
                    { id: 'strum',    label: 'Strum' },
                  ].map(p => (
                    <button key={p.id} onClick={() => setPattern(p.id)}
                      title={`${p.label} · ${instrumentForPattern(p.id)}`}
                      style={{
                        padding: '5px 10px', borderRadius: 999,
                        background: pattern === p.id ? colors.ink : 'transparent',
                        color: pattern === p.id ? colors.paper : colors.ink2,
                        border: `1px solid ${pattern === p.id ? colors.ink : colors.line}`,
                        fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'all 150ms ease',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TEMPO + TIME SIG */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: fontMono, fontSize: '9px', letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase' }}>
                    tempo · {bpm} bpm
                  </span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {['3/4', '4/4'].map(ts => (
                      <button key={ts} onClick={() => setTimeSig(ts)} style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: timeSig === ts ? colors.ink : 'transparent',
                        color: timeSig === ts ? colors.paper : colors.ink2,
                        border: `1px solid ${timeSig === ts ? colors.ink : colors.line}`,
                        fontFamily: fontMono, fontSize: '9px', letterSpacing: '0.05em',
                        cursor: 'pointer', transition: 'all 150ms ease',
                      }}>{ts}</button>
                    ))}
                  </div>
                </div>
                <input type="range" min={50} max={160} step={1} value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  style={{ width: '100%', accentColor: colors.teal }}
                />
              </div>

              {/* MASTER VOLUME */}
              <div>
                <div style={{ fontFamily: fontMono, fontSize: '9px', letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  master · {Math.round(masterVol * 100)}
                </div>
                <input type="range" min={0} max={1} step={0.01} value={masterVol}
                  onChange={(e) => setMasterVol(Number(e.target.value))}
                  style={{ width: '100%', accentColor: colors.teal }}
                />
              </div>

              {/* METRONOME VOLUME */}
              <div>
                <div style={{ fontFamily: fontMono, fontSize: '9px', letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  metronome · {Math.round(metroVol * 100)}
                </div>
                <input type="range" min={0} max={1} step={0.01} value={metroVol}
                  onChange={(e) => setMetroVol(Number(e.target.value))}
                  style={{ width: '100%', accentColor: colors.gold }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: 6, marginBottom: pinsData.length >= 2 ? '22px' : 0 }}>
            {[0, 1, 2, 3].map(slot => {
              const pin = pinsData[slot];
              const prev = slot > 0 ? pinsData[slot - 1] : null;
              const showInterval = prev && pin;
              return (
                <React.Fragment key={slot}>
                  {showInterval && (
                    <IntervalBadge label={intervalBetween(prev.rootMidi, pin.rootMidi)} colors={colors} fontMono={fontMono}/>
                  )}
                  {pin ? (
                    <PinnedCard pin={pin} idx={slot}
                      isPlaying={playingPinIdx === slot}
                      isFresh={recentPin === pin.id}
                      isFirst={slot === 0}
                      isLast={slot === pinsData.length - 1}
                      onLoad={() => loadPin(pin)} onRemove={() => unpinById(pin.id)}
                      onMoveLeft={() => movePin(slot, -1)} onMoveRight={() => movePin(slot, 1)}
                      colors={colors} fontDisplay={fontDisplay} fontMono={fontMono}/>
                  ) : (
                    slot === pinsData.length ? (
                      <EmptyPinSlot colors={colors} fontMono={fontMono} slot={slot}/>
                    ) : null
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {pinsData.length >= 2 && (
            <div>
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.3em', color: colors.muted, textTransform: 'uppercase' }}>
                  all your chords, on one keyboard
                </div>
                <div style={{ fontFamily: fontMono, fontSize: '11px', color: sharedPcCount > 0 ? colors.gold : colors.muted, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: sharedPcCount > 0 ? colors.gold : 'transparent', border: sharedPcCount > 0 ? 'none' : `1px dashed ${colors.muted}` }}/>
                  {sharedPcCount > 0
                    ? <>gold keys appear in 2+ chords · {sharedPcCount} {sharedPcCount === 1 ? 'note' : 'notes'} shared</>
                    : <>no shared notes yet · pin chords that share tones</>}
                </div>
              </div>
              <Piano size="small" highlighted={combinedMidis} pcCountMap={pcCountMap} useFlats={useFlats}/>
              <div style={{ marginTop: 10, textAlign: 'center', fontFamily: fontUI, fontSize: '11px', color: colors.muted, fontStyle: 'italic' }}>
                the <span style={{ color: colors.gold, fontWeight: 500, fontStyle: 'normal' }}>×N</span> number on each gold key tells you how many of your pinned chords contain it
              </div>
            </div>
          )}

          <div style={{ marginTop: 14, padding: '14px 18px', background: colors.paper, border: `1px dashed ${colors.line}`, borderRadius: 8 }}>
            <div style={{ textAlign: 'center', fontFamily: fontUI, fontSize: '12px', color: colors.muted, fontStyle: 'italic', marginBottom: 12 }}>
              {pinsData.length === 0
                ? 'pin any chord to start collecting · or let Cantus fill the board for you'
                : 'keep tapping to cycle through progressions — classic or cinematic'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={surpriseClassic} style={surpriseBtn(colors, fontDisplay, fontMono, colors.teal)} title="Tap again for a new progression">
                <Sparkles size={14}/>
                <span>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 500 }}>Classic</span>
                  <span style={{ display: 'block', fontFamily: fontMono, fontSize: 9, letterSpacing: '0.1em', opacity: 0.75, marginTop: 2 }}>diatonic · 10 progressions</span>
                </span>
              </button>
              <button onClick={surpriseCinematic} style={surpriseBtn(colors, fontDisplay, fontMono, colors.spice)} title="Tap again for a new film-score progression">
                <Wand2 size={14}/>
                <span>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 500 }}>Cinematic</span>
                  <span style={{ display: 'block', fontFamily: fontMono, fontSize: 9, letterSpacing: '0.1em', opacity: 0.75, marginTop: 2 }}>chromatic mediants · 10 themes</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* CHOOSE YOUR CHORD */}
        <section style={{ marginBottom: '28px' }}>
          <SectionLabel text="choose your chord" colors={colors} fontMono={fontMono}/>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: 18 }}>
            {SCALE_IDS.map(id => {
              const active = id === scaleId;
              const color = SCALES[id].color;
              return (
                <button key={id} onClick={() => pickScale(id)} style={{
                  padding: '7px 13px', borderRadius: '4px',
                  border: active ? `1.5px solid ${color}` : `1px solid ${colors.line}`,
                  background: active ? color : 'transparent',
                  color: active ? colors.paper : color,
                  fontFamily: fontUI, fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 180ms ease', whiteSpace: 'nowrap',
                }}>{SCALES[id].name}</button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: 12 }}>
            {VOICINGS.map(v => {
              const active = v.id === voicingId;
              return (
                <button key={v.id} onClick={() => pickVoicing(v.id)} style={{
                  padding: '8px 14px', borderRadius: '4px',
                  border: active ? `1.5px solid ${colors.ink}` : `1px solid ${colors.line}`,
                  background: active ? colors.ink : 'transparent',
                  color: active ? colors.paper : colors.ink,
                  fontFamily: fontDisplay, fontSize: '16px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 180ms ease',
                }}>{v.label}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {START_DEGREES.map(s => {
              const active = s.id === startDegId;
              return (
                <button key={s.id} onClick={() => pickStartDeg(s.id)} style={{
                  padding: '6px 14px', borderRadius: '4px',
                  border: active ? `1.5px solid ${colors.spice}` : `1px solid ${colors.line}`,
                  background: active ? colors.spiceBg : 'transparent',
                  color: active ? colors.spice : colors.ink2,
                  fontFamily: fontUI, fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontFamily: fontDisplay, fontSize: '14px' }}>start from {s.label}</span>
                  <span style={{ fontFamily: fontMono, fontSize: '9px', opacity: 0.7 }}>{s.subtitle}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '10px', textAlign: 'center', fontFamily: fontUI, fontSize: '12px', color: colors.ink2, fontStyle: 'italic' }}>
            {voicing.tagline}
          </div>
        </section>

        {/* FOLLOW A BRANCH */}
        <section style={{ marginBottom: '40px' }}>
          <SectionLabel text="follow a branch" colors={colors} fontMono={fontMono}/>
          <div style={{ textAlign: 'center', marginBottom: 18, fontFamily: fontUI, fontSize: '12px', color: colors.muted, fontStyle: 'italic' }}>
            tap the big chord to go there · tap <Plus size={11} style={{ verticalAlign: '-1px' }}/> to pin without navigating · tap ↔ to flip major ↔ minor
          </div>

          {/* ASCENDING */}
          <div style={{ marginBottom: 28 }}>
            <TierLabel arrow="↑" label="ascending · 3rds, 6ths, tritone, 4ths, 5ths" colors={colors} fontMono={fontMono} fontDisplay={fontDisplay}/>
            <div className="cv-grid-7" style={{ marginBottom: 14 }}>
              {primaryAsc.map(m => (
                <BigMoveCard key={m.id} move={m}
                  primary={previewOfMove(m, false)} alt={previewOfMove(m, true)}
                  onPrimary={() => doMove(m, false)} onAlt={() => doMove(m, true)}
                  onPin={() => pinDestination(m, false)}
                  destPinned={destinationIsPinned(m, false)}
                  pinDisabled={pinboard.length >= 4}
                  colors={colors} fontDisplay={fontDisplay} fontMono={fontMono}
                  isMinor={!isMajorFamily(scaleId)}/>
              ))}
            </div>
            <div style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.15em', color: colors.muted, marginBottom: 8, paddingLeft: 2 }}>
              also: 2nds & 7ths (stepping moves)
            </div>
            <div className="cv-grid-4">
              {secondaryAsc.map(m => (
                <SmallMoveCard key={m.id} move={m}
                  primary={previewOfMove(m, false)}
                  onPrimary={() => doMove(m, false)}
                  onPin={() => pinDestination(m, false)}
                  destPinned={destinationIsPinned(m, false)}
                  pinDisabled={pinboard.length >= 4}
                  colors={colors} fontDisplay={fontDisplay} fontMono={fontMono}
                  isMinor={!isMajorFamily(scaleId)}/>
              ))}
            </div>
          </div>

          {/* DESCENDING */}
          <div>
            <TierLabel arrow="↓" label="descending · 3rds, 6ths, 4ths, 5ths" colors={colors} fontMono={fontMono} fontDisplay={fontDisplay}/>
            <div className="cv-grid-6" style={{ marginBottom: 14 }}>
              {primaryDesc.map(m => (
                <BigMoveCard key={m.id} move={m}
                  primary={previewOfMove(m, false)} alt={previewOfMove(m, true)}
                  onPrimary={() => doMove(m, false)} onAlt={() => doMove(m, true)}
                  onPin={() => pinDestination(m, false)}
                  destPinned={destinationIsPinned(m, false)}
                  pinDisabled={pinboard.length >= 4}
                  colors={colors} fontDisplay={fontDisplay} fontMono={fontMono}
                  isMinor={!isMajorFamily(scaleId)}/>
              ))}
            </div>
            <div style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.15em', color: colors.muted, marginBottom: 8, paddingLeft: 2 }}>
              also: 2nds & 7ths (stepping moves)
            </div>
            <div className="cv-grid-4">
              {secondaryDesc.map(m => (
                <SmallMoveCard key={m.id} move={m}
                  primary={previewOfMove(m, false)}
                  onPrimary={() => doMove(m, false)}
                  onPin={() => pinDestination(m, false)}
                  destPinned={destinationIsPinned(m, false)}
                  pinDisabled={pinboard.length >= 4}
                  colors={colors} fontDisplay={fontDisplay} fontMono={fontMono}
                  isMinor={!isMajorFamily(scaleId)}/>
              ))}
            </div>
          </div>
        </section>

        {/* SCALE RIBBON — the reference chart: key ▸ notes ▸ degrees */}
        <section style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: fontMono, fontSize: '11px', letterSpacing: '0.3em', color: colors.muted, marginBottom: '8px', textTransform: 'uppercase' }}>
            the scale · degree map
          </div>
          <div style={{
            fontFamily: fontDisplay, fontSize: '22px', fontWeight: 500,
            color: colors.ink, letterSpacing: '-0.015em', marginBottom: '14px',
            fontStyle: isMajorFamily(scaleId) ? 'normal' : 'italic',
          }}>
            key of <span style={{ color: scale.color }}>{asciiName(rootMidi, useFlats)} {scale.name}</span>
          </div>
          <ScaleRibbon rootIdx={rootMidi} scaleId={scaleId} colors={colors} fontMono={fontMono} fontDisplay={fontDisplay} useFlats={useFlats}/>
          <div style={{ marginTop: '14px', fontFamily: fontUI, fontSize: '13px', color: colors.muted, fontStyle: 'italic' }}>
            {scale.feel} · {scale.steps.length} notes · root on the left
          </div>
        </section>

        <footer style={{ textAlign: 'center', fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.15em', color: colors.muted, marginTop: 32 }}>
          Cantus · Nathaniel School of Music
        </footer>
      </div>

      {guideOpen && (
        <LearnGuide
          onClose={() => setGuideOpen(false)}
          colors={colors} fontDisplay={fontDisplay} fontUI={fontUI} fontMono={fontMono}
        />
      )}

      <style>{`
        @keyframes chordIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.96); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes noteIn {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleInDot {
          0% { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pinIn {
          0% { opacity: 0; transform: scale(0.88) rotate(-3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes pinPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(184, 138, 46, 0.5); }
          50% { box-shadow: 0 0 0 10px rgba(184, 138, 46, 0); }
        }
        @keyframes pinFlash {
          0%   { background: rgba(184, 138, 46, 0.35); transform: scale(1.03); }
          100% { background: #FBF6EA; transform: scale(1); }
        }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes metroPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.75; }
        }

        /* Responsive interval grids
           cv-grid-7 = primary ascending (7 cards: m3 M3 m6 M6 TT P4 P5)
           cv-grid-6 = primary descending (6 cards)
           cv-grid-4 = secondary (4 cards: m2 M2 m7 M7) */
        .cv-grid-7, .cv-grid-6, .cv-grid-4 { display: grid; gap: 10px; }
        .cv-grid-7 { grid-template-columns: repeat(2, 1fr); }
        .cv-grid-6 { grid-template-columns: repeat(2, 1fr); }
        .cv-grid-4 { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (min-width: 520px) {
          .cv-grid-7 { grid-template-columns: repeat(3, 1fr); }
          .cv-grid-6 { grid-template-columns: repeat(3, 1fr); }
          .cv-grid-4 { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 760px) {
          .cv-grid-7 { grid-template-columns: repeat(4, 1fr); }
          .cv-grid-6 { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 940px) {
          .cv-grid-7 { grid-template-columns: repeat(7, 1fr); }
          .cv-grid-6 { grid-template-columns: repeat(6, 1fr); }
        }

        /* Mobile tweaks */
        @media (max-width: 520px) {
          /* Ensure touch targets aren't tiny on phones */
          button { min-height: 36px; }
        }
      `}</style>
    </div>
  );
}

function btnPrimary(colors, fontDisplay) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
    background: colors.ink, color: colors.paper, border: 'none', borderRadius: '4px',
    fontFamily: fontDisplay, fontSize: '15px', fontWeight: 500, cursor: 'pointer',
  };
}
function btnOutline(colors, fontDisplay) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
    background: 'transparent', color: colors.ink, border: `1.5px solid ${colors.ink}`, borderRadius: '4px',
    fontFamily: fontDisplay, fontSize: '15px', fontWeight: 500, cursor: 'pointer',
  };
}

function headerUtilBtn(colors, fontMono) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'transparent', border: `1px solid ${colors.line}`,
    padding: '8px 13px', borderRadius: '999px',
    fontFamily: fontMono, fontSize: '11px', letterSpacing: '0.12em',
    color: colors.ink2, cursor: 'pointer', transition: 'all 180ms ease',
  };
}

function surpriseBtn(colors, fontDisplay, fontMono, accent) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 12,
    padding: '12px 18px 12px 16px',
    background: colors.paperD, color: accent,
    border: `1.5px solid ${accent}33`,
    borderRadius: '8px',
    fontFamily: fontDisplay,
    cursor: 'pointer', transition: 'all 180ms ease',
    textAlign: 'left',
  };
}

function SectionLabel({ text, colors, fontMono }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 14 }}>
      <div style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.3em', color: colors.muted, textTransform: 'uppercase' }}>
        {text}
      </div>
      <div style={{ maxWidth: '60px', margin: '6px auto 0' }}>
        <HandUnderline color={colors.ink2}/>
      </div>
    </div>
  );
}

function TierLabel({ arrow, label, colors, fontMono, fontDisplay }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontFamily: fontDisplay, fontSize: 22, color: colors.ink2, lineHeight: 1 }}>{arrow}</span>
      <span style={{ fontFamily: fontMono, fontSize: '10px', letterSpacing: '0.12em', color: colors.ink2, textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: colors.line }}/>
    </div>
  );
}

function IntervalBadge({ label, colors, fontMono }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 52, padding: '0 10px',
      fontFamily: fontMono, fontSize: '11px',
      color: colors.ink2, letterSpacing: '0.02em',
      background: colors.paper, border: `1px solid ${colors.line}`,
      borderRadius: '999px', alignSelf: 'center',
    }}>
      {label}
    </div>
  );
}

function EmptyPinSlot({ colors, fontMono, slot }) {
  return (
    <div style={{
      flex: '1 1 180px', minWidth: 150, padding: '22px 14px',
      borderRadius: '6px', border: `1px dashed ${colors.line}`,
      background: 'transparent',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '120px',
      color: colors.muted, fontFamily: fontMono, fontSize: '10px',
      letterSpacing: '0.12em', textTransform: 'uppercase',
    }}>
      <Pin size={16} style={{ opacity: 0.4, marginBottom: 6 }}/>
      slot {slot + 1}
    </div>
  );
}

function PinnedCard({ pin, idx, isPlaying, isFresh, isFirst, isLast, onLoad, onRemove, onMoveLeft, onMoveRight, colors, fontDisplay, fontMono }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onLoad}
      style={{
        position: 'relative', flex: '1 1 180px', minWidth: 150,
        padding: '14px 14px 10px',
        background: isPlaying ? colors.goldBg : (hover ? colors.paper : '#FBF6EA'),
        border: `${isPlaying ? '2px' : '1px'} solid ${isPlaying ? colors.gold : (hover ? pin.scaleColor : colors.line)}`,
        borderRadius: '6px',
        transition: 'all 200ms ease', cursor: 'pointer',
        animation: isPlaying
          ? 'pinPulse 1.2s ease-in-out infinite'
          : isFresh
            ? 'pinFlash 800ms ease-out'
            : 'pinIn 400ms cubic-bezier(0.2, 0.9, 0.2, 1)',
        transform: hover && !isPlaying ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover && !isPlaying ? `0 6px 14px ${pin.scaleColor}22` : 'none',
        display: 'flex', flexDirection: 'column', gap: '3px',
      }}>
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          position: 'absolute', top: 4, right: 4,
          background: 'transparent', border: 'none', cursor: 'pointer',
          width: 22, height: 22, borderRadius: '999px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.muted,
        }}
        title="remove from pinboard">
        <X size={12}/>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{
          fontFamily: fontMono, fontSize: '9px', color: colors.muted, letterSpacing: '0.1em',
          padding: '1px 6px', borderRadius: 3, background: 'rgba(0,0,0,0.04)',
        }}>
          #{idx + 1}
        </span>
        <div style={{ width: 8, height: 8, borderRadius: '999px', background: pin.scaleColor }}/>
        {isPlaying && <Music2 size={11} style={{ color: colors.gold, animation: 'fadeIn 300ms' }}/>}
      </div>

      <div style={{
        fontFamily: fontDisplay, fontSize: '26px', fontWeight: 500, lineHeight: 1,
        letterSpacing: '-0.025em', color: colors.ink,
        fontStyle: isMajorFamily(pin.scaleId) ? 'normal' : 'italic',
      }}>{pin.chordName}</div>

      <div style={{
        fontFamily: fontMono, fontSize: '9px', color: pin.scaleColor, letterSpacing: '0.08em',
        marginTop: 1, textTransform: 'uppercase', fontWeight: 500,
      }}>
        {pin.scaleName}
      </div>

      <div style={{
        fontFamily: fontDisplay, fontSize: '14px', color: colors.ink2,
        marginTop: 4,
      }}>
        {pin.noteNames.join(' · ')}
      </div>

      <div style={{
        marginTop: 'auto', paddingTop: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
      }}>
        <div style={{ fontFamily: fontMono, fontSize: '9px', color: colors.muted, letterSpacing: '0.08em' }}>
          {pin.voicingLabel} · from {pin.startLabel}
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={(e) => { e.stopPropagation(); if (!isFirst) onMoveLeft(); }}
            disabled={isFirst}
            title="move left"
            style={{
              width: 22, height: 22, borderRadius: 4, padding: 0,
              background: isFirst ? 'transparent' : 'rgba(31,30,46,0.06)',
              border: `1px solid ${isFirst ? colors.line : 'rgba(31,30,46,0.15)'}`,
              cursor: isFirst ? 'not-allowed' : 'pointer',
              opacity: isFirst ? 0.3 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fontMono, fontSize: 13, color: colors.ink2, lineHeight: 1,
            }}>←</button>
          <button onClick={(e) => { e.stopPropagation(); if (!isLast) onMoveRight(); }}
            disabled={isLast}
            title="move right"
            style={{
              width: 22, height: 22, borderRadius: 4, padding: 0,
              background: isLast ? 'transparent' : 'rgba(31,30,46,0.06)',
              border: `1px solid ${isLast ? colors.line : 'rgba(31,30,46,0.15)'}`,
              cursor: isLast ? 'not-allowed' : 'pointer',
              opacity: isLast ? 0.3 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fontMono, fontSize: 13, color: colors.ink2, lineHeight: 1,
            }}>→</button>
        </div>
      </div>
    </div>
  );
}

// Pin-shortcut button that appears on every interval card
function PinShortcut({ onPin, destPinned, pinDisabled, colors, hover }) {
  const disabled = pinDisabled && !destPinned;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!disabled) onPin(); }}
      title={destPinned ? 'already on pinboard' : 'pin this chord'}
      style={{
        position: 'absolute', top: 6, right: 6,
        width: 26, height: 26, borderRadius: '999px',
        background: destPinned ? colors.gold : (hover ? 'rgba(251, 250, 245, 0.35)' : 'rgba(31, 30, 46, 0.08)'),
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: destPinned ? colors.paper : (hover ? '#FBFAF5' : colors.ink2),
        opacity: disabled ? 0.3 : (hover || destPinned ? 1 : 0.75),
        transition: 'all 180ms ease',
        padding: 0,
      }}>
      {destPinned ? <Pin size={12} fill={colors.paper}/> : <Plus size={15} strokeWidth={2.5}/>}
    </button>
  );
}

// Primary (bigger, prominent) card
function BigMoveCard({ move, primary, alt, onPrimary, onAlt, onPin, destPinned, pinDisabled, colors, fontDisplay, fontMono, isMinor }) {
  const [hover, setHover] = useState(false);
  const family = INTERVAL_COLORS[move.fam];
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: 'relative',
      padding: '14px 32px 12px 14px',
      background: hover ? family.accent : family.bg,
      color: hover ? '#FBFAF5' : colors.ink,
      border: hover ? `1.5px solid ${family.accent}` : `1.5px solid ${family.accent}33`,
      borderRadius: '8px', transition: 'all 200ms cubic-bezier(0.2, 0.9, 0.2, 1)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hover ? `0 6px 16px ${family.accent}44` : 'none',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 168,
    }}>
      <PinShortcut onPin={onPin} destPinned={destPinned} pinDisabled={pinDisabled} colors={colors} hover={hover}/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          fontFamily: fontMono, fontSize: '13px', letterSpacing: '0.03em',
          color: hover ? 'rgba(251, 250, 245, 0.95)' : family.accent, fontWeight: 600,
        }}>
          {move.arrow}{move.label}
        </div>
        <div style={{
          fontFamily: fontUI_inline, fontSize: '12px', lineHeight: 1.35,
          color: hover ? 'rgba(251, 250, 245, 0.82)' : colors.ink2,
          fontStyle: 'italic',
        }}>
          {move.hint}
        </div>
        <div style={{
          fontFamily: fontUI_inline, fontSize: '11px', lineHeight: 1.4,
          color: hover ? 'rgba(251, 250, 245, 0.72)' : colors.muted,
        }}>
          {move.tip}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
        <button onClick={onPrimary} style={{
          fontFamily: fontDisplay, fontSize: '32px', fontWeight: 500,
          letterSpacing: '-0.025em', lineHeight: 1, padding: 0, margin: 0,
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit',
          fontStyle: isMinor ? 'italic' : 'normal', textAlign: 'left',
        }}>{primary}</button>
        <button onClick={onAlt} style={{
          fontFamily: fontMono, fontSize: '11px', letterSpacing: '0.04em',
          padding: '2px 0', margin: 0, background: 'transparent', border: 'none', cursor: 'pointer',
          color: hover ? 'rgba(251, 250, 245, 0.75)' : colors.muted,
          textDecoration: 'underline', textUnderlineOffset: '2px', textDecorationThickness: '0.5px',
          textAlign: 'left',
        }}>↔ {alt}</button>
      </div>
    </div>
  );
}

// Secondary (compact) card
function SmallMoveCard({ move, primary, onPrimary, onPin, destPinned, pinDisabled, colors, fontDisplay, fontMono, isMinor }) {
  const [hover, setHover] = useState(false);
  const family = INTERVAL_COLORS[move.fam];
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: 'relative',
      padding: '10px 28px 9px 10px',
      background: hover ? family.accent : family.bg,
      color: hover ? '#FBFAF5' : colors.ink,
      border: `1px solid ${hover ? family.accent : family.accent + '22'}`,
      borderRadius: '6px', transition: 'all 180ms ease',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
      minHeight: 68,
    }}>
      <PinShortcut onPin={onPin} destPinned={destPinned} pinDisabled={pinDisabled} colors={colors} hover={hover}/>
      <div style={{
        fontFamily: fontMono, fontSize: '11px', letterSpacing: '0.03em',
        color: hover ? 'rgba(251, 250, 245, 0.9)' : family.accent, fontWeight: 500,
      }}>
        {move.arrow}{move.label}
      </div>
      <div style={{
        fontFamily: fontUI_inline, fontSize: '11px', lineHeight: 1.25,
        color: hover ? 'rgba(251, 250, 245, 0.75)' : colors.muted,
        fontStyle: 'italic',
      }}>
        {move.hint}
      </div>
      <button onClick={onPrimary} style={{
        fontFamily: fontDisplay, fontSize: '20px', fontWeight: 500,
        letterSpacing: '-0.02em', lineHeight: 1, padding: 0, margin: 0,
        background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit',
        fontStyle: isMinor ? 'italic' : 'normal', textAlign: 'left',
      }}>{primary}</button>
    </div>
  );
}

const fontUI_inline = '"Geist", "Inter Tight", system-ui, sans-serif';

// ════════════════════════════════════════════════════════════════════
//  LEARN GUIDE — a visual reference for people of all ages & skill levels
// ════════════════════════════════════════════════════════════════════

function LearnGuide({ onClose, colors, fontDisplay, fontUI, fontMono }) {
  const [page, setPage] = React.useState(0);

  const pages = [
    {
      eyebrow: 'welcome',
      title: 'What is Cantus?',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            Cantus is a musical playground. You build chords, hear how they sound,
            and discover how they connect to each other.
          </p>
          <p style={pp(fontUI, colors.ink2)}>
            You don't need to read music to use it. If you can hear that two sounds
            go together — or don't — you already have what you need.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <GuidePill colors={colors} fontMono={fontMono} icon="🧒" label="curious beginner" />
            <GuidePill colors={colors} fontMono={fontMono} icon="🎸" label="self-taught player" />
            <GuidePill colors={colors} fontMono={fontMono} icon="🎼" label="classical student" />
            <GuidePill colors={colors} fontMono={fontMono} icon="🎹" label="jazz explorer" />
            <GuidePill colors={colors} fontMono={fontMono} icon="🎬" label="film composer" />
          </div>
        </>
      ),
      illustration: <IllusHero colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'the big letter',
      title: 'Your chord, up front',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            The giant letter at the top of the page is <strong>the chord you're
            currently looking at</strong>. Cantus shows it in a typewriter-serif font
            borrowed from old music textbooks.
          </p>
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<span style={{ fontFamily: fontDisplay, fontSize: 38, fontWeight: 500 }}>C</span>}
            right="upright letter = major family — bright, open, stable" />
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<span style={{ fontFamily: fontDisplay, fontSize: 38, fontWeight: 500, fontStyle: 'italic', color: colors.ink2 }}>Cm</span>}
            right="italic letter = minor or modal family — darker, more emotional" />
          <p style={pp(fontUI, colors.muted, { fontStyle: 'italic', marginTop: 10 })}>
            Tip: the <em>m</em> after the letter means "minor." No letter after means major.
          </p>
        </>
      ),
      illustration: <IllusChordName colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'the keyboard',
      title: 'The piano in the middle',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            The keyboard shows you the three notes of your chord, lit up in color.
            The red key is the <strong>root</strong>. Purple keys are the other two.
          </p>
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<Swatch color="#A63A2C"/>}
            right="root — the home note of the chord" />
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<Swatch color="#3D3356"/>}
            right="voicing notes — the other two notes stacked on top" />
          <p style={pp(fontUI, colors.ink2, { marginTop: 10 })}>
            The little numbers <NumberBadge n={1}/> <NumberBadge n={2}/> <NumberBadge n={3}/>
            {' '}show the order from bottom to top. <strong>Tap any key</strong> to move the
            whole chord to a new root.
          </p>
        </>
      ),
      illustration: <IllusPiano colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'listening',
      title: 'Three ways to hear it',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            Below the keyboard are three buttons. Each one plays the same chord
            a different way, so you hear it from a different angle.
          </p>
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="Hear it" desc="all three notes together · the chord as a harmony"
            illustration={<SmallWave colors={colors} style="block"/>}/>
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="Bloom" desc="notes enter one-by-one and stack up · the chord as a build"
            illustration={<SmallWave colors={colors} style="bloom"/>}/>
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="Ripple" desc="up the chord, then back down · the chord as a shape"
            illustration={<SmallWave colors={colors} style="ripple"/>}/>
        </>
      ),
      illustration: <IllusPlayback colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'the voicing dials',
      title: 'Choose how to stack the notes',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            Same chord, different <strong>voicing</strong>. A voicing is just a way
            of choosing which notes you play. Cantus gives you six, from tight
            clusters to wide-open spreads.
          </p>
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<Tag colors={colors} fontDisplay={fontDisplay} label="2nds"/>}
            right="tight cluster · close harmony, intimate" />
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<Tag colors={colors} fontDisplay={fontDisplay} label="3rds"/>}
            right="the traditional triad · the sound of folk and pop" />
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<Tag colors={colors} fontDisplay={fontDisplay} label="4ths"/>}
            right="quartal · open, modern, filmic" />
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<Tag colors={colors} fontDisplay={fontDisplay} label="5ths & 6ths"/>}
            right="vast, cinematic · notes far apart" />
          <p style={pp(fontUI, colors.muted, { fontStyle: 'italic', marginTop: 10 })}>
            Try every voicing on one chord. It's astonishing how different the
            same three notes can feel.
          </p>
        </>
      ),
      illustration: <IllusVoicings colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'fourteen colors',
      title: 'Scales are moods',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            A scale is a set of notes with a character. Cantus has 14 of them,
            each painted in its own color so you can recognize it at a glance.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10 }}>
            <ScaleChip color="#C68E42" name="Major" mood="bright, happy"/>
            <ScaleChip color="#5B5D8B" name="Minor" mood="sad, classical"/>
            <ScaleChip color="#3A7087" name="Dorian" mood="jazzy, medieval"/>
            <ScaleChip color="#8B3A2C" name="Phrygian" mood="Spanish, dark"/>
            <ScaleChip color="#5C7856" name="Lydian" mood="dreamy, sharp"/>
            <ScaleChip color="#C64B3B" name="Phryg Dom" mood="flamenco fire"/>
            <ScaleChip color="#2D5E6B" name="Blues" mood="classic blues"/>
            <ScaleChip color="#9B7FBF" name="Whole Tone" mood="Debussy dream"/>
          </div>
          <p style={pp(fontUI, colors.muted, { fontStyle: 'italic', marginTop: 10 })}>
            Six more wait in the app. Each has its own feeling.
          </p>
        </>
      ),
      illustration: <IllusScales colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'follow a branch',
      title: 'Move to a nearby chord',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            The big section below the keyboard shows you <strong>chords that are
            one musical step away</strong> from where you are. Tap any card and the
            whole page moves there.
          </p>
          <BranchExample colors={colors} fontDisplay={fontDisplay} fontMono={fontMono}/>
          <p style={pp(fontUI, colors.ink2, { marginTop: 14 })}>
            The top line is the interval (<span style={{ fontFamily: fontMono, fontSize: 13 }}>↑m3</span>
            {' '}means up a minor third). The big letter is the destination chord. The
            little <em>↔</em> link underneath flips it major ↔ minor.
          </p>
          <p style={pp(fontUI, colors.muted, { fontStyle: 'italic', marginTop: 8 })}>
            These moves follow the same paths composers have used for centuries —
            the mediants, the dominant, the tritone. Cantus lets you feel them as
            you go.
          </p>
        </>
      ),
      illustration: <IllusBranch colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'the pinboard',
      title: 'Collect four chords',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            When you find a chord you like, <strong>pin it</strong>. You can pin up
            to four. They sit together on the pinboard — a progression you can
            shape, reorder, and play back.
          </p>
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 999, background: colors.teal, color: colors.paper }}>📌</span>}
            right="Pin this chord — adds the current chord to the board" />
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 999, background: 'rgba(31,30,46,0.08)', color: colors.ink2, fontFamily: fontMono, fontWeight: 700 }}>+</span>}
            right="The plus on any move card — pin a destination without navigating to it" />
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 999, background: colors.paper, color: colors.ink2, fontFamily: fontMono, border: `1px solid ${colors.line}` }}>←→</span>}
            right="The arrows on pinned cards — drag chords into a different order" />
          <p style={pp(fontUI, colors.ink2, { marginTop: 10 })}>
            Once you have two or more pins, hit <strong>Play Progression</strong> and
            Cantus arpeggiates through them — with an optional metronome if you
            want to feel the pulse.
          </p>
        </>
      ),
      illustration: <IllusPinboard colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'the magic',
      title: 'Shared notes = voice leading',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            When you pin two or more chords, Cantus draws <strong>every note they
            share</strong> in gold, on one big combined keyboard. Numbers on each
            gold key tell you how many of your chords contain that note.
          </p>
          <InfoRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            left={<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 999, background: colors.gold, color: colors.paper, fontFamily: fontMono, fontSize: 11, fontWeight: 700 }}>×3</span>}
            right="this note appears in three of your pinned chords — a golden thread" />
          <p style={pp(fontUI, colors.ink2, { marginTop: 10 })}>
            This is what composers call <strong>voice leading</strong> — the art of
            finding shared tones so chords can flow into each other instead of
            lurching.
          </p>
          <p style={pp(fontUI, colors.muted, { fontStyle: 'italic', marginTop: 8 })}>
            Progressions with more gold tend to feel smoother. Progressions with
            less gold feel more dramatic. Both are useful — now you can see it.
          </p>
        </>
      ),
      illustration: <IllusShared colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'shortcuts',
      title: 'A few hidden treats',
      body: (
        <>
          <p style={pp(fontUI, colors.ink)}>
            You've got everything you need. A few small details to make Cantus
            yours:
          </p>
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="TOUR" desc="silent visual tour of what Cantus can do · great for first-timers" illustration={<TinyIcon text="🎬" colors={colors}/>} />
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="Classic Progression" desc={<>one-tap <em>I–V–vi–IV</em> in a random key · always beautiful</>} illustration={<TinyIcon text="✨" colors={colors}/>}/>
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="Cinematic" desc="one-tap film-score progression · Hans-Zimmer-style atmosphere" illustration={<TinyIcon text="🎭" colors={colors}/>}/>
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="Major / minor pill" desc="one tap flips the feeling of your chord" illustration={<TinyIcon text="↔" colors={colors}/>}/>
          <BulletRow colors={colors} fontUI={fontUI} fontDisplay={fontDisplay}
            name="Metronome" desc="adds a pulse when you play a progression · turn it on when you want to feel the beat" illustration={<TinyIcon text="🥁" colors={colors}/>}/>
        </>
      ),
      illustration: <IllusShortcuts colors={colors} fontDisplay={fontDisplay}/>,
    },
    {
      eyebrow: 'go make something',
      title: 'You\'re ready',
      body: (
        <>
          <p style={pp(fontUI, colors.ink, { fontSize: 18, lineHeight: 1.5 })}>
            There's no wrong way to use Cantus. Tap around. Listen. Pin the chords
            that move you. Watch the gold tones appear.
          </p>
          <p style={pp(fontUI, colors.ink2)}>
            You're not learning theory. You're <em>hearing</em> it.
          </p>
          <div style={{
            marginTop: 28, padding: 20,
            background: colors.paperD, border: `1px dashed ${colors.ink2}`, borderRadius: 10,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 22, fontStyle: 'italic', color: colors.ink }}>
              "Music is the space between the notes."
            </div>
            <div style={{ fontFamily: fontMono, fontSize: 11, color: colors.muted, marginTop: 6, letterSpacing: '0.08em' }}>
              — Claude Debussy
            </div>
          </div>
        </>
      ),
      illustration: <IllusFinale colors={colors} fontDisplay={fontDisplay}/>,
    },
  ];

  const current = pages[page];
  const lastPage = page === pages.length - 1;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(20, 18, 30, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 250ms ease-out',
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: colors.paper, color: colors.ink,
          borderRadius: 14, width: '100%', maxWidth: 900, maxHeight: '90vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(20,18,30,0.35)',
          border: `1px solid ${colors.line}`,
          animation: 'chordIn 350ms cubic-bezier(0.2, 0.9, 0.2, 1)',
        }}>
        {/* top bar */}
        <div style={{
          padding: '14px 20px', borderBottom: `1px solid ${colors.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.22em', color: colors.muted, textTransform: 'uppercase' }}>
              Cantus · learn
            </span>
            <span style={{ fontFamily: fontMono, fontSize: 10, color: colors.muted, opacity: 0.6 }}>
              {page + 1} / {pages.length}
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 999,
            background: 'transparent', border: `1px solid ${colors.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.ink2, cursor: 'pointer',
          }}>
            <X size={14}/>
          </button>
        </div>

        {/* content — two-column on desktop, stacked on mobile */}
        <div className="lg-content" style={{
          flex: 1, overflow: 'auto', padding: 0,
          display: 'grid', gridTemplateColumns: '1fr',
        }}>
          <style>{`
            @media (min-width: 720px) {
              .lg-content { grid-template-columns: 1fr 1fr !important; }
              .lg-illus { border-right: 1px solid ${colors.line}; border-bottom: none !important; }
            }
          `}</style>
          <div className="lg-illus" style={{
            background: colors.paperD, padding: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 260, borderBottom: `1px solid ${colors.line}`,
          }}>
            {current.illustration}
          </div>
          <div style={{ padding: '30px 32px' }}>
            <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.3em', color: colors.spice, textTransform: 'uppercase', marginBottom: 10 }}>
              {current.eyebrow}
            </div>
            <h2 style={{
              fontFamily: fontDisplay, fontSize: 30, fontWeight: 500,
              letterSpacing: '-0.02em', margin: 0, marginBottom: 16, color: colors.ink,
            }}>
              {current.title}
            </h2>
            <div key={page} style={{ animation: 'fadeIn 300ms' }}>
              {current.body}
            </div>
          </div>
        </div>

        {/* footer nav */}
        <div style={{
          padding: '14px 20px', borderTop: `1px solid ${colors.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              ...headerUtilBtn(colors, fontMono),
              opacity: page === 0 ? 0.3 : 1,
              cursor: page === 0 ? 'not-allowed' : 'pointer',
            }}>
            ← BACK
          </button>
          {/* dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {pages.map((_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{
                width: i === page ? 24 : 8, height: 8, borderRadius: 999,
                background: i === page ? colors.ink : (i < page ? colors.ink2 : colors.line),
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 220ms ease',
              }}/>
            ))}
          </div>
          <button
            onClick={() => lastPage ? onClose() : setPage(p => p + 1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 4,
              background: colors.ink, color: colors.paper, border: 'none',
              fontFamily: fontDisplay, fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
            {lastPage ? 'START PLAYING' : 'NEXT →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Guide helper components ───

const pp = (fontUI, color, extra = {}) => ({
  fontFamily: fontUI, fontSize: 15, lineHeight: 1.55,
  color, margin: 0, marginBottom: 10, ...extra,
});

function GuidePill({ colors, fontMono, icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      background: colors.paperD, border: `1px solid ${colors.line}`,
      fontFamily: fontMono, fontSize: 11, color: colors.ink2, letterSpacing: '0.02em',
    }}>
      <span>{icon}</span> {label}
    </span>
  );
}

function InfoRow({ colors, fontUI, fontDisplay, left, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0' }}>
      <div style={{ minWidth: 54, textAlign: 'center', flexShrink: 0 }}>{left}</div>
      <div style={{ fontFamily: fontUI, fontSize: 14, lineHeight: 1.4, color: colors.ink }}>{right}</div>
    </div>
  );
}

function BulletRow({ colors, fontUI, fontDisplay, name, desc, illustration }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
      <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>{illustration}</div>
      <div>
        <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 500, color: colors.ink }}>{name}</div>
        <div style={{ fontFamily: fontUI, fontSize: 13, color: colors.ink2, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function Swatch({ color }) {
  return <span style={{ display: 'inline-block', width: 36, height: 24, borderRadius: 4, background: color, border: '1px solid rgba(0,0,0,0.1)' }}/>;
}

function NumberBadge({ n }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: 999,
      background: '#F6F1E7', border: '1.2px solid #3D3356',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#3D3356',
      verticalAlign: 'middle', margin: '0 1px',
    }}>{n}</span>
  );
}

function Tag({ colors, fontDisplay, label }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 4,
      background: colors.ink, color: colors.paper,
      fontFamily: fontDisplay, fontSize: 13, fontWeight: 500,
    }}>{label}</span>
  );
}

function TinyIcon({ text, colors }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: 8,
      background: colors.paperD, border: `1px solid ${colors.line}`,
      fontSize: 18,
    }}>{text}</span>
  );
}

function ScaleChip({ color, name, mood }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 10px', borderRadius: 6,
      background: 'rgba(246, 241, 231, 0.6)',
      border: `1px solid ${color}33`,
    }}>
      <div style={{ width: 12, height: 20, borderRadius: 2, background: color }}/>
      <div>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 13, fontWeight: 500, color: '#1F1E2E' }}>{name}</div>
        <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 10, color: '#8D846F', fontStyle: 'italic' }}>{mood}</div>
      </div>
    </div>
  );
}

function BranchExample({ colors, fontDisplay, fontMono }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
      {[
        { label: '↑m3', hint: 'the blue mediant', chord: 'Gm', fam: '#9C5D6B', bg: '#F1E1E3' },
        { label: '↑M3', hint: 'the sunlit mediant', chord: 'G♯m', fam: '#C68E42', bg: '#F5EBD8' },
      ].map((m, i) => (
        <div key={i} style={{
          padding: '10px 12px', borderRadius: 6,
          background: m.bg, border: `1.5px solid ${m.fam}33`,
        }}>
          <div style={{ fontFamily: fontMono, fontSize: 11, color: m.fam, fontWeight: 500, letterSpacing: '0.03em' }}>
            {m.label}
          </div>
          <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 10, color: '#8D846F', fontStyle: 'italic' }}>
            {m.hint}
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: '#1F1E2E', marginTop: 4, lineHeight: 1 }}>
            {m.chord}
          </div>
        </div>
      ))}
    </div>
  );
}

function SmallWave({ colors, style }) {
  if (style === 'block') {
    return (
      <svg viewBox="0 0 48 40" style={{ width: 44, height: 36 }}>
        <rect x="6" y="10" width="8" height="20" rx="2" fill={colors.ink}/>
        <rect x="20" y="6" width="8" height="28" rx="2" fill={colors.ink}/>
        <rect x="34" y="10" width="8" height="20" rx="2" fill={colors.ink}/>
      </svg>
    );
  }
  if (style === 'bloom') {
    return (
      <svg viewBox="0 0 48 40" style={{ width: 44, height: 36 }}>
        <rect x="6" y="26" width="8" height="8" rx="2" fill={colors.ink} opacity="0.5"/>
        <rect x="20" y="18" width="8" height="16" rx="2" fill={colors.ink} opacity="0.75"/>
        <rect x="34" y="10" width="8" height="24" rx="2" fill={colors.ink}/>
      </svg>
    );
  }
  // ripple
  return (
    <svg viewBox="0 0 48 40" style={{ width: 44, height: 36 }}>
      <path d="M 4 28 Q 14 8 24 16 T 44 28" stroke={colors.ink} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <circle cx="4" cy="28" r="2.5" fill={colors.ink}/>
      <circle cx="24" cy="16" r="2.5" fill={colors.ink}/>
      <circle cx="44" cy="28" r="2.5" fill={colors.ink}/>
    </svg>
  );
}

// ─── Illustrations (one per page, left column of modal) ───

function IllusHero({ colors, fontDisplay }) {
  return (
    <svg viewBox="0 0 260 200" style={{ width: '100%', maxWidth: 300 }}>
      <defs>
        <linearGradient id="ihDisc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E3A56"/>
          <stop offset="100%" stopColor="#1F1E2E"/>
        </linearGradient>
      </defs>
      <circle cx="130" cy="100" r="70" fill="url(#ihDisc)"/>
      <text x="130" y="128" textAnchor="middle"
        style={{ fontFamily: fontDisplay, fontSize: 86, fontWeight: 500, fill: '#F6F1E7', fontStyle: 'italic' }}>
        C
      </text>
      {/* radiating notes */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = 130 + Math.cos(a) * 92;
        const y = 100 + Math.sin(a) * 92;
        return <circle key={i} cx={x} cy={y} r={4} fill={colors.spice} opacity={0.7}/>;
      })}
    </svg>
  );
}

function IllusChordName({ colors, fontDisplay }) {
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', maxWidth: 340 }}>
      <text x="70" y="120" textAnchor="middle"
        style={{ fontFamily: fontDisplay, fontSize: 82, fontWeight: 500, fill: colors.ink }}>C</text>
      <text x="190" y="120" textAnchor="middle"
        style={{ fontFamily: fontDisplay, fontSize: 82, fontWeight: 500, fill: colors.ink2, fontStyle: 'italic' }}>Cm</text>
      <line x1="130" y1="40" x2="130" y2="170" stroke={colors.line} strokeWidth="1" strokeDasharray="3 4"/>
      <text x="70" y="155" textAnchor="middle"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: colors.muted, letterSpacing: '0.15em' }}>
        MAJOR
      </text>
      <text x="190" y="155" textAnchor="middle"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: colors.muted, letterSpacing: '0.15em' }}>
        MINOR
      </text>
    </svg>
  );
}

function IllusPiano({ colors, fontDisplay }) {
  // mini piano with three lit keys and order numbers
  const keys = [
    { x: 10, lit: false },
    { x: 34, lit: true, color: '#A63A2C', num: 1, letter: 'C' },
    { x: 58, lit: false },
    { x: 82, lit: true, color: '#3D3356', num: 2, letter: 'E' },
    { x: 106, lit: false },
    { x: 130, lit: false },
    { x: 154, lit: true, color: '#3D3356', num: 3, letter: 'G' },
    { x: 178, lit: false },
  ];
  return (
    <svg viewBox="0 0 210 200" style={{ width: '100%', maxWidth: 280 }}>
      {keys.map((k, i) => (
        <g key={i}>
          <rect x={k.x} y={20} width={22} height={150} rx={3}
            fill={k.lit ? k.color : '#FBFAF5'}
            stroke={k.lit ? k.color : '#2A2A3A'} strokeWidth="1.2"/>
          {k.lit && (
            <>
              <circle cx={k.x + 11} cy={36} r={9} fill="#F6F1E7" stroke={k.color} strokeWidth="1.2"/>
              <text x={k.x + 11} y={40} textAnchor="middle"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, fill: k.color }}>
                {k.num}
              </text>
              <text x={k.x + 11} y={158} textAnchor="middle"
                style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 500, fill: '#F6F1E7' }}>
                {k.letter}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

function IllusPlayback({ colors, fontDisplay }) {
  return (
    <svg viewBox="0 0 260 200" style={{ width: '100%', maxWidth: 320 }}>
      {/* three rows — block, bloom, ripple */}
      <g transform="translate(30, 30)">
        <rect x="0" y="10" width="14" height="30" rx="2" fill={colors.ink}/>
        <rect x="22" y="4" width="14" height="36" rx="2" fill={colors.ink}/>
        <rect x="44" y="10" width="14" height="30" rx="2" fill={colors.ink}/>
        <text x="78" y="30" style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 500, fill: colors.ink }}>Hear it</text>
      </g>
      <g transform="translate(30, 90)">
        <rect x="0" y="26" width="14" height="14" rx="2" fill={colors.ink} opacity="0.5"/>
        <rect x="22" y="12" width="14" height="28" rx="2" fill={colors.ink} opacity="0.75"/>
        <rect x="44" y="0" width="14" height="40" rx="2" fill={colors.ink}/>
        <text x="78" y="30" style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 500, fill: colors.ink }}>Bloom</text>
      </g>
      <g transform="translate(30, 150)">
        <path d="M 0 30 Q 15 0 30 15 T 60 30" stroke={colors.ink} strokeWidth="2.5" fill="none"/>
        <circle cx="0" cy="30" r="3" fill={colors.ink}/>
        <circle cx="30" cy="15" r="3" fill={colors.ink}/>
        <circle cx="60" cy="30" r="3" fill={colors.ink}/>
        <text x="78" y="30" style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 500, fill: colors.ink }}>Ripple</text>
      </g>
    </svg>
  );
}

function IllusVoicings({ colors, fontDisplay }) {
  // Stack of voicings increasing in spread
  return (
    <svg viewBox="0 0 260 220" style={{ width: '100%', maxWidth: 320 }}>
      {[
        { y: 20,  label: '2nds', dots: [120, 130, 140] },
        { y: 60,  label: '3rds', dots: [110, 130, 150] },
        { y: 100, label: '4ths', dots: [95, 130, 165] },
        { y: 140, label: '5ths', dots: [80, 130, 180] },
        { y: 180, label: '6ths', dots: [65, 130, 195] },
      ].map((row, i) => (
        <g key={i}>
          <text x="30" y={row.y + 12} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: colors.muted, letterSpacing: '0.1em' }}>
            {row.label}
          </text>
          <line x1="60" y1={row.y + 8} x2="230" y2={row.y + 8} stroke={colors.line} strokeWidth="1"/>
          {row.dots.map((x, j) => (
            <circle key={j} cx={x} cy={row.y + 8} r="6" fill={j === 0 ? colors.spice : colors.ink2}/>
          ))}
        </g>
      ))}
    </svg>
  );
}

function IllusScales({ colors, fontDisplay }) {
  const bars = [
    { c: '#C68E42', name: 'Major' },
    { c: '#5B5D8B', name: 'Minor' },
    { c: '#3A7087', name: 'Dorian' },
    { c: '#8B3A2C', name: 'Phryg' },
    { c: '#5C7856', name: 'Lydian' },
    { c: '#C64B3B', name: 'P·Dom' },
    { c: '#2D5E6B', name: 'Blues' },
    { c: '#9B7FBF', name: 'Whole' },
  ];
  return (
    <svg viewBox="0 0 260 220" style={{ width: '100%', maxWidth: 320 }}>
      {bars.map((b, i) => {
        const x = 20 + (i % 4) * 60;
        const y = 30 + Math.floor(i / 4) * 90;
        return (
          <g key={i}>
            <rect x={x} y={y} width={46} height={54} rx={6} fill={b.c}/>
            <text x={x + 23} y={y + 75} textAnchor="middle"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: colors.ink2 }}>
              {b.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function IllusBranch({ colors, fontDisplay }) {
  return (
    <svg viewBox="0 0 260 200" style={{ width: '100%', maxWidth: 320 }}>
      {/* Central chord */}
      <circle cx="130" cy="100" r="30" fill={colors.ink}/>
      <text x="130" y="110" textAnchor="middle"
        style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 500, fill: colors.paper, fontStyle: 'italic' }}>
        Em
      </text>
      {/* Six destination chords */}
      {[
        { label: 'Gm',  a: -Math.PI / 2,         c: '#9C5D6B' },
        { label: 'G',   a: -Math.PI / 6,         c: '#C68E42' },
        { label: 'Am',  a:  Math.PI / 6,         c: '#4C6E4E' },
        { label: 'Bm',  a:  Math.PI / 2,         c: '#3A7087' },
        { label: 'C',   a:  5 * Math.PI / 6,     c: '#C68E42' },
        { label: 'Cm',  a: -5 * Math.PI / 6,     c: '#9C5D6B' },
      ].map((d, i) => {
        const x = 130 + Math.cos(d.a) * 72;
        const y = 100 + Math.sin(d.a) * 72;
        return (
          <g key={i}>
            <line x1="130" y1="100" x2={x} y2={y} stroke={colors.line} strokeWidth="1.5"/>
            <circle cx={x} cy={y} r="18" fill={d.c} opacity="0.22"/>
            <circle cx={x} cy={y} r="18" fill="none" stroke={d.c} strokeWidth="1.5"/>
            <text x={x} y={y + 5} textAnchor="middle"
              style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 500, fill: d.c }}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function IllusPinboard({ colors, fontDisplay }) {
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', maxWidth: 340 }}>
      {[
        { x: 12,  c: '#5B5D8B', n: 'Em',  deg: 1 },
        { x: 80,  c: '#9C5D6B', n: 'Gm',  deg: 2 },
        { x: 148, c: '#C68E42', n: 'C',   deg: 3 },
        { x: 216, c: '#4C6E4E', n: 'Am',  deg: 4 },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y="40" width="58" height="100" rx="6" fill="#FBF6EA" stroke={p.c} strokeWidth="1.5"/>
          <circle cx={p.x + 12} cy="54" r="5" fill={p.c}/>
          <text x={p.x + 29} y="95" textAnchor="middle"
            style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, fill: colors.ink, fontStyle: p.deg === 3 ? 'normal' : 'italic' }}>
            {p.n}
          </text>
          <text x={p.x + 29} y="128" textAnchor="middle"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: p.c, letterSpacing: '0.08em' }}>
            #{i + 1}
          </text>
        </g>
      ))}
      {/* Connecting arrows with interval labels */}
      {[70, 138, 206].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="90" x2={x + 10} y2="90" stroke={colors.ink2} strokeWidth="1.5"/>
        </g>
      ))}
    </svg>
  );
}

function IllusShared({ colors, fontDisplay }) {
  const keys = [
    { x: 10,  pc: 'C', shared: false },
    { x: 34,  pc: 'D', shared: false },
    { x: 58,  pc: 'E', shared: true, count: 3 },
    { x: 82,  pc: 'F', shared: false },
    { x: 106, pc: 'G', shared: true, count: 2 },
    { x: 130, pc: 'A', shared: false },
    { x: 154, pc: 'B', shared: true, count: 2 },
    { x: 178, pc: 'C', shared: false },
  ];
  return (
    <svg viewBox="0 0 210 200" style={{ width: '100%', maxWidth: 280 }}>
      {keys.map((k, i) => (
        <g key={i}>
          <rect x={k.x} y={20} width={22} height={150} rx={3}
            fill={k.shared ? '#B88A2E' : (k.pc === 'C' || k.pc === 'D' || k.pc === 'E' || k.pc === 'G' ? '#3D3356' : '#FBFAF5')}
            stroke={k.shared ? '#B88A2E' : '#2A2A3A'} strokeWidth="1.2"/>
          {k.shared && (
            <g>
              <circle cx={k.x + 11} cy={40} r={13} fill="#F6F1E7" stroke="#B88A2E" strokeWidth="1.5"/>
              <text x={k.x + 11} y={45} textAnchor="middle"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, fill: '#8E6B22' }}>
                ×{k.count}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function IllusShortcuts({ colors, fontDisplay }) {
  return (
    <svg viewBox="0 0 260 220" style={{ width: '100%', maxWidth: 320 }}>
      {[
        { x: 30, y: 30, icon: '🎬', label: 'Tour' },
        { x: 140, y: 30, icon: '✨', label: 'Classic' },
        { x: 30, y: 110, icon: '🎭', label: 'Cinematic' },
        { x: 140, y: 110, icon: '↔', label: 'Flip' },
      ].map((tile, i) => (
        <g key={i}>
          <rect x={tile.x} y={tile.y} width={90} height={70} rx="8"
            fill={colors.paper} stroke={colors.line} strokeWidth="1"/>
          <text x={tile.x + 45} y={tile.y + 38} textAnchor="middle" style={{ fontSize: 26 }}>
            {tile.icon}
          </text>
          <text x={tile.x + 45} y={tile.y + 58} textAnchor="middle"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: colors.ink2, letterSpacing: '0.12em' }}>
            {tile.label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

function IllusFinale({ colors, fontDisplay }) {
  return (
    <svg viewBox="0 0 260 220" style={{ width: '100%', maxWidth: 320 }}>
      {/* a big sunrise */}
      <defs>
        <radialGradient id="sun" cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor="#E9B960"/>
          <stop offset="60%" stopColor="#C68E42" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#F6F1E7" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="260" height="220" fill="url(#sun)"/>
      <circle cx="130" cy="150" r="40" fill="#E9B960"/>
      {/* scattered musical dots */}
      {[
        [50, 80], [80, 50], [110, 70], [150, 40], [180, 65], [215, 85],
        [40, 130], [225, 135],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={colors.spice} opacity={0.7}/>
      ))}
      {/* staff lines */}
      {[170, 180, 190].map((y, i) => (
        <line key={i} x1="30" y1={y} x2="230" y2={y} stroke={colors.ink2} strokeWidth="0.5" opacity="0.35"/>
      ))}
    </svg>
  );
}
